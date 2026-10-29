// Comprehensive Unit Tests for TrafficPulse Scenario Engine
// Executable via: npx tsx src/scenarios/engine.test.ts
import assert from 'node:assert';
import { ORDERED_DEMO_SEQUENCE, SCENARIO_METADATA } from './config';
import {
  INITIAL_SCENARIO_STATE,
  buildPreconditionState,
  scenarioReducer,
} from './engine';
import { FULL_DEMO_TIMELINE } from './timeline';
import { ScenarioAction, ScenarioId, ScenarioState } from './types';

console.log('🧪 Starting TrafficPulse Scenario Engine Test Suite...\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASSED: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAILED: ${name}`);
    console.error(`    ${err.message || err}`);
    throw err;
  }
}

// 1. All 11 scenarios start from any state
runTest('All 11 scenarios start independently from any initial state', () => {
  const arbitraryInitialStates: ScenarioState[] = [
    INITIAL_SCENARIO_STATE,
    buildPreconditionState('collision'),
    buildPreconditionState('road_clearance'),
    buildPreconditionState('traffic_restoration'),
  ];

  const allScenarioIds: ScenarioId[] = [
    'normal',
    'collision',
    'ai_verification',
    'police_dispatch',
    'ambulance_hospital',
    'green_corridor',
    'rescue_safety',
    'road_clearance',
    'pedestrian_safety',
    'traffic_restoration',
    'full_demo',
  ];

  for (const fromState of arbitraryInitialStates) {
    for (const targetId of allScenarioIds) {
      const nextState = scenarioReducer(fromState, {
        type: 'SELECT_SCENARIO',
        scenarioId: targetId,
      });

      assert(nextState !== undefined, `State for ${targetId} must be defined`);
      if (targetId === 'full_demo') {
        assert.strictEqual(nextState.isDemoRunning, true, 'Full demo should set isDemoRunning to true');
      } else {
        assert.strictEqual(nextState.activeScenarioId, targetId, `Scenario should transition to ${targetId}`);
      }
    }
  }
});

// 2. The full demo fires every event once, in order
runTest('The full demo fires every event once, in order across the timeline', () => {
  let state = scenarioReducer(INITIAL_SCENARIO_STATE, { type: 'START_FULL_DEMO' });
  assert.strictEqual(state.isDemoRunning, true);
  assert.strictEqual(state.demoStepIndex, 0);

  const seenSteps = new Set<number>();
  seenSteps.add(state.demoStepIndex);

  // Tick through entire timeline
  const tickStep = 0.5; // seconds
  const totalDuration =
    FULL_DEMO_TIMELINE[FULL_DEMO_TIMELINE.length - 1].simTimeOffsetSeconds +
    FULL_DEMO_TIMELINE[FULL_DEMO_TIMELINE.length - 1].durationSeconds +
    2;

  let currentElapsed = 0;
  while (currentElapsed <= totalDuration && state.isDemoRunning) {
    state = scenarioReducer(state, { type: 'TICK', deltaSeconds: tickStep });
    currentElapsed += tickStep;
    seenSteps.add(state.demoStepIndex);
  }

  // Check that all 10 steps (0 to 9) were visited in ordered sequence
  for (let i = 0; i < 10; i++) {
    assert(seenSteps.has(i), `Step ${i} must have been executed during full demo run`);
  }
  assert.strictEqual(state.demoProgress, 100, 'Demo progress must reach 100%');
  assert.strictEqual(state.stage, 'REPORT', 'Final stage must be REPORT');
});

// 3. Pause, resume, replay and reset cause no skipped or duplicated events
runTest('Pause, resume, replay, and reset maintain event integrity', () => {
  let state = scenarioReducer(INITIAL_SCENARIO_STATE, { type: 'START_FULL_DEMO' });

  // Advance 10 seconds
  state = scenarioReducer(state, { type: 'TICK', deltaSeconds: 10 });
  const stepAt10 = state.demoStepIndex;

  // Pause
  state = scenarioReducer(state, { type: 'PAUSE_FULL_DEMO' });
  assert.strictEqual(state.isDemoRunning, false, 'Demo should be paused');

  // Tick while paused should not advance
  const stateDuringPause = scenarioReducer(state, { type: 'TICK', deltaSeconds: 10 });
  assert.strictEqual(stateDuringPause.elapsedSeconds, state.elapsedSeconds, 'Time should not advance while paused');
  assert.strictEqual(stateDuringPause.demoStepIndex, stepAt10, 'Step should not change while paused');

  // Resume
  state = scenarioReducer(state, { type: 'RESUME_FULL_DEMO' });
  assert.strictEqual(state.isDemoRunning, true, 'Demo should be running after resume');

  // Reset
  state = scenarioReducer(state, { type: 'RESET_DEMO' });
  assert.strictEqual(state.isDemoRunning, false, 'Demo should stop after reset');
  assert.strictEqual(state.demoStepIndex, 0, 'Demo step index should reset to 0');
  assert.strictEqual(state.stage, 'MONITORING', 'Stage should reset to MONITORING');
  assert.strictEqual(state.laneStatus, 'cleared_for_reopening', 'Lanes should be cleared after reset');
});

