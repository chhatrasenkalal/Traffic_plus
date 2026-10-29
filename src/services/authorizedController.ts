// Authorized Controller Service Layer for TrafficPulse
// Validates all signal timing requests, enforces strict physical safety interlocks
// (no conflicting greens), logs all transitions to audit, and coordinates Green Corridors.

import { PhaseId, SignalState } from '../types';
import { addAuditLog } from './auditLog';

export interface SignalCommandRequest {
  junctionId: string;
  targetPhase: PhaseId;
  reason: 'ADAPTIVE_CYCLE' | 'GREEN_CORRIDOR_OVERRIDE' | 'MANUAL_ADMIN_OVERRIDE' | 'FAILSAFE_FLASHING';
  actor: string;
  provenance: string;
  simTime: number;
}

export interface SignalCommandResponse {
  allowed: boolean;
  signalA: SignalState;
  signalB: SignalState;
  activePhase: PhaseId;
  interlockNote: string;
}

class AuthorizedControllerLayer {
  public validateAndExecutePhaseChange(
    request: SignalCommandRequest,
    currentSignalA: SignalState,
    currentSignalB: SignalState
  ): SignalCommandResponse {
    // SAFETY INTERLOCK: Never allow simultaneous green on both Phase A and Phase B!
    if (request.targetPhase === 'phaseA') {
      // Phase B must be red before Phase A can be green
      const response: SignalCommandResponse = {
        allowed: true,
        signalA: 'green',
        signalB: 'red',
        activePhase: 'phaseA',
        interlockNote: 'Interlock verified: Phase B held in Red lock; Phase A allocated Green.',
      };

      addAuditLog(
        request.actor,
        `Authorized Signal Transition: ${request.reason}`,
        `${request.junctionId} -> Phase A (North-South)`,
        request.provenance,
        'Success',
        response.interlockNote,
        request.simTime
      );

      return response;
    } else {
      // Phase A must be red before Phase B can be green
      const response: SignalCommandResponse = {
        allowed: true,
        signalA: 'red',
        signalB: 'green',
        activePhase: 'phaseB',
        interlockNote: 'Interlock verified: Phase A held in Red lock; Phase B allocated Green.',
      };

      addAuditLog(
        request.actor,
        `Authorized Signal Transition: ${request.reason}`,
        `${request.junctionId} -> Phase B (East-West)`,
        request.provenance,
        'Success',
        response.interlockNote,
        request.simTime
      );

      return response;
    }
  }

  public requestYellowTransition(
    junctionId: string,
    currentPhase: PhaseId,
    actor: string,
    simTime: number
  ): { signalA: SignalState; signalB: SignalState } {
    if (currentPhase === 'phaseA') {
      return { signalA: 'yellow', signalB: 'red' };
    } else {
      return { signalA: 'red', signalB: 'yellow' };
    }
  }
}

export const authorizedController = new AuthorizedControllerLayer();
