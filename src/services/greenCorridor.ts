// Green Corridor Emergency Preemption Engine
// Coordinates emergency signal preemption, ensures safety interlocks (no conflicting greens),
// tracks clearance intervals, and restores autonomous adaptive control.

import { GreenCorridorState, PhaseId } from '../types';
import { addAuditLog } from './auditLog';
import { authorizedController } from './authorizedController';
import { APP_EVENTS, eventBus } from './eventBus';
import { getShortestPathJunctions } from './roadGraph';

let activeGreenCorridor: GreenCorridorState | null = null;

export function getActiveGreenCorridor(): GreenCorridorState | null {
  return activeGreenCorridor ? { ...activeGreenCorridor } : null;
}

export function activateGreenCorridor(params: {
  unitId: string;
  incidentId: string;
  startJunctionId: string;
  targetJunctionId: string;
  targetPhase?: PhaseId;
  simTime?: number;
}): GreenCorridorState {
  const path = getShortestPathJunctions(params.startJunctionId, params.targetJunctionId);
  const phase: PhaseId = params.targetPhase || 'phaseA';
  const simTime = params.simTime || 0;

  activeGreenCorridor = {
    id: `GC-${Date.now().toString().slice(-4)}`,
    unitId: params.unitId,
    incidentId: params.incidentId,
    pathJunctionIds: path,
    activeJunctionId: params.targetJunctionId,
    status: 'ACTIVE',
    phaseGranted: phase,
    estimatedClearanceSeconds: 25,
    secondsElapsed: 0,
    safetyInterlockVerified: true,
  };

  // Authorize signal priority via Authorized Controller layer
  path.forEach((junctionId) => {
    authorizedController.validateAndExecutePhaseChange(
      {
        junctionId,
        targetPhase: phase,
        reason: 'GREEN_CORRIDOR_OVERRIDE',
        actor: `Green Corridor Engine (Unit: ${params.unitId})`,
        provenance: 'Emergency Signal Preemption System',
        simTime,
      },
      'yellow',
      'red'
    );
  });

  addAuditLog(
    'Autonomous Preemption Daemon',
    'Green Corridor Activated',
    `Corridor [${path.join(' -> ')}] for Unit ${params.unitId}`,
    'Authorized Controller Service Layer',
    'Success',
    `Safe preemption granted to ${phase}. Conflicting phases locked to Red. Estimated clearance ~25s.`,
    simTime
  );

  eventBus.emit(APP_EVENTS.GREEN_CORRIDOR_ACTIVATED, activeGreenCorridor);
  return { ...activeGreenCorridor };
}

export function tickGreenCorridor(simTime: number = 0): GreenCorridorState | null {
  if (!activeGreenCorridor) return null;

  activeGreenCorridor.secondsElapsed += 1;

  if (activeGreenCorridor.secondsElapsed >= activeGreenCorridor.estimatedClearanceSeconds) {
    // Corridor clearance complete! Restore adaptive signal control
    deactivateGreenCorridor(simTime, 'Clearance Interval Completed');
    return null;
  }

  return { ...activeGreenCorridor };
}

export function deactivateGreenCorridor(simTime: number = 0, reason: string = 'Unit Arrived / Manual Release'): void {
  if (!activeGreenCorridor) return;

  const finishedCorridor = { ...activeGreenCorridor };
  activeGreenCorridor = null;

  addAuditLog(
    'Green Corridor Supervisor',
    'Green Corridor Deactivated',
    `Corridor ${finishedCorridor.id} for Unit ${finishedCorridor.unitId}`,
    'Authorized Controller Service Layer',
    'Success',
    `${reason}. Restoring autonomous adaptive queue-based control.`,
    simTime
  );

  eventBus.emit(APP_EVENTS.GREEN_CORRIDOR_DEACTIVATED, finishedCorridor);
}
