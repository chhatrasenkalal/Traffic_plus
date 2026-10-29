// Comprehensive Incident Engine for TrafficPulse Digital Twin
import {
  Incident,
  IncidentEvidence,
  IncidentSeverity,
  IncidentStage,
  IncidentType,
  PhaseId,
} from '../types';
import { addAuditLog } from './auditLog';
import { APP_EVENTS, eventBus } from './eventBus';
import { routeNotificationBySeverity } from './notifications';
import { getCurrentWeather } from './weather';

const STORAGE_KEY_INCIDENTS = 'trafficpulse_incidents_v2';

export function calculateIncidentSeverity(params: {
  vehiclesInvolved: number;
  blockedLanes: number;
  peopleInvolved: number;
  fireSmokePresent: boolean;
  trafficImpactScore: number;
  secondaryRiskScore: number;
  weatherFrictionCoefficient: number;
}): { severity: IncidentSeverity; compositeScore: number } {
  const {
    vehiclesInvolved,
    blockedLanes,
    peopleInvolved,
    fireSmokePresent,
    trafficImpactScore,
    secondaryRiskScore,
    weatherFrictionCoefficient,
  } = params;

  // Composite calculation
  let score = 0;
  score += Math.min(30, vehiclesInvolved * 10);
  score += Math.min(25, blockedLanes * 12.5);
  score += Math.min(20, peopleInvolved * 5);
  if (fireSmokePresent) score += 25;
  score += trafficImpactScore * 0.15;
  score += secondaryRiskScore * 0.15;

  // Weather multiplier: slick roads increase severity
  const weatherRiskFactor = (1.1 - weatherFrictionCoefficient) * 20;
  score += Math.max(0, weatherRiskFactor);

  let severity: IncidentSeverity = 'LOW';
  if (score >= 75) {
    severity = 'CRITICAL';
  } else if (score >= 50) {
    severity = 'HIGH';
  } else if (score >= 25) {
    severity = 'MEDIUM';
  } else {
    severity = 'LOW';
  }

  return { severity, compositeScore: Math.round(score) };
}

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    type: 'crash',
    title: 'Two-Car Rear-End Collision',
    junctionId: 'J1_CENTRAL',
    phase: 'phaseA',
    direction: 'Northbound',
    locationDesc: 'J1 Central Square approach lane 2 near crosswalk',
    stage: 'Confirmed',
    severity: 'HIGH',
    vehiclesInvolved: 2,
    blockedLanes: 1,
    peopleInvolved: 3,
    fireSmokePresent: false,
    trafficImpactScore: 68,
    secondaryRiskScore: 54,
    aiConfidence: 94,
    evidence: {
      cameraConfidence: 94,
      sensorOccupancyRate: 88,
      corroboratingReportsCount: 2,
      anomalyScore: 82,
      detectedAtSimTime: 120,
      description: 'Edge Camera 01 detected rapid vehicular deceleration with persistent lane blockage.',
    },
    simTimeCreated: 120,
    greenCorridorActive: false,
    history: [
      { stage: 'Potential', timestamp: '08:02 AM', note: 'Sudden radar speed drop detected (45 -> 0 km/h).' },
      { stage: 'AI confidence', timestamp: '08:02 AM', note: 'Vision model confirms vehicle occlusion (94% confidence).' },
      { stage: 'Verification', timestamp: '08:03 AM', note: 'Cross-checked with 2 citizen mobile reports.' },
      { stage: 'Severity', timestamp: '08:03 AM', note: 'Severity computed as HIGH (1 blocked arterial lane, 3 occupants).' },
      { stage: 'Confirmed', timestamp: '08:04 AM', note: 'Dispatched to Police & Emergency Services triage.' },
    ],
  },
  {
    id: 'INC-102',
    type: 'breakdown',
    title: 'Stalled Delivery Van at Curb',
    junctionId: 'J3_WEST',
    phase: 'phaseB',
    direction: 'Eastbound',
    locationDesc: 'J3 West Commercial Boulevard shoulder lane',
    stage: 'Confirmed',
    severity: 'LOW',
    vehiclesInvolved: 1,
    blockedLanes: 0,
    peopleInvolved: 1,
    fireSmokePresent: false,
    trafficImpactScore: 22,
    secondaryRiskScore: 18,
    aiConfidence: 91,
    evidence: {
      cameraConfidence: 91,
      sensorOccupancyRate: 35,
      corroboratingReportsCount: 1,
      anomalyScore: 25,
      detectedAtSimTime: 300,
      description: 'Vehicle hazard lights detected stationary on shoulder.',
    },
    simTimeCreated: 300,
    greenCorridorActive: false,
    history: [
      { stage: 'Potential', timestamp: '08:05 AM', note: 'Vehicle stationary on shoulder lane.' },
      { stage: 'Confirmed', timestamp: '08:06 AM', note: 'Classified as LOW severity advisory.' },
    ],
  },
];

