import {
  AdaptiveConfig,
  ControllerState,
  FixedConfig,
  PhaseId,
  SimulationMetrics,
  Vehicle,
} from '../types';

// Hourly arrival curve (% of maximum arrival intensity)
// Index 0 = Midnight, 8 = 8:00 AM (80%), 9 = 9:00 AM (95%), 18 = 6:00 PM (72%), 19 = 7:00 PM (90%)
export const HOURLY_INTENSITY: number[] = [
  5, 3, 2, 2, 3, 8, 20, 45, 80, 95, 60, 42, 38, 40, 42, 45, 50, 58, 72, 90, 68, 40, 20, 10,
];

// Color palette for simulated procedural vehicles
const VEHICLE_COLORS = [
  '#4F8CFF', // Electric blue
  '#2EE6A6', // Mint green
  '#FFB547', // Amber
  '#E8ECF5', // Pearl white
  '#FF5C6C', // Crimson
  '#A78BFA', // Purple
  '#38BDF8', // Sky
  '#94A3B8', // Silver
];

export const INITIAL_FIXED_CONFIG: FixedConfig = {
  greenDuration: 25,
  yellowDuration: 3,
};

export const INITIAL_ADAPTIVE_CONFIG: AdaptiveConfig = {
  baseGreen: 15,
  maxExtraGreen: 20,
  maxWaitCap: 60,
  yellowDuration: 3,
};

export function createInitialControllerState(): ControllerState {
  return {
    currentPhase: 'phaseA',
    signalA: 'green',
    signalB: 'red',
    phaseElapsed: 0,
    yellowRemaining: 0,
    targetGreenDuration: 25,
    queueA: [],
    queueB: [],
    totalArrivals: 0,
    totalProcessed: 0,
    totalWaitTime: 0,
    avgWait: 0,
    maxQueue: 0,
    throughputHistory: [],
    waitHistory: [],
    queueHistory: [],
  };
}

export class TrafficSimulator {
  private simTime: number = 0; // seconds elapsed since start
  private initialTimeOffset: number = 8 * 3600; // Start at 08:00 AM rush hour peak
  private rushMultiplier: number = 1.0;
  private incident: { phase: PhaseId; secondsRemaining: number } | null = null;

  private fixedState: ControllerState;
  private adaptiveState: ControllerState;

  private fixedConfig: FixedConfig;
  private adaptiveConfig: AdaptiveConfig;

  private vehicleIdCounter: number = 1;
  private recentClearedFixed: number[] = []; // cleared timestamps for last 60s
  private recentClearedAdaptive: number[] = []; // cleared timestamps for last 60s

  constructor() {
    this.fixedConfig = { ...INITIAL_FIXED_CONFIG };
    this.adaptiveConfig = { ...INITIAL_ADAPTIVE_CONFIG };
    this.fixedState = createInitialControllerState();
    this.adaptiveState = createInitialControllerState();
    this.adaptiveState.targetGreenDuration = this.adaptiveConfig.baseGreen;
    
    // Warm up the simulation slightly with realistic initial urban queues
    this.warmUp(45);
  }

  // Pre-populate with typical morning queue so users don't start at empty intersection
  private warmUp(seconds: number) {
    for (let i = 0; i < seconds; i++) {
      this.tick();
    }
  }

  public reset() {
    this.simTime = 0;
    this.vehicleIdCounter = 1;
    this.incident = null;
    this.recentClearedFixed = [];
    this.recentClearedAdaptive = [];
    this.fixedState = createInitialControllerState();
    this.adaptiveState = createInitialControllerState();
    this.adaptiveState.targetGreenDuration = this.adaptiveConfig.baseGreen;
    this.warmUp(30);
  }

  public setRushMultiplier(multiplier: number) {
    this.rushMultiplier = Math.max(0.2, Math.min(3.0, multiplier));
  }

  public getRushMultiplier(): number {
    return this.rushMultiplier;
  }

