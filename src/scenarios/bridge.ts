// Bridge between Pure Scenario Engine and TrafficPulse Services
// This is the ONLY file that interacts with existing system services:
// incidents / emergency / greenCorridor / notifications / auditLog.

import { addAuditLog } from '../services/auditLog';
import { emergencyEngine } from '../services/emergency';
import { APP_EVENTS, eventBus } from '../services/eventBus';
import {
  activateGreenCorridor as triggerGreenCorridor,
  deactivateGreenCorridor as cancelGreenCorridor,
} from '../services/greenCorridor';
import { incidentEngine } from '../services/incidents';
import { routeNotificationBySeverity } from '../services/notifications';
import { DEMO_IDS } from './config';
import { ScenarioStage, ScenarioState } from './types';

let lastSyncedStage: ScenarioStage | null = null;
let lastSyncedStepIndex: number | null = null;

export const scenarioBridge = {
  /**
   * Synchronizes scenario state transitions to existing application stores
   */
  syncScenarioTransition(state: ScenarioState): void {
    // Avoid redundant calls if stage hasn't changed
    if (lastSyncedStage === state.stage && lastSyncedStepIndex === state.demoStepIndex) {
      return;
    }
    lastSyncedStage = state.stage;
    lastSyncedStepIndex = state.demoStepIndex;

    const actor = DEMO_IDS.ACTOR_NAME;

    switch (state.stage) {
      case 'MONITORING':
        // If coming back to monitoring, resolve or clean up demo incident
        incidentEngine.removeIncident(DEMO_IDS.INCIDENT_ID);
        cancelGreenCorridor(0, 'Demo reset to normal baseline');
        emergencyEngine.updateUnitState('UNIT-POL-1', 'Available', 0, actor);
        emergencyEngine.updateUnitState('UNIT-MED-1', 'Available', 0, actor);
        break;

      case 'COLLISION':
      case 'POTENTIAL':
        incidentEngine.createPotentialIncident({
          id: DEMO_IDS.INCIDENT_ID,
          title: 'Two-Car Incident (Simulated Demonstration)',
          junctionId: DEMO_IDS.JUNCTION_ID,
          actor,
        });
        routeNotificationBySeverity(
          'HIGH',
          '🚨 Potential Collision Detected (Simulation)',
          'Two civilian vehicles stopped in J1 Northbound Lane 2. Computer vision bounding box placed.',
          DEMO_IDS.INCIDENT_ID,
          undefined,
          state.elapsedSeconds
        );
        addAuditLog(
          actor,
          'Incident Potential Flagged',
          `${DEMO_IDS.INCIDENT_ID}: J1 Central Square`,
          'Computer Vision Edge Detector',
          'Success',
          'Potential crash detected. Awaiting multi-modal sensor fusion verification.',
          state.elapsedSeconds
        );
        break;

      case 'AI_ANALYSIS':
      case 'SENSOR_VERIFICATION':
      case 'CONFIRMED':
        if (!state.sensorOutageSimulated) {
          incidentEngine.advanceIncidentStage(
            DEMO_IDS.INCIDENT_ID,
            'Confirmed',
            actor,
            'Multi-modal corroboration: Optical camera 01 (96%) + Inductive loop sensor L-12 (91%).',
            state.elapsedSeconds
          );
          addAuditLog(
            actor,
            'Incident Confirmed (AI Fusion)',
            `${DEMO_IDS.INCIDENT_ID}: J1 Central Square`,
            'Multi-Modal Fusion Pipeline',
            'Success',
            'Corroborated by inductive loop occupancy stall (91%). Incident marked Confirmed.',
            state.elapsedSeconds
          );
        } else {
          addAuditLog(
            actor,
            'Sensor Outage Fallback',
            `${DEMO_IDS.INCIDENT_ID}: J1 Central Square`,
            'Hardware Integrity Daemon',
            'Fallback',
            'Inductive loop telemetry unavailable. Incident held at Unverified — operator confirmation required.',
            state.elapsedSeconds
          );
        }
        break;

      case 'POLICE_NOTIFIED':
      case 'POLICE_DISPATCHED':
        emergencyEngine.dispatchUnit(
          'UNIT-POL-1',
          DEMO_IDS.INCIDENT_ID,
          DEMO_IDS.JUNCTION_ID,
          state.elapsedSeconds,
          actor
        );
        routeNotificationBySeverity(
          'HIGH',
          '🚔 Police Unit Dispatched (Simulation)',
          'Cruiser-104 dispatched to J1 Central Square. Estimated arrival ~35s.',
          DEMO_IDS.INCIDENT_ID,
          'UNIT-POL-1',
          state.elapsedSeconds
        );
        addAuditLog(
          actor,
          'Unit Dispatched: Cruiser-104',
          `Incident ${DEMO_IDS.INCIDENT_ID} at J1_CENTRAL`,
          'Police CAD Terminal (Simulated)',
          'Success',
          'Police cruiser assigned to secure accident perimeter.',
          state.elapsedSeconds
        );
        break;

      case 'AMBULANCE_ASSIGNED':
      case 'AMBULANCE_DISPATCHED':
        emergencyEngine.dispatchUnit(
          'UNIT-MED-1',
          DEMO_IDS.INCIDENT_ID,
          DEMO_IDS.JUNCTION_ID,
          state.elapsedSeconds,
          actor
        );
        routeNotificationBySeverity(
          'CRITICAL',
          '🚑 Paramedic Unit Dispatched (Simulation)',
          'Medic-14 dispatched to J1 Central Square. Harbor Memorial Hospital triage assigned.',
          DEMO_IDS.INCIDENT_ID,
          'UNIT-MED-1',
          state.elapsedSeconds
        );
        addAuditLog(
          actor,
          'Ambulance Dispatched: Medic-14',
          `Hospital: Harbor Memorial Hospital (HOSP-01)`,
          'EMS CAD Terminal (Simulated)',
          'Success',
          'Hospital recommendation score: 92/100 (8 ICU beds available).',
          state.elapsedSeconds
        );
        break;

      case 'CORRIDOR_ACTIVE':
        try {
          triggerGreenCorridor({
            unitId: 'UNIT-MED-1',
            incidentId: DEMO_IDS.INCIDENT_ID,
            startJunctionId: 'J4_EAST',
            targetJunctionId: DEMO_IDS.JUNCTION_ID,
            targetPhase: 'phaseA',
            simTime: state.elapsedSeconds,
          });
        } catch (e) {
          // Preemption handled cleanly
        }
        addAuditLog(
          actor,
          'Green Wave Corridor Activated',
          'Path: J4_EAST -> J1_CENTRAL',
          'Signal Preemption Layer (Simulated)',
          'Success',
          'Cross-traffic held at all-red. Signal preempted to Phase A green wave.',
          state.elapsedSeconds
        );
        break;

      case 'SITE_SECURED':
      case 'RESCUE':
        emergencyEngine.updateUnitState('UNIT-POL-1', 'On scene', state.elapsedSeconds, actor);
        emergencyEngine.updateUnitState('UNIT-MED-1', 'On scene', state.elapsedSeconds, actor);
        addAuditLog(
          actor,
          'Accident Site Secured & Rescue Active',
          'J1 Central Square (Lane 2)',
          'Incident Command (Simulated)',
          'Success',
          'Safety perimeter active. Medical status: Professional assessment required.',
          state.elapsedSeconds
        );
        break;

      case 'CLEARANCE_INSPECT':
      case 'CLEARANCE_TOW':
      case 'CLEARANCE_DEBRIS':
      case 'CLEARANCE_ROAD_INSPECT':
      case 'CLEARANCE_AUTHORIZED':
        addAuditLog(
          actor,
          `Road Clearance Step ${state.clearanceStep}/6`,
          'J1 Central Square',
          'Clearance Operations (Simulated)',
          'Success',
          `Vehicles moved: ${state.vehiclesMoved}. Debris swept: ${state.debrisRemoved}. Road inspected: ${state.roadInspectionPassed}.`,
          state.elapsedSeconds
        );
        break;

      case 'PEDESTRIAN_PROTECTED':
        addAuditLog(
          actor,
          'Pedestrian Safe Passage Activated',
          'Northern Crosswalk J1_CENTRAL',
          'Smart Crosswalk Controller',
          'Success',
          'Barricades placed. Pedestrians re-routed across southern protected crossing.',
          state.elapsedSeconds
        );
        break;

      case 'RESTORATION':
      case 'RECOVERED':
      case 'REPORT':
        incidentEngine.resolveIncident(DEMO_IDS.INCIDENT_ID, actor, state.elapsedSeconds);
        cancelGreenCorridor(state.elapsedSeconds, 'Incident cleared; road reopened');
        emergencyEngine.updateUnitState('UNIT-POL-1', 'Available', state.elapsedSeconds, actor);
        emergencyEngine.updateUnitState('UNIT-MED-1', 'Available', state.elapsedSeconds, actor);
        addAuditLog(
          actor,
          'Traffic Flow Restored',
          'J1 Central Square',
          'Autonomous Traffic Manager',
          'Success',
          'All lanes reopened. Average speed recovered to 46 km/h. Demonstration report generated.',
          state.elapsedSeconds
        );
        break;
    }
  },

  /**
   * Resets demo data from storage cleanly without erasing real user or seed records
   */
  cleanupDemoData(): void {
    lastSyncedStage = null;
    lastSyncedStepIndex = null;
    incidentEngine.removeIncident(DEMO_IDS.INCIDENT_ID);
    cancelGreenCorridor(0, 'Demo reset');
    emergencyEngine.updateUnitState('UNIT-POL-1', 'Available', 0, DEMO_IDS.ACTOR_NAME);
    emergencyEngine.updateUnitState('UNIT-MED-1', 'Available', 0, DEMO_IDS.ACTOR_NAME);
  },
};
