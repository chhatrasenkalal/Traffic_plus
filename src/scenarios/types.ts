// TrafficPulse Interactive Accident Scenario Types
import { IncidentSeverity, IncidentType, PhaseId, SignalState } from '../types';

export type ScenarioId =
  | 'normal'
  | 'collision'
  | 'ai_verification'
  | 'police_dispatch'
  | 'ambulance_hospital'
  | 'green_corridor'
  | 'rescue_safety'
  | 'road_clearance'
  | 'pedestrian_safety'
  | 'traffic_restoration'
  | 'full_demo';

export type ScenarioStage =
  | 'IDLE'
  | 'MONITORING'
  | 'COLLISION'
  | 'POTENTIAL'
  | 'AI_ANALYSIS'
  | 'SENSOR_VERIFICATION'
  | 'UNVERIFIED_FALLBACK'
  | 'CONFIRMED'
  | 'POLICE_NOTIFIED'
  | 'POLICE_DISPATCHED'
  | 'AMBULANCE_ASSIGNED'
  | 'AMBULANCE_DISPATCHED'
  | 'CORRIDOR_ACTIVE'
  | 'SITE_SECURED'
  | 'RESCUE'
  | 'CLEARANCE_INSPECT'
  | 'CLEARANCE_TOW'
  | 'CLEARANCE_DEBRIS'
  | 'CLEARANCE_ROAD_INSPECT'
  | 'CLEARANCE_AUTHORIZED'
  | 'PEDESTRIAN_PROTECTED'
  | 'RESTORATION'
  | 'RECOVERED'
  | 'REPORT';

export type LaneStatus =
  | 'blocked'
  | 'clearance_in_progress'
  | 'inspection_pending'
  | 'cleared_for_reopening';

export type ClearanceStepNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SignalPlanState {
  junctionId: string;
  phaseA: SignalState; // North-South
  phaseB: SignalState; // East-West
  isTransitioning: boolean;
  allRedActive: boolean;
  timeInPhase: number;
}

export interface ScenarioVehicle {
  id: string;
  type: 'car_blue' | 'car_silver' | 'police' | 'ambulance' | 'tow_truck' | 'civilian';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotation: number;
  speed: number;
  status: 'flowing' | 'collided' | 'stopped' | 'yielding' | 'towed' | 'dispatched';
  lane: 'north_1' | 'north_2' | 'south_1' | 'south_2' | 'east_1' | 'west_1';
}

export interface PedestrianRouteState {
  active: boolean;
  crosswalkBlocked: boolean;
  safeRouteActive: boolean;
  alternativeRoutePath: { x: number; y: number }[];
  holdActive: boolean;
  waitingCount: number;
  safetyScore: number;
}

export interface ScenarioState {
  activeScenarioId: ScenarioId;
  stage: ScenarioStage;
  simTimestamp: string;
  elapsedSeconds: number;
  isDemoRunning: boolean;
  demoProgress: number; // 0 - 100%
  demoStepIndex: number; // 0 - 9 for the 10 stages
  playbackSpeed: 1 | 2 | 4;

  // Verification & Outage Flag
  sensorOutageSimulated: boolean;
  verificationStatus: 'Pending' | 'AI Confirmed' | 'Unverified — operator confirmation required';
  aiConfidence: number;
  cameraConfidence: number;
  sensorOccupancyRate: number;

  // Multi-Agency State
  policeNotified: boolean;
  policeDispatched: boolean;
  policeEtaSeconds: number;
  ambulanceAssigned: boolean;
  ambulanceDispatched: boolean;
  ambulanceEtaSeconds: number;
  assignedHospitalId: string;
  hospitalRecommendationReason: string;

  // Corridor & Signals
  greenCorridorActive: boolean;
  signalPlan: SignalPlanState;
  corridorPreemptedJunctions: string[];
  conflictCheckPassed: boolean;

  // Rescue & Site
  siteSecured: boolean;
  safetyPerimeterActive: boolean;
  emergencyAccessZoneClear: boolean;
  victimAssistanceStatus: string;
  secondaryCollisionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  responderInZone: boolean;

  // Clearance Sequence
  clearanceStep: ClearanceStepNumber;
  laneStatus: LaneStatus;
  vehiclesMoved: boolean;
  debrisRemoved: boolean;
  roadInspectionPassed: boolean;
  clearanceAuthorized: boolean;
  clearanceOfficerBadge: string;

  // Pedestrian Safety
  pedestrians: PedestrianRouteState;

  // Traffic Restoration
  trafficFlowRestored: boolean;
  vehicleCount: number;
  trafficDensityPercent: number;
  averageSpeedKmh: number;

  // Log & Errors
  actionError: string | null;
  eventLogs: ScenarioLogEntry[];
}

export interface ScenarioLogEntry {
  id: string;
  timestamp: string;
  stage: ScenarioStage;
  actor: string;
  action: string;
  details: string;
  isSimulated: boolean;
}

export type ScenarioAction =
  | { type: 'SELECT_SCENARIO'; scenarioId: ScenarioId }
  | { type: 'START_FULL_DEMO' }
  | { type: 'PAUSE_FULL_DEMO' }
  | { type: 'RESUME_FULL_DEMO' }
  | { type: 'RESET_DEMO' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'JUMP_TO_STEP'; stepIndex: number }
  | { type: 'SET_PLAYBACK_SPEED'; speed: 1 | 2 | 4 }
  | { type: 'TICK'; deltaSeconds: number }
  | { type: 'TOGGLE_SENSOR_OUTAGE'; outage: boolean }
  | { type: 'TRIGGER_COLLISION' }
  | { type: 'VERIFY_INCIDENT' }
  | { type: 'DISPATCH_POLICE' }
  | { type: 'DISPATCH_AMBULANCE' }
  | { type: 'ACTIVATE_GREEN_CORRIDOR' }
  | { type: 'START_RESCUE' }
  | { type: 'ADVANCE_CLEARANCE_STEP'; targetStep?: ClearanceStepNumber }
  | { type: 'ACTIVATE_SAFE_PEDESTRIAN_ROUTE' }
  | { type: 'RESTORE_TRAFFIC_FLOW' }
  | { type: 'CLEAR_ACTION_ERROR' };