  public updateAdaptiveConfig(config: Partial<AdaptiveConfig>) {
    this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
  }

  public getAdaptiveConfig(): AdaptiveConfig {
    return { ...this.adaptiveConfig };
  }

  public updateFixedConfig(config: Partial<FixedConfig>) {
    this.fixedConfig = { ...this.fixedConfig, ...config };
  }

  public getFixedConfig(): FixedConfig {
    return { ...this.fixedConfig };
  }

  public injectIncident(phase: PhaseId, durationSeconds: number = 30) {
    this.incident = {
      phase,
      secondsRemaining: durationSeconds,
    };
  }

  public getSimTime(): number {
    return this.simTime;
  }

  public getTimeOfDaySeconds(): number {
    return (this.initialTimeOffset + this.simTime) % 86400;
  }

  public getTimeOfDayString(): string {
    const totalSecs = this.getTimeOfDaySeconds();
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(displayHours)}:${pad(mins)} ${period}`;
  }

  public getHourOfDay(): number {
    return Math.floor(this.getTimeOfDaySeconds() / 3600);
  }

  public getCurrentIntensity(): number {
    const hour = this.getHourOfDay();
    const nextHour = (hour + 1) % 24;
    const minute = Math.floor((this.getTimeOfDaySeconds() % 3600) / 60);
    const fraction = minute / 60;
    // Linear interpolation between hours
    const base = HOURLY_INTENSITY[hour] * (1 - fraction) + HOURLY_INTENSITY[nextHour] * fraction;
    return base * this.rushMultiplier;
  }

  /**
   * Main simulation step: executes one simulated second
   */
  public tick() {
    this.simTime += 1;

    // Handle incident countdown
    if (this.incident) {
      this.incident.secondsRemaining -= 1;
      if (this.incident.secondsRemaining <= 0) {
        this.incident = null;
      }
    }

    // 1. Generate Poisson-style arrivals for this tick
    const arrivals = this.generateArrivals();

    // 2. Clone identical arrivals to both controllers
    const arrivalsFixed = arrivals.map((v) => ({ ...v }));
    const arrivalsAdaptive = arrivals.map((v) => ({ ...v }));

    // 3. Shared deterministic saturation discharge capacity for this tick
    const dischargeRoll = Math.random();
    const tickDischargeCapacity = dischargeRoll < 0.18 ? 2 : dischargeRoll < 0.80 ? 1 : 0;

    // 4. Step Fixed Controller
    this.stepFixedController(arrivalsFixed, tickDischargeCapacity);

    // 5. Step Adaptive Controller
    this.stepAdaptiveController(arrivalsAdaptive, tickDischargeCapacity);

    // 6. Update history (every 5 seconds to keep memory bounded and graphs clean)
    if (this.simTime % 5 === 0) {
      this.recordHistory();
    }
  }

  private generateArrivals(): Vehicle[] {
    const arrivals: Vehicle[] = [];
    const intensity = this.getCurrentIntensity(); // e.g. 95 during peak

    // Base Poisson probability calculation per second:
    // Peak 100% intensity ~ 0.55 arrivals per second on average across intersection
    let arrivalProbA = (intensity / 100) * 0.28;
    let arrivalProbB = (intensity / 100) * 0.24;

    // If active incident on a phase, surge its arrivals significantly
    if (this.incident) {
      if (this.incident.phase === 'phaseA') {
        arrivalProbA *= 2.6;
      } else {
        arrivalProbB *= 2.6;
      }
    }

    // Phase A (North-South)
    if (Math.random() < arrivalProbA) {
      const dir = Math.random() > 0.5 ? 'north' : 'south';
      arrivals.push({
        id: `v_${this.vehicleIdCounter++}`,
        phase: 'phaseA',
        direction: dir,
        arrivalTime: this.simTime,
        waitDuration: 0,
        color: VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)],
        speed: 1.0,
      });
    }

    // Phase B (East-West)
    if (Math.random() < arrivalProbB) {
      const dir = Math.random() > 0.5 ? 'east' : 'west';
      arrivals.push({
        id: `v_${this.vehicleIdCounter++}`,
        phase: 'phaseB',
        direction: dir,
        arrivalTime: this.simTime,
        waitDuration: 0,
        color: VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)],
        speed: 1.0,
      });
    }

    return arrivals;
  }

  private stepFixedController(arrivals: Vehicle[], dischargeCapacity: number) {
    const s = this.fixedState;

    // Add arrivals
    for (const v of arrivals) {
      if (v.phase === 'phaseA') {
        s.queueA.push(v);
      } else {
        s.queueB.push(v);
      }
      s.totalArrivals += 1;
    }

    // Increment wait durations for queued vehicles
    for (const v of s.queueA) v.waitDuration += 1;
    for (const v of s.queueB) v.waitDuration += 1;

    // Process signal state machine
    s.phaseElapsed += 1;

    if (s.yellowRemaining > 0) {
      // In yellow transition
      s.yellowRemaining -= 1;
      if (s.yellowRemaining <= 0) {
        // Yellow expired, switch active phase to green
        if (s.currentPhase === 'phaseA') {
          s.currentPhase = 'phaseB';
          s.signalA = 'red';
          s.signalB = 'green';
        } else {
          s.currentPhase = 'phaseA';
          s.signalA = 'green';
          s.signalB = 'red';
        }
        s.phaseElapsed = 0;
      }
    } else {
      // In green phase
      if (s.phaseElapsed >= this.fixedConfig.greenDuration) {
        // Green duration reached, start yellow
        s.yellowRemaining = this.fixedConfig.yellowDuration;
        if (s.currentPhase === 'phaseA') {
          s.signalA = 'yellow';
        } else {
          s.signalB = 'yellow';
        }
      }
    }

    // Clear vehicles from green queue using shared tick discharge capacity
    const activeQueue = s.currentPhase === 'phaseA' ? s.queueA : s.queueB;
    const isGreen = (s.currentPhase === 'phaseA' && s.signalA === 'green') ||
                    (s.currentPhase === 'phaseB' && s.signalB === 'green');

    if (isGreen && activeQueue.length > 0 && dischargeCapacity > 0) {
      const actualCleared = Math.min(dischargeCapacity, activeQueue.length);

      for (let i = 0; i < actualCleared; i++) {
        const cleared = activeQueue.shift();
        if (cleared) {
          s.totalProcessed += 1;
          s.totalWaitTime += cleared.waitDuration;
          this.recentClearedFixed.push(this.simTime);
        }
      }
    }

    // Update cumulative metrics
    s.avgWait = s.totalProcessed > 0 ? s.totalWaitTime / s.totalProcessed : 0;
    const currentTotalQueue = s.queueA.length + s.queueB.length;
    if (currentTotalQueue > s.maxQueue) {
      s.maxQueue = currentTotalQueue;
    }
  }

  private stepAdaptiveController(arrivals: Vehicle[], dischargeCapacity: number) {
    const s = this.adaptiveState;
    const cfg = this.adaptiveConfig;

    // Add arrivals
    for (const v of arrivals) {
      if (v.phase === 'phaseA') {
        s.queueA.push(v);
      } else {
        s.queueB.push(v);
      }
      s.totalArrivals += 1;
    }

    // Increment wait duration
    for (const v of s.queueA) v.waitDuration += 1;
    for (const v of s.queueB) v.waitDuration += 1;

    s.phaseElapsed += 1;

    const activeQueue = s.currentPhase === 'phaseA' ? s.queueA : s.queueB;
    const inactiveQueue = s.currentPhase === 'phaseA' ? s.queueB : s.queueA;

    // Find max waiting vehicle in inactive queue to enforce starvation cap
    let inactiveMaxWait = 0;
    for (const v of inactiveQueue) {
      if (v.waitDuration > inactiveMaxWait) {
        inactiveMaxWait = v.waitDuration;
      }
    }

    if (s.yellowRemaining > 0) {
      // In yellow transition
      s.yellowRemaining -= 1;
      if (s.yellowRemaining <= 0) {
        // Switch to the other phase
        if (s.currentPhase === 'phaseA') {
          s.currentPhase = 'phaseB';
          s.signalA = 'red';
          s.signalB = 'green';
        } else {
          s.currentPhase = 'phaseA';
          s.signalA = 'green';
          s.signalB = 'red';
        }
        s.phaseElapsed = 0;

        // Compute dynamic green duration for newly activated phase:
        // Base green (15s) + up to 20s extra scaled by queue pressure
        const newActive = s.currentPhase === 'phaseA' ? s.queueA.length : s.queueB.length;
        const newInactive = s.currentPhase === 'phaseA' ? s.queueB.length : s.queueA.length;
        const total = Math.max(1, newActive + newInactive);
        const ratio = newActive / total; // between 0 and 1
        
        // Scale extra green dynamically
        const extraGreen = Math.min(cfg.maxExtraGreen, Math.round(cfg.maxExtraGreen * ratio * 1.5));
        s.targetGreenDuration = Math.max(cfg.baseGreen, cfg.baseGreen + extraGreen);
      }
    } else {
      // Currently green
      const isGreen = (s.currentPhase === 'phaseA' && s.signalA === 'green') ||
                      (s.currentPhase === 'phaseB' && s.signalB === 'green');

      if (isGreen) {
        let shouldTriggerYellow = false;

        // Condition 1: Inactive queue vehicle has reached starvation limit (e.g. 60s)
        if (inactiveMaxWait >= cfg.maxWaitCap && inactiveQueue.length > 0) {
          shouldTriggerYellow = true;
        }

        // Condition 2: Active queue is empty while inactive queue has waiting cars
        // (terminate green early once minimum clearance interval of 8s is met)
        if (activeQueue.length === 0 && inactiveQueue.length > 0 && s.phaseElapsed >= 8) {
          shouldTriggerYellow = true;
        }

        // Condition 3: Reached calculated target green duration
        if (s.phaseElapsed >= s.targetGreenDuration) {
          shouldTriggerYellow = true;
        }

        if (shouldTriggerYellow) {
          s.yellowRemaining = cfg.yellowDuration;
          if (s.currentPhase === 'phaseA') {
            s.signalA = 'yellow';
          } else {
            s.signalB = 'yellow';
          }
        }
      }
    }

    // Vehicle discharge for adaptive using same shared tick discharge capacity
    const isGreen = (s.currentPhase === 'phaseA' && s.signalA === 'green') ||
                    (s.currentPhase === 'phaseB' && s.signalB === 'green');

    if (isGreen && activeQueue.length > 0 && dischargeCapacity > 0) {
      const actualCleared = Math.min(dischargeCapacity, activeQueue.length);

      for (let i = 0; i < actualCleared; i++) {
        const cleared = activeQueue.shift();
        if (cleared) {
          s.totalProcessed += 1;
          s.totalWaitTime += cleared.waitDuration;
          this.recentClearedAdaptive.push(this.simTime);
        }
      }
    }

    s.avgWait = s.totalProcessed > 0 ? s.totalWaitTime / s.totalProcessed : 0;
    const currentTotalQueue = s.queueA.length + s.queueB.length;
    if (currentTotalQueue > s.maxQueue) {
      s.maxQueue = currentTotalQueue;
    }
  }

  private recordHistory() {
    const cutoff = this.simTime - 60;
    // Clean old timestamps
    this.recentClearedFixed = this.recentClearedFixed.filter((t) => t >= cutoff);
    this.recentClearedAdaptive = this.recentClearedAdaptive.filter((t) => t >= cutoff);

    const throughputFixed = this.recentClearedFixed.length; // vehicles in last minute
    const throughputAdaptive = this.recentClearedAdaptive.length;

    // Fixed history
    this.fixedState.throughputHistory.push({
      timestamp: this.simTime,
      throughput: throughputFixed,
    });
    this.fixedState.waitHistory.push({
      timestamp: this.simTime,
      avgWait: parseFloat(this.fixedState.avgWait.toFixed(1)),
    });
    this.fixedState.queueHistory.push({
      timestamp: this.simTime,
      queueTotal: this.fixedState.queueA.length + this.fixedState.queueB.length,
    });

    // Adaptive history
    this.adaptiveState.throughputHistory.push({
      timestamp: this.simTime,
      throughput: throughputAdaptive,
    });
    this.adaptiveState.waitHistory.push({
      timestamp: this.simTime,
      avgWait: parseFloat(this.adaptiveState.avgWait.toFixed(1)),
    });
    this.adaptiveState.queueHistory.push({
      timestamp: this.simTime,
      queueTotal: this.adaptiveState.queueA.length + this.adaptiveState.queueB.length,
    });

    // Cap history length to 30 items for performant chart rendering
    if (this.fixedState.throughputHistory.length > 30) {
      this.fixedState.throughputHistory.shift();
      this.fixedState.waitHistory.shift();
      this.fixedState.queueHistory.shift();
      this.adaptiveState.throughputHistory.shift();
      this.adaptiveState.waitHistory.shift();
      this.adaptiveState.queueHistory.shift();
    }
  }

  public getSnapshot(): SimulationMetrics {
    const fixedAvg = this.fixedState.avgWait;
    const adaptiveAvg = this.adaptiveState.avgWait;

    let improvement = 0;
    if (fixedAvg > 0) {
      improvement = ((fixedAvg - adaptiveAvg) / fixedAvg) * 100;
    }

    const intensity = this.getCurrentIntensity();
    let densityLabel: 'Low' | 'Moderate' | 'Heavy' = 'Low';
    if (intensity > 65) {
      densityLabel = 'Heavy';
    } else if (intensity > 35) {
      densityLabel = 'Moderate';
    }

    // Forecast next 15 minutes congestion using moving average
    const currentQueue = this.adaptiveState.queueA.length + this.adaptiveState.queueB.length;
    const forecastCongestion = [];
    const trendFactor = intensity / 60;

    for (let m = 3; m <= 15; m += 3) {
      // Projected queue based on intensity trend
      const projected = Math.max(
        2,
        Math.round(currentQueue * (0.85 + (trendFactor - 1) * 0.2 + (m / 15) * 0.15))
      );
      forecastCongestion.push({
        minuteAhead: m,
        projectedQueue: projected,
        confidence: Math.round(96 - m * 1.8),
      });
    }

    return {
      simTime: this.simTime,
      timeOfDaySeconds: this.getTimeOfDaySeconds(),
      timeOfDayString: this.getTimeOfDayString(),
      hourOfDay: this.getHourOfDay(),
      intensityCurrent: Math.round(intensity),
      rushMultiplier: this.rushMultiplier,
      activeIncident: this.incident ? { ...this.incident } : null,
      fixed: {
        ...this.fixedState,
        queueA: [...this.fixedState.queueA],
        queueB: [...this.fixedState.queueB],
        throughputHistory: [...this.fixedState.throughputHistory],
        waitHistory: [...this.fixedState.waitHistory],
        queueHistory: [...this.fixedState.queueHistory],
      },
      adaptive: {
        ...this.adaptiveState,
        queueA: [...this.adaptiveState.queueA],
        queueB: [...this.adaptiveState.queueB],
        throughputHistory: [...this.adaptiveState.throughputHistory],
        waitHistory: [...this.adaptiveState.waitHistory],
        queueHistory: [...this.adaptiveState.queueHistory],
      },
      improvementPercent: parseFloat(improvement.toFixed(1)),
      densityLabel,
      forecastCongestion,
    };
  }
}
