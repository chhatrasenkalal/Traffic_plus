// Pure Reducer and State Machine for TrafficPulse Scenario Simulation
import { ORDERED_DEMO_SEQUENCE, SCENARIO_METADATA } from './config';
import { FULL_DEMO_TIMELINE } from './timeline';
import {
  ClearanceStepNumber,
  LaneStatus,
  PedestrianRouteState,
  ScenarioAction,
  ScenarioId,
  ScenarioLogEntry,
  ScenarioStage,
  ScenarioState,
  SignalPlanState,
} from './types';

export const INITIAL_SIGNAL_PLAN: SignalPlanState = {
  junctionId: 'J1_CENTRAL',
  phaseA: 'green',
  phaseB: 'red',
  isTransitioning: false,
  allRedActive: false,
  timeInPhase: 14,
};

export const INITIAL_PEDESTRIANS: PedestrianRouteState = {
  active: false,
  crosswalkBlocked: false,
  safeRouteActive: false,
  alternativeRoutePath: [
    { x: 30, y: 70 },
    { x: 30, y: 85 },
    { x: 70, y: 85 },
    { x: 70, y: 70 },
  ],
  holdActive: false,
  waitingCount: 8,
  safetyScore: 98,
};

export const INITIAL_SCENARIO_STATE: ScenarioState = {
  activeScenarioId: 'normal',
  stage: 'MONITORING',
  simTimestamp: '08:00:00 AM',
  elapsedSeconds: 0,
  isDemoRunning: false,
  demoProgress: 10,
  demoStepIndex: 0,
  playbackSpeed: 1,

  sensorOutageSimulated: false,
  verificationStatus: 'Pending',
  aiConfidence: 0,
  cameraConfidence: 96,
  sensorOccupancyRate: 28,

  policeNotified: false,
  policeDispatched: false,
  policeEtaSeconds: 0,
  ambulanceAssigned: false,
  ambulanceDispatched: false,
  ambulanceEtaSeconds: 0,
  assignedHospitalId: 'HOSP-01',
  hospitalRecommendationReason: 'Level 1 Trauma center with 8 open ICU beds. 4.2 min transit time.',

  greenCorridorActive: false,
  signalPlan: { ...INITIAL_SIGNAL_PLAN },
  corridorPreemptedJunctions: [],
  conflictCheckPassed: true,

  siteSecured: false,
  safetyPerimeterActive: false,
  emergencyAccessZoneClear: true,
  victimAssistanceStatus: 'Normal Traffic Conditions',
  secondaryCollisionRisk: 'LOW',
  responderInZone: false,

  clearanceStep: 0,
  laneStatus: 'cleared_for_reopening',
  vehiclesMoved: true,
  debrisRemoved: true,
  roadInspectionPassed: true,
  clearanceAuthorized: true,
  clearanceOfficerBadge: 'OFFICER-#4028',

  pedestrians: { ...INITIAL_PEDESTRIANS },

  trafficFlowRestored: true,
  vehicleCount: 42,
  trafficDensityPercent: 28,
  averageSpeedKmh: 44,

  actionError: null,
  eventLogs: [
    {
      id: 'LOG-001',
      timestamp: '08:00:00 AM',
      stage: 'MONITORING',
      actor: 'System Baseline',
      action: 'Monitoring Initialized',
      details: 'All 4 junction controllers active in adaptive mode. All sensors online.',
      isSimulated: true,
    },
  ],
};

/**
 * Pure function: Builds the exact precondition state for ANY of the 11 scenarios
 * so each button runs independently without requiring earlier scenarios to run first.
 */