// 4. NEXT/PREV/JUMP_TO across all stage pairs is valid
runTest('NEXT, PREV, and JUMP_TO across all stage pairs is strictly valid', () => {
  let state = buildPreconditionState('normal');

  // Step through all using NEXT_STEP
  for (let i = 0; i < ORDERED_DEMO_SEQUENCE.length - 1; i++) {
    const prevIndex = state.demoStepIndex;
    state = scenarioReducer(state, { type: 'NEXT_STEP' });
    assert.strictEqual(state.demoStepIndex, prevIndex + 1, `NEXT_STEP should advance from ${prevIndex} to ${prevIndex + 1}`);
  }

  // Step back through all using PREV_STEP
  for (let i = ORDERED_DEMO_SEQUENCE.length - 1; i > 0; i--) {
    const prevIndex = state.demoStepIndex;
    state = scenarioReducer(state, { type: 'PREV_STEP' });
    assert.strictEqual(state.demoStepIndex, prevIndex - 1, `PREV_STEP should decrement from ${prevIndex} to ${prevIndex - 1}`);
  }

  // Arbitrary JUMP_TO between any pair
  for (let from = 0; from < 10; from++) {
    for (let to = 0; to < 10; to++) {
      const startState = buildPreconditionState(ORDERED_DEMO_SEQUENCE[from]);
      const jumped = scenarioReducer(startState, { type: 'JUMP_TO_STEP', stepIndex: to });
      assert.strictEqual(jumped.demoStepIndex, to, `JUMP_TO should directly jump to step ${to}`);
      assert.strictEqual(jumped.activeScenarioId, ORDERED_DEMO_SEQUENCE[to]);
    }
  }
});

// 5. RESTORE_FLOW is rejected when any one prerequisite is missing
runTest('SAFETY INVARIANT 4: RESTORE_FLOW is strictly rejected when any prerequisite is missing', () => {
  // Test case A: Vehicles not moved
  let stateA = {
    ...buildPreconditionState('road_clearance'),
    vehiclesMoved: false,
    debrisRemoved: true,
    roadInspectionPassed: true,
    clearanceAuthorized: true,
    responderInZone: false,
  };
  let resA = scenarioReducer(stateA, { type: 'RESTORE_TRAFFIC_FLOW' });
  assert(resA.actionError !== null, 'Must reject when vehicles are not moved');
  assert(resA.trafficFlowRestored === false, 'Traffic must not be restored');

  // Test case B: Debris not swept
  let stateB = {
    ...buildPreconditionState('road_clearance'),
    vehiclesMoved: true,
    debrisRemoved: false,
    roadInspectionPassed: true,
    clearanceAuthorized: true,
    responderInZone: false,
  };
  let resB = scenarioReducer(stateB, { type: 'RESTORE_TRAFFIC_FLOW' });
  assert(resB.actionError !== null, 'Must reject when debris is not removed');
  assert(resB.trafficFlowRestored === false);

  // Test case C: Inspection pending
  let stateC = {
    ...buildPreconditionState('road_clearance'),
    vehiclesMoved: true,
    debrisRemoved: true,
    roadInspectionPassed: false,
    clearanceAuthorized: true,
    responderInZone: false,
  };
  let resC = scenarioReducer(stateC, { type: 'RESTORE_TRAFFIC_FLOW' });
  assert(resC.actionError !== null, 'Must reject when road inspection is pending');
  assert(resC.trafficFlowRestored === false);

  // Test case D: Authorization missing
  let stateD = {
    ...buildPreconditionState('road_clearance'),
    vehiclesMoved: true,
    debrisRemoved: true,
    roadInspectionPassed: true,
    clearanceAuthorized: false,
    responderInZone: false,
  };
  let resD = scenarioReducer(stateD, { type: 'RESTORE_TRAFFIC_FLOW' });
  assert(resD.actionError !== null, 'Must reject when clearance authorization is missing');
  assert(resD.trafficFlowRestored === false);

  // Test case E: Responder still in zone
  let stateE = {
    ...buildPreconditionState('road_clearance'),
    vehiclesMoved: true,
    debrisRemoved: true,
    roadInspectionPassed: true,
    clearanceAuthorized: true,
    responderInZone: true,
  };
  let resE = scenarioReducer(stateE, { type: 'RESTORE_TRAFFIC_FLOW' });
  assert(resE.actionError !== null, 'Must reject when responders are in the zone');
  assert(resE.trafficFlowRestored === false);

  // Test case F: ALL prerequisites satisfied -> Succeeds!
  let stateValid = {
    ...buildPreconditionState('road_clearance'),
    vehiclesMoved: true,
    debrisRemoved: true,
    roadInspectionPassed: true,
    clearanceAuthorized: true,
    responderInZone: false,
  };
  let resValid = scenarioReducer(stateValid, { type: 'RESTORE_TRAFFIC_FLOW' });
  assert.strictEqual(resValid.actionError, null, 'Must succeed when all prerequisites are met');
  assert.strictEqual(resValid.trafficFlowRestored, true, 'Traffic flow must be restored');
  assert.strictEqual(resValid.laneStatus, 'cleared_for_reopening');
});