class IncidentEngine {
  private incidents: Map<string, Incident> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (saved) {
        const parsed: Incident[] = JSON.parse(saved);
        parsed.forEach((inc) => this.incidents.set(inc.id, inc));
        return;
      }
    } catch (e) {}

    SEED_INCIDENTS.forEach((inc) => this.incidents.set(inc.id, inc));
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(this.getAllIncidents()));
    } catch (e) {}
  }

  public getAllIncidents(): Incident[] {
    return Array.from(this.incidents.values()).sort((a, b) => {
      // Sort by Severity first (CRITICAL > HIGH > MEDIUM > LOW), then by creation time
      const severityRank: Record<IncidentSeverity, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      const diff = severityRank[b.severity] - severityRank[a.severity];
      if (diff !== 0) return diff;
      return b.simTimeCreated - a.simTimeCreated;
    });
  }

  public getActiveIncidents(): Incident[] {
    return this.getAllIncidents().filter((i) => i.stage !== 'Resolved');
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  /**
   * Pipeline progression: Potential -> AI confidence -> Verification -> Severity -> Confirmed
   */
  public advanceIncidentStage(
    incidentId: string,
    targetStage: IncidentStage,
    actor: string = 'Autonomous Incident Pipeline',
    note?: string,
    simTime: number = 0
  ): Incident | undefined {
    const inc = this.incidents.get(incidentId);
    if (!inc) return undefined;

    inc.stage = targetStage;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    inc.history.push({
      stage: targetStage,
      timestamp: nowStr,
      note: note || `Advanced to ${targetStage} stage by ${actor}`,
    });

    if (targetStage === 'Resolved') {
      inc.simTimeResolved = simTime;
      inc.greenCorridorActive = false;
      eventBus.emit(APP_EVENTS.INCIDENT_RESOLVED, inc);
    } else {
      eventBus.emit(APP_EVENTS.INCIDENT_UPDATED, inc);
    }

    addAuditLog(
      actor,
      `Incident Stage Transition: ${targetStage}`,
      `${inc.id} (${inc.title})`,
      'Incident Engine Pipeline',
      'Success',
      note || `Incident updated to ${targetStage}.`,
      simTime
    );

    this.saveToStorage();
    return inc;
  }

  /**
   * Injects a complete incident and progresses it through the 5-stage pipeline
   */
  public injectIncident(params: {
    type: IncidentType;
    title: string;
    junctionId: string;
    phase: PhaseId;
    direction: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound';
    locationDesc: string;
    vehiclesInvolved?: number;
    blockedLanes?: number;
    peopleInvolved?: number;
    fireSmokePresent?: boolean;
    trafficImpactScore?: number;
    secondaryRiskScore?: number;
    simTime?: number;
    actor?: string;
  }): Incident {
    const weather = getCurrentWeather();
    const id = `INC-${Date.now().toString().slice(-4)}`;
    const simTime = params.simTime || 0;

    const { severity, compositeScore } = calculateIncidentSeverity({
      vehiclesInvolved: params.vehiclesInvolved ?? 2,
      blockedLanes: params.blockedLanes ?? 1,
      peopleInvolved: params.peopleInvolved ?? 2,
      fireSmokePresent: params.fireSmokePresent ?? false,
      trafficImpactScore: params.trafficImpactScore ?? 75,
      secondaryRiskScore: params.secondaryRiskScore ?? 60,
      weatherFrictionCoefficient: weather.frictionCoefficient,
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id,
      type: params.type,
      title: params.title,
      junctionId: params.junctionId,
      phase: params.phase,
      direction: params.direction,
      locationDesc: params.locationDesc,
      stage: 'Confirmed', // Progressed through verified pipeline
      severity,
      vehiclesInvolved: params.vehiclesInvolved ?? 2,
      blockedLanes: params.blockedLanes ?? 1,
      peopleInvolved: params.peopleInvolved ?? 2,
      fireSmokePresent: params.fireSmokePresent ?? false,
      trafficImpactScore: params.trafficImpactScore ?? 75,
      secondaryRiskScore: params.secondaryRiskScore ?? 60,
      aiConfidence: 96,
      evidence: {
        cameraConfidence: 96,
        sensorOccupancyRate: 91,
        corroboratingReportsCount: 2,
        anomalyScore: compositeScore,
        detectedAtSimTime: simTime,
        description: `Automated Multi-Modal Fusion: Vision detected ${params.type} with ${params.blockedLanes ?? 1} lane blockage under ${weather.label}.`,
      },
      simTimeCreated: simTime,
      greenCorridorActive: false,
      history: [
        { stage: 'Potential', timestamp: nowStr, note: 'Radar sensor detects sudden stoppage in corridor.' },
        { stage: 'AI confidence', timestamp: nowStr, note: 'Computer vision confirms vehicle blockage (96% confidence).' },
        { stage: 'Verification', timestamp: nowStr, note: 'Corroborated with multi-sensor telemetry.' },
        { stage: 'Severity', timestamp: nowStr, note: `Severity computed as ${severity} (Score: ${compositeScore}/100).` },
        { stage: 'Confirmed', timestamp: nowStr, note: 'Confirmed by Autonomous Incident Engine. Notification routed.' },
      ],
    };

    this.incidents.set(id, newIncident);
    this.saveToStorage();

    // Route notification based on severity
    routeNotificationBySeverity(
      severity,
      `🚨 ${severity} Incident: ${params.title}`,
      `At ${params.junctionId} (${params.direction}). ${params.blockedLanes ?? 1} lane(s) blocked.`,
      id,
      undefined,
      simTime
    );

    addAuditLog(
      params.actor || 'Incident Engine / Simulation Injector',
      `Incident Confirmed [${severity}]`,
      `${id}: ${params.title}`,
      'Multi-Modal Fusion Pipeline',
      'Success',
      `Stage: Confirmed. Vehicles: ${params.vehiclesInvolved ?? 2}, Blocked Lanes: ${params.blockedLanes ?? 1}, People: ${params.peopleInvolved ?? 2}`,
      simTime
    );

    eventBus.emit(APP_EVENTS.INCIDENT_DETECTED, newIncident);
    return newIncident;
  }

  public resolveIncident(id: string, actor: string = 'Operator', simTime: number = 0): Incident | undefined {
    return this.advanceIncidentStage(id, 'Resolved', actor, 'Incident cleared by field responders.', simTime);
  }

  /**
   * Creates an incident at initial stage 'Potential' for the exhibition demonstration
   */
  public createPotentialIncident(params?: {
    id?: string;
    type?: IncidentType;
    title?: string;
    junctionId?: string;
    phase?: PhaseId;
    direction?: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound';
    locationDesc?: string;
    vehiclesInvolved?: number;
    blockedLanes?: number;
    peopleInvolved?: number;
    fireSmokePresent?: boolean;
    trafficImpactScore?: number;
    secondaryRiskScore?: number;
    simTime?: number;
    actor?: string;
  }): Incident {
    const id = params?.id || 'INC-DEMO-001';
    const weather = getCurrentWeather();
    const simTime = params?.simTime || 0;

    const { severity, compositeScore } = calculateIncidentSeverity({
      vehiclesInvolved: params?.vehiclesInvolved ?? 2,
      blockedLanes: params?.blockedLanes ?? 1,
      peopleInvolved: params?.peopleInvolved ?? 2,
      fireSmokePresent: params?.fireSmokePresent ?? false,
      trafficImpactScore: params?.trafficImpactScore ?? 65,
      secondaryRiskScore: params?.secondaryRiskScore ?? 50,
      weatherFrictionCoefficient: weather.frictionCoefficient,
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id,
      type: params?.type || 'crash',
      title: params?.title || 'Two-Car Incident (Simulated)',
      junctionId: params?.junctionId || 'J1_CENTRAL',
      phase: params?.phase || 'phaseA',
      direction: params?.direction || 'Northbound',
      locationDesc: params?.locationDesc || 'J1 Central Square approach lane 2 near crosswalk',
      stage: 'Potential',
      severity,
      vehiclesInvolved: params?.vehiclesInvolved ?? 2,
      blockedLanes: params?.blockedLanes ?? 1,
      peopleInvolved: params?.peopleInvolved ?? 2,
      fireSmokePresent: params?.fireSmokePresent ?? false,
      trafficImpactScore: params?.trafficImpactScore ?? 65,
      secondaryRiskScore: params?.secondaryRiskScore ?? 50,
      aiConfidence: 94,
      evidence: {
        cameraConfidence: 94,
        sensorOccupancyRate: 88,
        corroboratingReportsCount: 2,
        anomalyScore: compositeScore,
        detectedAtSimTime: simTime,
        description: 'Edge Camera 01 optical bounding box detection flagged rapid deceleration.',
      },
      simTimeCreated: simTime,
      greenCorridorActive: false,
      history: [
        { stage: 'Potential', timestamp: nowStr, note: 'Radar speed anomaly & sudden optical deceleration.' },
      ],
    };

    this.incidents.set(id, newIncident);
    this.saveToStorage();
    eventBus.emit(APP_EVENTS.INCIDENT_DETECTED, newIncident);
    return newIncident;
  }

  /**
   * Safely removes an incident by ID without corrupting persistent state
   */
  public removeIncident(id: string): void {
    if (this.incidents.has(id)) {
      this.incidents.delete(id);
      this.saveToStorage();
      eventBus.emit(APP_EVENTS.INCIDENT_RESOLVED, { id } as Incident);
    }
  }
}

export const incidentEngine = new IncidentEngine();