export function buildPreconditionState(target: ScenarioId | ScenarioStage): ScenarioState {
  const base: ScenarioState = {
    ...INITIAL_SCENARIO_STATE,
    eventLogs: [...INITIAL_SCENARIO_STATE.eventLogs],
    signalPlan: { ...INITIAL_SIGNAL_PLAN },
    pedestrians: { ...INITIAL_PEDESTRIANS },
  };

  switch (target) {
    case 'normal':
    case 'IDLE':
    case 'MONITORING':
      return {
        ...base,
        activeScenarioId: 'normal',
        stage: 'MONITORING',
        demoStepIndex: 0,
        demoProgress: 10,
        laneStatus: 'cleared_for_reopening',
        victimAssistanceStatus: 'Normal Traffic Conditions',
        secondaryCollisionRisk: 'LOW',
        trafficFlowRestored: true,
        vehicleCount: 44,
        trafficDensityPercent: 28,
        averageSpeedKmh: 44,
      };

    case 'collision':
    case 'COLLISION':
    case 'POTENTIAL':
      return {
        ...base,
        activeScenarioId: 'collision',
        stage: 'POTENTIAL',
        demoStepIndex: 1,
        demoProgress: 20,
        simTimestamp: '08:01:12 AM',
        laneStatus: 'blocked',
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        cameraConfidence: 94,
        sensorOccupancyRate: 88,
        aiConfidence: 94,
        victimAssistanceStatus: 'Professional assessment required (non-graphic)',
        secondaryCollisionRisk: 'HIGH',
        vehicleCount: 68,
        trafficDensityPercent: 62,
        averageSpeedKmh: 14,
        actionError: null,
      };

    case 'ai_verification':
    case 'AI_ANALYSIS':
    case 'SENSOR_VERIFICATION':
    case 'CONFIRMED':
      return {
        ...base,
        activeScenarioId: 'ai_verification',
        stage: 'CONFIRMED',
        demoStepIndex: 2,
        demoProgress: 30,
        simTimestamp: '08:01:34 AM',
        laneStatus: 'blocked',
        verificationStatus: 'AI Confirmed',
        aiConfidence: 96,
        cameraConfidence: 96,
        sensorOccupancyRate: 91,
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        victimAssistanceStatus: 'Professional assessment required (non-graphic)',
        secondaryCollisionRisk: 'HIGH',
        vehicleCount: 72,
        trafficDensityPercent: 68,
        averageSpeedKmh: 12,
      };

    case 'police_dispatch':
    case 'POLICE_NOTIFIED':
    case 'POLICE_DISPATCHED':
      return {
        ...base,
        activeScenarioId: 'police_dispatch',
        stage: 'POLICE_DISPATCHED',
        demoStepIndex: 3,
        demoProgress: 40,
        simTimestamp: '08:02:10 AM',
        laneStatus: 'blocked',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: true,
        policeEtaSeconds: 35,
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        victimAssistanceStatus: 'Professional assessment required (non-graphic)',
        secondaryCollisionRisk: 'HIGH',
        vehicleCount: 76,
        trafficDensityPercent: 74,
        averageSpeedKmh: 10,
      };

    case 'ambulance_hospital':
    case 'AMBULANCE_ASSIGNED':
    case 'AMBULANCE_DISPATCHED':
      return {
        ...base,
        activeScenarioId: 'ambulance_hospital',
        stage: 'AMBULANCE_DISPATCHED',
        demoStepIndex: 4,
        demoProgress: 50,
        simTimestamp: '08:02:45 AM',
        laneStatus: 'blocked',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: true,
        policeEtaSeconds: 20,
        ambulanceAssigned: true,
        ambulanceDispatched: true,
        ambulanceEtaSeconds: 42,
        assignedHospitalId: 'HOSP-01',
        hospitalRecommendationReason: 'Trauma Specialty Center with 8 available ICU beds. Estimated transit time: 4.2 min.',
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        victimAssistanceStatus: 'Professional assessment required (non-graphic)',
        secondaryCollisionRisk: 'MEDIUM',
        vehicleCount: 78,
        trafficDensityPercent: 76,
        averageSpeedKmh: 9,
      };

    case 'green_corridor':
    case 'CORRIDOR_ACTIVE':
      return {
        ...base,
        activeScenarioId: 'green_corridor',
        stage: 'CORRIDOR_ACTIVE',
        demoStepIndex: 5,
        demoProgress: 60,
        simTimestamp: '08:03:15 AM',
        laneStatus: 'blocked',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: true,
        ambulanceAssigned: true,
        ambulanceDispatched: true,
        ambulanceEtaSeconds: 15,
        greenCorridorActive: true,
        signalPlan: {
          junctionId: 'J1_CENTRAL',
          phaseA: 'green',
          phaseB: 'red',
          isTransitioning: false,
          allRedActive: false,
          timeInPhase: 45,
        },
        corridorPreemptedJunctions: ['J4_EAST', 'J1_CENTRAL'],
        conflictCheckPassed: true,
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        victimAssistanceStatus: 'Professional assessment required (non-graphic)',
        secondaryCollisionRisk: 'MEDIUM',
        vehicleCount: 82,
        trafficDensityPercent: 80,
        averageSpeedKmh: 8,
      };

    case 'rescue_safety':
    case 'SITE_SECURED':
    case 'RESCUE':
      return {
        ...base,
        activeScenarioId: 'rescue_safety',
        stage: 'RESCUE',
        demoStepIndex: 6,
        demoProgress: 70,
        simTimestamp: '08:04:30 AM',
        laneStatus: 'blocked',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: true,
        ambulanceAssigned: true,
        ambulanceDispatched: true,
        ambulanceEtaSeconds: 0,
        greenCorridorActive: true,
        siteSecured: true,
        safetyPerimeterActive: true,
        emergencyAccessZoneClear: true,
        victimAssistanceStatus: 'Professional assessment required (Paramedic on scene, non-graphic)',
        secondaryCollisionRisk: 'LOW',
        responderInZone: true,
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        vehicleCount: 80,
        trafficDensityPercent: 78,
        averageSpeedKmh: 10,
      };

    case 'road_clearance':
    case 'CLEARANCE_INSPECT':
    case 'CLEARANCE_TOW':
    case 'CLEARANCE_DEBRIS':
    case 'CLEARANCE_ROAD_INSPECT':
    case 'CLEARANCE_AUTHORIZED':
      return {
        ...base,
        activeScenarioId: 'road_clearance',
        stage: 'CLEARANCE_TOW',
        demoStepIndex: 7,
        demoProgress: 80,
        simTimestamp: '08:06:00 AM',
        laneStatus: 'clearance_in_progress',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: true,
        ambulanceAssigned: true,
        ambulanceDispatched: true,
        siteSecured: true,
        safetyPerimeterActive: true,
        emergencyAccessZoneClear: true,
        victimAssistanceStatus: 'Triage complete. Patient safely transported to hospital.',
        secondaryCollisionRisk: 'LOW',
        responderInZone: false,
        clearanceStep: 3, // Towing vehicles in progress
        vehiclesMoved: true,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        vehicleCount: 70,
        trafficDensityPercent: 68,
        averageSpeedKmh: 15,
      };

    case 'pedestrian_safety':
    case 'PEDESTRIAN_PROTECTED':
      return {
        ...base,
        activeScenarioId: 'pedestrian_safety',
        stage: 'PEDESTRIAN_PROTECTED',
        demoStepIndex: 8,
        demoProgress: 90,
        simTimestamp: '08:07:30 AM',
        laneStatus: 'inspection_pending',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: true,
        ambulanceAssigned: true,
        ambulanceDispatched: true,
        siteSecured: true,
        safetyPerimeterActive: true,
        emergencyAccessZoneClear: true,
        victimAssistanceStatus: 'Site safe. No pedestrians allowed in active zone.',
        secondaryCollisionRisk: 'LOW',
        responderInZone: false,
        clearanceStep: 5, // Inspection pending
        vehiclesMoved: true,
        debrisRemoved: true,
        roadInspectionPassed: true,
        clearanceAuthorized: false,
        pedestrians: {
          ...INITIAL_PEDESTRIANS,
          active: true,
          crosswalkBlocked: true,
          safeRouteActive: true,
          holdActive: false,
          waitingCount: 4,
          safetyScore: 99,
        },
        trafficFlowRestored: false,
        vehicleCount: 60,
        trafficDensityPercent: 55,
        averageSpeedKmh: 22,
      };

    case 'traffic_restoration':
    case 'RESTORATION':
    case 'RECOVERED':
    case 'REPORT':
      return {
        ...base,
        activeScenarioId: 'traffic_restoration',
        stage: 'RECOVERED',
        demoStepIndex: 9,
        demoProgress: 100,
        simTimestamp: '08:09:00 AM',
        laneStatus: 'cleared_for_reopening',
        verificationStatus: 'AI Confirmed',
        policeNotified: true,
        policeDispatched: false,
        ambulanceAssigned: false,
        ambulanceDispatched: false,
        greenCorridorActive: false,
        siteSecured: false,
        safetyPerimeterActive: false,
        emergencyAccessZoneClear: true,
        victimAssistanceStatus: 'Incident cleared. Normal operations restored.',
        secondaryCollisionRisk: 'LOW',
        responderInZone: false,
        clearanceStep: 6,
        vehiclesMoved: true,
        debrisRemoved: true,
        roadInspectionPassed: true,
        clearanceAuthorized: true,
        clearanceOfficerBadge: 'OFFICER-#4028',
        pedestrians: {
          ...INITIAL_PEDESTRIANS,
          active: false,
          crosswalkBlocked: false,
          safeRouteActive: true,
          safetyScore: 100,
        },
        trafficFlowRestored: true,
        vehicleCount: 42,
        trafficDensityPercent: 26,
        averageSpeedKmh: 46,
      };

    case 'full_demo':
    default:
      return {
        ...base,
        activeScenarioId: 'normal',
        stage: 'MONITORING',
        demoStepIndex: 0,
        demoProgress: 10,
        isDemoRunning: true,
      };
  }
}