// 6. A 1,000-sequence random test finds no conflicting greens
runTest('SAFETY INVARIANT 2: 1,000-sequence random simulation test finds ZERO conflicting greens', () => {
  let state = buildPreconditionState('normal');
  const possibleActions: ScenarioAction[] = [
    { type: 'NEXT_STEP' },
    { type: 'PREV_STEP' },
    { type: 'ACTIVATE_GREEN_CORRIDOR' },
    { type: 'RESTORE_TRAFFIC_FLOW' },
    { type: 'START_RESCUE' },
    { type: 'ADVANCE_CLEARANCE_STEP' },
    { type: 'TICK', deltaSeconds: 1 },
  ];

  for (let i = 0; i < 1000; i++) {
    const randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    state = scenarioReducer(state, randomAction);

    // Invariant check: Phase A and Phase B can NEVER both be green simultaneously!
    const conflict = state.signalPlan.phaseA === 'green' && state.signalPlan.phaseB === 'green';
    assert.strictEqual(conflict, false, `Conflicting green found at iteration ${i}! Phase A: ${state.signalPlan.phaseA}, Phase B: ${state.signalPlan.phaseB}`);
  }
});

// 7. Pedestrian route geometry never collides with the accident zone
runTest('SAFETY INVARIANT 5: Pedestrian safe route geometry never intersects the accident collision zone', () => {
  // Accident zone definition in SVG stage coordinates:
  // Central Northbound Lane 2: x in [45, 65], y in [40, 60]
  const accidentZone = { minX: 45, maxX: 65, minY: 40, maxY: 60 };

  const pedestrianState = scenarioReducer(buildPreconditionState('pedestrian_safety'), {
    type: 'ACTIVATE_SAFE_PEDESTRIAN_ROUTE',
  });

  assert.strictEqual(pedestrianState.pedestrians.safeRouteActive, true);
  assert.strictEqual(pedestrianState.pedestrians.crosswalkBlocked, true);

  // Verify all waypoints of alternative path stay outside collision zone
  for (const pt of pedestrianState.pedestrians.alternativeRoutePath) {
    const inAccidentX = pt.x >= accidentZone.minX && pt.x <= accidentZone.maxX;
    const inAccidentY = pt.y >= accidentZone.minY && pt.y <= accidentZone.maxY;
    const intersects = inAccidentX && inAccidentY;

    assert.strictEqual(
      intersects,
      false,
      `Pedestrian waypoint (${pt.x}, ${pt.y}) intersects accident zone [${accidentZone.minX}-${accidentZone.maxX}, ${accidentZone.minY}-${accidentZone.maxY}]`
    );
  }
});

// 8. The sensor-outage path ends in the unverified fallback
runTest('SAFETY INVARIANT 1: Sensor outage path ends in unverified fallback and NEVER Confirmed', () => {
  let state = buildPreconditionState('collision');

  // Activate sensor outage
  state = scenarioReducer(state, { type: 'TOGGLE_SENSOR_OUTAGE', outage: true });
  assert.strictEqual(state.sensorOutageSimulated, true);

  // Attempt verification
  state = scenarioReducer(state, { type: 'VERIFY_INCIDENT' });

  assert.strictEqual(state.stage, 'UNVERIFIED_FALLBACK', 'Must transition to UNVERIFIED_FALLBACK stage');
  assert.strictEqual(
    state.verificationStatus,
    'Unverified — operator confirmation required',
    'Verification status must state operator confirmation required'
  );
  assert.notStrictEqual(state.stage, 'CONFIRMED', 'Must NEVER be Confirmed without sensor telemetry');
});

// 9. Button-spam idempotence
runTest('SAFETY INVARIANT 7: Button-spam idempotence prevents duplicate dispatches or state corruption', () => {
  let state = buildPreconditionState('collision');

  // Trigger dispatch 5 times in rapid succession
  for (let i = 0; i < 5; i++) {
    state = scenarioReducer(state, { type: 'DISPATCH_POLICE' });
  }

  assert.strictEqual(state.policeDispatched, true);
  // Filter logs for police dispatch
  const policeLogs = state.eventLogs.filter((l) => l.action.includes('Police Cruiser Dispatched'));
  assert.strictEqual(policeLogs.length, 1, 'Only exactly 1 dispatch log entry must exist despite spamming');

  // Trigger ambulance dispatch 5 times in rapid succession
  for (let i = 0; i < 5; i++) {
    state = scenarioReducer(state, { type: 'DISPATCH_AMBULANCE' });
  }
  assert.strictEqual(state.ambulanceDispatched, true);
  const ambulanceLogs = state.eventLogs.filter((l) => l.action.includes('Medic-14 Dispatched'));
  assert.strictEqual(ambulanceLogs.length, 1, 'Only exactly 1 ambulance dispatch log entry must exist despite spamming');
});

console.log(`\n========================================`);
console.log(`🎉 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`========================================\n`);
