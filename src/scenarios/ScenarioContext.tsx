// Scenario Context & Deterministic Clock Engine
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { scenarioBridge } from './bridge';
import {
  INITIAL_SCENARIO_STATE,
  buildPreconditionState,
  scenarioReducer,
} from './engine';
import {
  ClearanceStepNumber,
  ScenarioAction,
  ScenarioId,
  ScenarioState,
} from './types';

interface ScenarioContextType {
  state: ScenarioState;
  dispatch: React.Dispatch<ScenarioAction>;
  selectScenario: (id: ScenarioId) => void;
  startFullDemo: () => void;
  pauseFullDemo: () => void;
  resumeFullDemo: () => void;
  resetDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (idx: number) => void;
  setPlaybackSpeed: (speed: 1 | 2 | 4) => void;
  toggleSensorOutage: (outage: boolean) => void;
  triggerCollision: () => void;
  verifyIncident: () => void;
  dispatchPolice: () => void;
  dispatchAmbulance: () => void;
  activateGreenCorridor: () => void;
  startRescue: () => void;
  advanceClearanceStep: (step?: ClearanceStepNumber) => void;
  activateSafePedestrianRoute: () => void;
  restoreTrafficFlow: () => void;
  clearActionError: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(scenarioReducer, INITIAL_SCENARIO_STATE);

  // Sync to external services whenever state changes
  useEffect(() => {
    scenarioBridge.syncScenarioTransition(state);
  }, [state]);

  // Deterministic Clock Runner
  // Uses timestamp delta to stay accurate even across tab switches and StrictMode
  const lastTimeRef = useRef<number>(performance.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!state.isDemoRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    lastTimeRef.current = performance.now();
    const intervalMs = 100; // 100ms updates for fluid visual progress

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsedMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Delta simulated seconds scaled by playback multiplier
      const deltaSimulatedSeconds = (elapsedMs / 1000) * state.playbackSpeed;
      dispatch({ type: 'TICK', deltaSeconds: deltaSimulatedSeconds });
    }, intervalMs);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [state.isDemoRunning, state.playbackSpeed]);

  const selectScenario = useCallback((id: ScenarioId) => {
    dispatch({ type: 'SELECT_SCENARIO', scenarioId: id });
  }, []);

  const startFullDemo = useCallback(() => {
    dispatch({ type: 'START_FULL_DEMO' });
  }, []);

  const pauseFullDemo = useCallback(() => {
    dispatch({ type: 'PAUSE_FULL_DEMO' });
  }, []);

  const resumeFullDemo = useCallback(() => {
    dispatch({ type: 'RESUME_FULL_DEMO' });
  }, []);

  const resetDemo = useCallback(() => {
    scenarioBridge.cleanupDemoData();
    dispatch({ type: 'RESET_DEMO' });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const jumpToStep = useCallback((idx: number) => {
    dispatch({ type: 'JUMP_TO_STEP', stepIndex: idx });
  }, []);

  const setPlaybackSpeed = useCallback((speed: 1 | 2 | 4) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', speed });
  }, []);

  const toggleSensorOutage = useCallback((outage: boolean) => {
    dispatch({ type: 'TOGGLE_SENSOR_OUTAGE', outage });
  }, []);

  const triggerCollision = useCallback(() => {
    dispatch({ type: 'TRIGGER_COLLISION' });
  }, []);

  const verifyIncident = useCallback(() => {
    dispatch({ type: 'VERIFY_INCIDENT' });
  }, []);

  const dispatchPolice = useCallback(() => {
    dispatch({ type: 'DISPATCH_POLICE' });
  }, []);

  const dispatchAmbulance = useCallback(() => {
    dispatch({ type: 'DISPATCH_AMBULANCE' });
  }, []);

  const activateGreenCorridor = useCallback(() => {
    dispatch({ type: 'ACTIVATE_GREEN_CORRIDOR' });
  }, []);

  const startRescue = useCallback(() => {
    dispatch({ type: 'START_RESCUE' });
  }, []);

  const advanceClearanceStep = useCallback((step?: ClearanceStepNumber) => {
    dispatch({ type: 'ADVANCE_CLEARANCE_STEP', targetStep: step });
  }, []);

  const activateSafePedestrianRoute = useCallback(() => {
    dispatch({ type: 'ACTIVATE_SAFE_PEDESTRIAN_ROUTE' });
  }, []);

  const restoreTrafficFlow = useCallback(() => {
    dispatch({ type: 'RESTORE_TRAFFIC_FLOW' });
  }, []);

  const clearActionError = useCallback(() => {
    dispatch({ type: 'CLEAR_ACTION_ERROR' });
  }, []);

  return (
    <ScenarioContext.Provider
      value={{
        state,
        dispatch,
        selectScenario,
        startFullDemo,
        pauseFullDemo,
        resumeFullDemo,
        resetDemo,
        nextStep,
        prevStep,
        jumpToStep,
        setPlaybackSpeed,
        toggleSensorOutage,
        triggerCollision,
        verifyIncident,
        dispatchPolice,
        dispatchAmbulance,
        activateGreenCorridor,
        startRescue,
        advanceClearanceStep,
        activateSafePedestrianRoute,
        restoreTrafficFlow,
        clearActionError,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return ctx;
};