/**
 * Pure Reducer implementing all state machine transitions and strict Safety Invariants.
 */
export function scenarioReducer(state: ScenarioState, action: ScenarioAction): ScenarioState {
  switch (action.type) {
    case 'SELECT_SCENARIO': {
      if (action.scenarioId === 'full_demo') {
        const fullBase = buildPreconditionState('normal');
        return {
          ...fullBase,
          activeScenarioId: 'normal',
          isDemoRunning: true,
          demoStepIndex: 0,
          demoProgress: 10,
          actionError: null,
          eventLogs: [
            ...fullBase.eventLogs,
            createLogEntry('MONITORING', 'Presenter', 'Run Full Demonstration', '10-stage automated incident lifecycle commenced.', state.simTimestamp),
          ],
        };
      }

      const next = buildPreconditionState(action.scenarioId);
      const meta = SCENARIO_METADATA.find((m) => m.id === action.scenarioId);
      return {
        ...next,
        isDemoRunning: false,
        actionError: null,
        eventLogs: [
          ...next.eventLogs,
          createLogEntry(
            next.stage,
            'Presenter',
            `Selected ${meta?.shortTitle || action.scenarioId}`,
            `Precondition state established. Independent simulation ready.`,
            next.simTimestamp
          ),
        ],
      };
    }

    case 'START_FULL_DEMO': {
      const base = buildPreconditionState('normal');
      return {
        ...base,
        activeScenarioId: 'normal',
        isDemoRunning: true,
        demoStepIndex: 0,
        demoProgress: 10,
        actionError: null,
        eventLogs: [
          ...base.eventLogs,
          createLogEntry('MONITORING', 'Presenter', 'Full Demonstration Started', 'Autonomous 10-step sequence initiated.', base.simTimestamp),
        ],
      };
    }

    case 'PAUSE_FULL_DEMO': {
      return {
        ...state,
        isDemoRunning: false,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry(state.stage, 'Presenter', 'Demonstration Paused', `Paused at Step ${state.demoStepIndex + 1}: ${state.stage}`, state.simTimestamp),
        ],
      };
    }

    case 'RESUME_FULL_DEMO': {
      return {
        ...state,
        isDemoRunning: true,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry(state.stage, 'Presenter', 'Demonstration Resumed', `Resumed playback from Step ${state.demoStepIndex + 1}`, state.simTimestamp),
        ],
      };
    }

    case 'RESET_DEMO': {
      const resetState = buildPreconditionState('normal');
      return {
        ...resetState,
        isDemoRunning: false,
        demoProgress: 10,
        demoStepIndex: 0,
        actionError: null,
        eventLogs: [
          createLogEntry('MONITORING', 'Presenter', 'Reset to Baseline', 'Demo data cleared, normal traffic baseline restored.', '08:00:00 AM'),
        ],
      };
    }

    case 'NEXT_STEP': {
      const nextIdx = Math.min(state.demoStepIndex + 1, ORDERED_DEMO_SEQUENCE.length - 1);
      const targetScenario = ORDERED_DEMO_SEQUENCE[nextIdx];
      const targetState = buildPreconditionState(targetScenario);
      return {
        ...targetState,
        isDemoRunning: state.isDemoRunning,
        playbackSpeed: state.playbackSpeed,
        demoStepIndex: nextIdx,
        demoProgress: ((nextIdx + 1) / ORDERED_DEMO_SEQUENCE.length) * 100,
        actionError: null,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry(targetState.stage, 'Presenter', 'Stepped Forward', `Advanced to Step ${nextIdx + 1}: ${targetScenario}`, targetState.simTimestamp),
        ],
      };
    }

    case 'PREV_STEP': {
      const prevIdx = Math.max(state.demoStepIndex - 1, 0);
      const targetScenario = ORDERED_DEMO_SEQUENCE[prevIdx];
      const targetState = buildPreconditionState(targetScenario);
      return {
        ...targetState,
        isDemoRunning: state.isDemoRunning,
        playbackSpeed: state.playbackSpeed,
        demoStepIndex: prevIdx,
        demoProgress: ((prevIdx + 1) / ORDERED_DEMO_SEQUENCE.length) * 100,
        actionError: null,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry(targetState.stage, 'Presenter', 'Stepped Backward', `Reverted to Step ${prevIdx + 1}: ${targetScenario}`, targetState.simTimestamp),
        ],
      };
    }

    case 'JUMP_TO_STEP': {
      const clampedIdx = Math.max(0, Math.min(action.stepIndex, ORDERED_DEMO_SEQUENCE.length - 1));
      const targetScenario = ORDERED_DEMO_SEQUENCE[clampedIdx];
      const targetState = buildPreconditionState(targetScenario);
      return {
        ...targetState,
        isDemoRunning: state.isDemoRunning,
        playbackSpeed: state.playbackSpeed,
        demoStepIndex: clampedIdx,
        demoProgress: ((clampedIdx + 1) / ORDERED_DEMO_SEQUENCE.length) * 100,
        actionError: null,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry(targetState.stage, 'Presenter', `Jumped to Step ${clampedIdx + 1}`, `Direct navigation to ${targetScenario}. Invariants enforced.`, targetState.simTimestamp),
        ],
      };
    }

    case 'SET_PLAYBACK_SPEED': {
      return {
        ...state,
        playbackSpeed: action.speed,
      };
    }

    case 'TOGGLE_SENSOR_OUTAGE': {
      const outage = action.outage;
      // INVARIANT 1: With a sensor outage it ends as "Unverified — operator confirmation required", never Confirmed.
      let newVerificationStatus: ScenarioState['verificationStatus'] = state.verificationStatus;
      let newStage: ScenarioStage = state.stage;

      if (outage) {
        newVerificationStatus = 'Unverified — operator confirmation required';
        if (state.stage === 'CONFIRMED' || state.stage === 'SENSOR_VERIFICATION') {
          newStage = 'UNVERIFIED_FALLBACK';
        }
      } else {
        if (state.stage === 'UNVERIFIED_FALLBACK') {
          newStage = 'CONFIRMED';
          newVerificationStatus = 'AI Confirmed';
        }
      }

      return {
        ...state,
        sensorOutageSimulated: outage,
        verificationStatus: newVerificationStatus,
        stage: newStage,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry(
            newStage,
            'Hardware Daemon',
            outage ? 'Simulated Sensor Outage Activated' : 'Sensor Outage Cleared',
            outage
              ? 'Safety Invariant 1: Multi-modal fusion degraded. Requires operator visual check.'
              : 'Sensors restored online. Fusion pipeline active.',
            state.simTimestamp
          ),
        ],
      };
    }

    case 'TRIGGER_COLLISION': {
      // Idempotence: If already in collision or beyond, do not duplicate
      if (state.stage !== 'MONITORING' && state.stage !== 'IDLE') {
        return state;
      }
      return {
        ...state,
        stage: 'POTENTIAL',
        activeScenarioId: 'collision',
        demoStepIndex: 1,
        demoProgress: 20,
        simTimestamp: '08:01:12 AM',
        laneStatus: 'blocked',
        vehiclesMoved: false,
        debrisRemoved: false,
        roadInspectionPassed: false,
        clearanceAuthorized: false,
        trafficFlowRestored: false,
        victimAssistanceStatus: 'Professional assessment required (non-graphic)',
        secondaryCollisionRisk: 'HIGH',
        vehicleCount: 68,
        trafficDensityPercent: 62,
        averageSpeedKmh: 14,
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('POTENTIAL', 'Edge Camera 01', 'Potential Collision Detected', 'Optical bounding box flagged in Northbound Lane 2.', '08:01:12 AM'),
        ],
      };
    }

    case 'VERIFY_INCIDENT': {
      // INVARIANT 1: Incident stays "Potential" until BOTH camera and sensor evidence exist.
      // If sensor outage is simulated, it ends as "Unverified — operator confirmation required", never Confirmed.
      if (state.sensorOutageSimulated) {
        return {
          ...state,
          stage: 'UNVERIFIED_FALLBACK',
          verificationStatus: 'Unverified — operator confirmation required',
          aiConfidence: 54,
          eventLogs: [
            ...state.eventLogs,
            createLogEntry('UNVERIFIED_FALLBACK', 'Sensor Fusion Engine', 'Verification Incomplete (Sensor Outage)', 'INVARIANT 1 ENFORCED: Missing inductive loop evidence. Marked unverified.', state.simTimestamp),
          ],
        };
      }

      return {
        ...state,
        stage: 'CONFIRMED',
        verificationStatus: 'AI Confirmed',
        aiConfidence: 96,
        cameraConfidence: 96,
        sensorOccupancyRate: 91,
        activeScenarioId: 'ai_verification',
        demoStepIndex: 2,
        demoProgress: 30,
        simTimestamp: '08:01:34 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('CONFIRMED', 'Fusion Engine', 'AI Incident Confirmed', 'Optical (96%) + Inductive Loop (91%) fused. Confidence 96%.', '08:01:34 AM'),
        ],
      };
    }

    case 'DISPATCH_POLICE': {
      // INVARIANT 7: Button spam idempotence - do not dispatch if already dispatched
      if (state.policeDispatched) {
        return state;
      }
      return {
        ...state,
        policeNotified: true,
        policeDispatched: true,
        policeEtaSeconds: 35,
        stage: 'POLICE_DISPATCHED',
        activeScenarioId: 'police_dispatch',
        demoStepIndex: 3,
        demoProgress: 40,
        simTimestamp: '08:02:10 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('POLICE_DISPATCHED', 'Police CAD Interface', 'Police Cruiser Dispatched (Simulation)', 'Cruiser-104 en route to J1 Central Square. ETA ~35s.', '08:02:10 AM'),
        ],
      };
    }

    case 'DISPATCH_AMBULANCE': {
      // INVARIANT 7: Button spam idempotence
      if (state.ambulanceDispatched) {
        return state;
      }
      return {
        ...state,
        ambulanceAssigned: true,
        ambulanceDispatched: true,
        ambulanceEtaSeconds: 42,
        assignedHospitalId: 'HOSP-01',
        hospitalRecommendationReason: 'Trauma Specialty Center with 8 available ICU beds. Estimated transit time: 4.2 min.',
        stage: 'AMBULANCE_DISPATCHED',
        activeScenarioId: 'ambulance_hospital',
        demoStepIndex: 4,
        demoProgress: 50,
        simTimestamp: '08:02:45 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('AMBULANCE_DISPATCHED', 'EMS Dispatch', 'Medic-14 Dispatched (Simulation)', 'Assigned to Harbor Memorial Hospital (Score 92/100). ETA ~42s.', '08:02:45 AM'),
        ],
      };
    }

    case 'ACTIVATE_GREEN_CORRIDOR': {
      // INVARIANT 2: No junction ever has both phases green. Signals go green -> yellow -> all-red -> green.
      // INVARIANT 3: Corridor needs a dispatched ambulance and restores previous signal plan afterwards.
      if (!state.ambulanceDispatched && !state.ambulanceAssigned) {
        return {
          ...state,
          actionError: 'Safety Invariant 3: Emergency Green Corridor requires an actively dispatched ambulance unit.',
        };
      }

      // Safe signal transition
      const safeSignalPlan: SignalPlanState = {
        junctionId: 'J1_CENTRAL',
        phaseA: 'green',
        phaseB: 'red',
        isTransitioning: false,
        allRedActive: false,
        timeInPhase: 45,
      };

      return {
        ...state,
        greenCorridorActive: true,
        signalPlan: safeSignalPlan,
        corridorPreemptedJunctions: ['J4_EAST', 'J1_CENTRAL'],
        conflictCheckPassed: true,
        stage: 'CORRIDOR_ACTIVE',
        activeScenarioId: 'green_corridor',
        demoStepIndex: 5,
        demoProgress: 60,
        actionError: null,
        simTimestamp: '08:03:15 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('CORRIDOR_ACTIVE', 'Controller Bridge', 'Green Corridor Preemption Active', 'Signals along ambulance route preempted. Cross-traffic held at all-red.', '08:03:15 AM'),
        ],
      };
    }

    case 'START_RESCUE': {
      return {
        ...state,
        siteSecured: true,
        safetyPerimeterActive: true,
        emergencyAccessZoneClear: true,
        victimAssistanceStatus: 'Professional assessment required (Paramedic on scene, non-graphic)',
        secondaryCollisionRisk: 'LOW',
        responderInZone: true,
        stage: 'RESCUE',
        activeScenarioId: 'rescue_safety',
        demoStepIndex: 6,
        demoProgress: 70,
        simTimestamp: '08:04:30 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('RESCUE', 'Incident Command', 'Accident Site Secured & Rescue Active', 'Perimeter established. Non-graphic responder triage underway.', '08:04:30 AM'),
        ],
      };
    }

    case 'ADVANCE_CLEARANCE_STEP': {
      const nextStep: ClearanceStepNumber =
        action.targetStep !== undefined
          ? action.targetStep
          : ((Math.min(state.clearanceStep + 1, 6)) as ClearanceStepNumber);

      let laneStatus: LaneStatus = state.laneStatus;
      let vehiclesMoved = state.vehiclesMoved;
      let debrisRemoved = state.debrisRemoved;
      let roadInspectionPassed = state.roadInspectionPassed;
      let clearanceAuthorized = state.clearanceAuthorized;
      let responderInZone = state.responderInZone;

      // INVARIANT 4: Lanes move strictly: blocked -> clearance_in_progress -> inspection_pending -> cleared_for_reopening
      switch (nextStep) {
        case 1: // Inspect accident zone
          laneStatus = 'clearance_in_progress';
          responderInZone = true;
          break;
        case 2: // Police perimeter established
          laneStatus = 'clearance_in_progress';
          responderInZone = true;
          break;
        case 3: // Damaged vehicles moved/towed
          laneStatus = 'clearance_in_progress';
          vehiclesMoved = true;
          responderInZone = true;
          break;
        case 4: // Debris removal
          laneStatus = 'clearance_in_progress';
          vehiclesMoved = true;
          debrisRemoved = true;
          responderInZone = true;
          break;
        case 5: // Road inspected
          laneStatus = 'inspection_pending';
          vehiclesMoved = true;
          debrisRemoved = true;
          roadInspectionPassed = true;
          responderInZone = false; // responders exit zone after inspection
          break;
        case 6: // Authorized clearance confirmation
          laneStatus = 'cleared_for_reopening';
          vehiclesMoved = true;
          debrisRemoved = true;
          roadInspectionPassed = true;
          clearanceAuthorized = true;
          responderInZone = false;
          break;
      }

      return {
        ...state,
        clearanceStep: nextStep,
        laneStatus,
        vehiclesMoved,
        debrisRemoved,
        roadInspectionPassed,
        clearanceAuthorized,
        responderInZone,
        stage: nextStep === 6 ? 'CLEARANCE_AUTHORIZED' : 'CLEARANCE_INSPECT',
        activeScenarioId: 'road_clearance',
        demoStepIndex: 7,
        demoProgress: 80,
        simTimestamp: '08:06:00 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('CLEARANCE_INSPECT', 'Clearance Operations', `Clearance Step ${nextStep}/6 Completed`, `Lane status: ${laneStatus}. Prerequisite flags updated.`, '08:06:00 AM'),
        ],
      };
    }

    case 'ACTIVATE_SAFE_PEDESTRIAN_ROUTE': {
      // INVARIANT 5: The pedestrian route never crosses the accident zone, access zone or ambulance path without a hold.
      const safePedestrians: PedestrianRouteState = {
        active: true,
        crosswalkBlocked: true,
        safeRouteActive: true,
        alternativeRoutePath: [
          { x: 30, y: 70 },
          { x: 30, y: 88 },
          { x: 70, y: 88 },
          { x: 70, y: 70 },
        ],
        holdActive: false,
        waitingCount: 4,
        safetyScore: 99,
      };

      return {
        ...state,
        pedestrians: safePedestrians,
        stage: 'PEDESTRIAN_PROTECTED',
        activeScenarioId: 'pedestrian_safety',
        demoStepIndex: 8,
        demoProgress: 90,
        simTimestamp: '08:07:30 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('PEDESTRIAN_PROTECTED', 'Pedestrian Safety Subsystem', 'Safe Passage Activated', 'Northern crosswalk barricaded. Pedestrians routed safely away from incident.', '08:07:30 AM'),
        ],
      };
    }

    case 'RESTORE_TRAFFIC_FLOW': {
      // INVARIANT 4 (CRITICAL):
      // RESTORE_FLOW is rejected unless:
      // - vehicles are removed
      // - debris is removed
      // - inspection passed
      // - authorization recorded
      // - no responder is in the zone
      const reasons: string[] = [];
      if (!state.vehiclesMoved) reasons.push('Damaged vehicles still occupy the roadway');
      if (!state.debrisRemoved) reasons.push('Mechanical debris sweep has not been completed');
      if (!state.roadInspectionPassed) reasons.push('Physical road surface inspection is pending');
      if (!state.clearanceAuthorized) reasons.push('Clearance confirmation authorization has not been recorded');
      if (state.responderInZone) reasons.push('Emergency responders are still physically present in the active zone');

      if (reasons.length > 0) {
        return {
          ...state,
          actionError: `SAFETY INVARIANT 4 REJECTION: Roadway cannot reopen: ${reasons.join('; ')}. Complete clearance steps first.`,
        };
      }

      // Safe normalization of signals and metrics
      const restoredSignals: SignalPlanState = {
        junctionId: 'J1_CENTRAL',
        phaseA: 'green',
        phaseB: 'red',
        isTransitioning: false,
        allRedActive: false,
        timeInPhase: 16,
      };

      return {
        ...state,
        trafficFlowRestored: true,
        laneStatus: 'cleared_for_reopening',
        greenCorridorActive: false,
        signalPlan: restoredSignals,
        vehicleCount: 42,
        trafficDensityPercent: 26,
        averageSpeedKmh: 46,
        stage: 'RECOVERED',
        activeScenarioId: 'traffic_restoration',
        demoStepIndex: 9,
        demoProgress: 100,
        actionError: null,
        simTimestamp: '08:09:00 AM',
        eventLogs: [
          ...state.eventLogs,
          createLogEntry('RECOVERED', 'Autonomous Traffic Manager', 'Traffic Flow Restored', 'All prerequisites verified. Lane 2 reopened. Adaptive baseline restored.', '08:09:00 AM'),
        ],
      };
    }

    case 'CLEAR_ACTION_ERROR': {
      return {
        ...state,
        actionError: null,
      };
    }

    case 'TICK': {
      if (!state.isDemoRunning) return state;

      const nextElapsed = state.elapsedSeconds + action.deltaSeconds;
      const totalDemoDuration = FULL_DEMO_TIMELINE[FULL_DEMO_TIMELINE.length - 1].simTimeOffsetSeconds +
        FULL_DEMO_TIMELINE[FULL_DEMO_TIMELINE.length - 1].durationSeconds;

      // Find current event in timeline
      let activeTimelineEvent = FULL_DEMO_TIMELINE[0];
      for (const ev of FULL_DEMO_TIMELINE) {
        if (nextElapsed >= ev.simTimeOffsetSeconds) {
          activeTimelineEvent = ev;
        }
      }

      const calculatedProgress = Math.min(100, (nextElapsed / totalDemoDuration) * 100);

      // If moving to a new step, apply that step's state transitions
      if (activeTimelineEvent.stepIndex !== state.demoStepIndex) {
        const stepState = buildPreconditionState(activeTimelineEvent.targetScenarioId as ScenarioId);
        return {
          ...stepState,
          isDemoRunning: true,
          elapsedSeconds: nextElapsed,
          demoStepIndex: activeTimelineEvent.stepIndex,
          demoProgress: Math.max(stepState.demoProgress, calculatedProgress),
          playbackSpeed: state.playbackSpeed,
          eventLogs: [
            ...state.eventLogs,
            createLogEntry(
              activeTimelineEvent.stage,
              activeTimelineEvent.actor,
              activeTimelineEvent.action,
              activeTimelineEvent.details,
              stepState.simTimestamp
            ),
          ],
        };
      }

      if (nextElapsed >= totalDemoDuration) {
        // Demonstration completed!
        const finalState = buildPreconditionState('traffic_restoration');
        return {
          ...finalState,
          isDemoRunning: false,
          elapsedSeconds: totalDemoDuration,
          demoProgress: 100,
          demoStepIndex: 9,
          stage: 'REPORT',
          eventLogs: [
            ...state.eventLogs,
            createLogEntry('REPORT', 'Exhibition Engine', 'Complete Demonstration Completed', 'Incident lifecycle concluded. Final Incident Report generated.', '08:09:00 AM'),
          ],
        };
      }

      return {
        ...state,
        elapsedSeconds: nextElapsed,
        demoProgress: Math.max(state.demoProgress, calculatedProgress),
      };
    }

    default:
      return state;
  }
}

function createLogEntry(
  stage: ScenarioStage,
  actor: string,
  action: string,
  details: string,
  timestamp: string
): ScenarioLogEntry {
  return {
    id: `LOG-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 900 + 100)}`,
    timestamp,
    stage,
    actor,
    action,
    details,
    isSimulated: true,
  };
}
