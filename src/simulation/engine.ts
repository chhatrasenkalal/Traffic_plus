import {
  AdaptiveConfig,
  CameraStats,
  ControllerState,
  Direction,
  FixedConfig,
  JunctionData,
  PhaseId,
  SensorReading,
  SimulationGlobalMetrics,
  SystemHealth,
  Vehicle,
  VehicleType,
  WeatherType,
} from '../types';
import { cameraAdapter, sensorAdapter } from '../services/adapters';
import { eventBus } from '../services/eventBus';
import { fuseTelemetry } from '../services/fusion';

export const HOURLY_INTENSITY = [
  5, 3, 2, 2, 3, 8, 20, 45, 80, 95, 60, 42, 38, 40, 42, 45, 50, 58, 72, 90, 68, 40, 20, 10,
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

export const JUNCTION_DEFS = [
  { id: 'JCT-001', name: 'Grand Central & 1st Ave', gridX: -30, gridZ: -30 },
  { id: 'JCT-002', name: 'Grand Central & Tech Blvd', gridX: 30, gridZ: -30 },
  { id: 'JCT-003', name: 'South Bay & 1st Ave', gridX: -30, gridZ: 30 },
  { id: 'JCT-004', name: 'South Bay & Tech Blvd', gridX: 30, gridZ: 30 },
];

// Seeded pseudo-random generator (Mulberry32)
export class PRNG {
  private s: number;
  constructor(seed: number = 42) {
    this.s = seed;
  }
  public next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  public setSeed(seed: number) {
    this.s = seed;
  }
}

const VEHICLE_MIX: { type: VehicleType; prob: number; length: number; speedMultiplier: number }[] = [
  { type: 'car', prob: 0.70, length: 4.2, speedMultiplier: 1.0 },
  { type: 'motorcycle', prob: 0.15, length: 1.8, speedMultiplier: 1.15 },
  { type: 'bus', prob: 0.07, length: 10.5, speedMultiplier: 0.75 },
  { type: 'truck', prob: 0.08, length: 11.5, speedMultiplier: 0.70 },
];

const VEHICLE_COLORS = [
  '#4F8CFF', '#2EE6A6', '#FFB547', '#E8ECF5', '#FF5C6C', '#A78BFA', '#38BDF8', '#94A3B8',
];

export function createInitialControllerState(): ControllerState {
  return {
    currentPhase: 'phaseA',
    signalA: 'green',
    signalB: 'red',
    countdown: 25,
    phaseElapsed: 0,
    yellowRemaining: 0,
    targetGreenDuration: 25,
    queueA: [],
    queueB: [],
    laneQueues: { north: 0, south: 0, east: 0, west: 0 },
    totalArrivals: 0,
    totalProcessed: 0,
    totalWaitTime: 0,
    avgWait: 0,
    maxWait: 0,
    maxQueue: 0,
    averageTravelTime: 18,
    throughputHistory: [],
    waitHistory: [],
    queueHistory: [],
  };
}

export class DigitalTwinSimulation {
  private simTime: number = 0;
  private timeOffset: number = 8 * 3600; // 08:00 AM rush hour peak
  private seed: number = 42;
  private prng: PRNG;
  private rushMultiplier: number = 1.0;
  private weather: WeatherType = 'normal';
  private speed: 1 | 5 | 20 = 1;

  private fixedConfig: FixedConfig = { ...INITIAL_FIXED_CONFIG };
  private adaptiveConfig: AdaptiveConfig = { ...INITIAL_ADAPTIVE_CONFIG };

  private junctions: Record<string, JunctionData> = {};
  private vehicleIdCounter: number = 1;

  constructor(initialSeed: number = 42) {
    this.seed = initialSeed;
    this.prng = new PRNG(initialSeed);
    sensorAdapter.connect();
    cameraAdapter.connect();
    this.initJunctions();
    this.warmUp(25);
  }

  private initJunctions() {
    this.junctions = {};
    for (const def of JUNCTION_DEFS) {
      const fixed = createInitialControllerState();
      const adaptive = createInitialControllerState();
      adaptive.targetGreenDuration = this.adaptiveConfig.baseGreen;
      adaptive.countdown = this.adaptiveConfig.baseGreen;

      const initialFused = fuseTelemetry(
        def.id,
        null,
        null,
        0,
        this.weather,
        this.timeOffset
      );

      this.junctions[def.id] = {
        id: def.id,
        name: def.name,
        gridX: def.gridX,
        gridZ: def.gridZ,
        fixedController: fixed,
        adaptiveController: adaptive,
        currentSensorReading: null,
        currentCameraStats: null,
        fusedReading: initialFused,
      };
    }
  }

  private warmUp(seconds: number) {
    for (let i = 0; i < seconds; i++) {
      this.tick();
    }
  }

  public reset(newSeed?: number) {
    if (newSeed !== undefined) this.seed = newSeed;
    this.prng.setSeed(this.seed);
    this.simTime = 0;
    this.vehicleIdCounter = 1;
    this.initJunctions();
    this.warmUp(20);
  }

  public setSeed(newSeed: number) {
    this.seed = newSeed;
    this.reset(newSeed);
  }

  public getSeed(): number {
    return this.seed;
  }

  public setRushMultiplier(mult: number) {
    this.rushMultiplier = Math.max(0.5, Math.min(2.5, mult));
  }

  public getRushMultiplier(): number {
    return this.rushMultiplier;
  }

  public setWeather(w: WeatherType) {
    this.weather = w;
    eventBus.publish('environment/rain', {
      weather: w,
      timestamp: Date.now(),
    });
  }

  public getWeather(): WeatherType {
    return this.weather;
  }

  public updateAdaptiveConfig(cfg: Partial<AdaptiveConfig>) {
    this.adaptiveConfig = { ...this.adaptiveConfig, ...cfg };
  }

  public getAdaptiveConfig(): AdaptiveConfig {
    return { ...this.adaptiveConfig };
  }

  public getTimeOfDaySeconds(): number {
    return (this.timeOffset + this.simTime) % 86400;
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
    const base = HOURLY_INTENSITY[hour] * (1 - fraction) + HOURLY_INTENSITY[nextHour] * fraction;
    return base * this.rushMultiplier;
  }

  private pickVehicleType(): { type: VehicleType; length: number; speedMultiplier: number } {
    const r = this.prng.next();
    let acc = 0;
    for (const v of VEHICLE_MIX) {
      acc += v.prob;
      if (r <= acc) return v;
    }
    return VEHICLE_MIX[0];
  }

  /**
   * Main simulation step (1 simulated second)
   */
  public tick() {
    this.simTime += 1;
    const intensity = this.getCurrentIntensity();
    const timeSec = this.getTimeOfDaySeconds();

    // Iterate over each junction
    for (const jctId of Object.keys(this.junctions)) {
      const jct = this.junctions[jctId];

      // 1. Generate seeded Poisson arrivals for this junction
      const arrivals: Vehicle[] = [];
      const baseProb = (intensity / 100) * 0.28;

      // Phase A arrivals (North-South)
      if (this.prng.next() < baseProb) {
        const dir: Direction = this.prng.next() > 0.5 ? 'north' : 'south';
        const vInfo = this.pickVehicleType();
        arrivals.push({
          id: `v_${this.vehicleIdCounter++}`,
          type: vInfo.type,
          junctionId: jctId,
          phase: 'phaseA',
          direction: dir,
          lane: dir === 'north' ? 1 : 2,
          arrivalTime: this.simTime,
          waitDuration: 0,
          color: VEHICLE_COLORS[Math.floor(this.prng.next() * VEHICLE_COLORS.length)],
          speed: 1.0 * vInfo.speedMultiplier,
          length: vInfo.length,
        });
      }

      // Phase B arrivals (East-West)
      if (this.prng.next() < baseProb * 0.92) {
        const dir: Direction = this.prng.next() > 0.5 ? 'east' : 'west';
        const vInfo = this.pickVehicleType();
        arrivals.push({
          id: `v_${this.vehicleIdCounter++}`,
          type: vInfo.type,
          junctionId: jctId,
          phase: 'phaseB',
          direction: dir,
          lane: dir === 'east' ? 3 : 4,
          arrivalTime: this.simTime,
          waitDuration: 0,
          color: VEHICLE_COLORS[Math.floor(this.prng.next() * VEHICLE_COLORS.length)],
          speed: 1.0 * vInfo.speedMultiplier,
          length: vInfo.length,
        });
      }

      // Clone identical arrivals to both controllers for absolute fairness
      const arrivalsFixed = arrivals.map((v) => ({ ...v }));
      const arrivalsAdaptive = arrivals.map((v) => ({ ...v }));

      // 2. Step Fixed Controller
      this.stepFixed(jct.fixedController, arrivalsFixed);

      // 3. Step Adaptive Controller
      this.stepAdaptive(jct.adaptiveController, arrivalsAdaptive);

      // 4. Synthesize Camera & Sensor telemetry and publish to EventBus
      const totalAdaptiveQueue =
        jct.adaptiveController.queueA.length + jct.adaptiveController.queueB.length;

      const sensorReading: SensorReading = {
        deviceId: `SEN-${jctId}-L1`,
        junctionId: jctId,
        lane: 1,
        timestamp: timeSec,
        vehicleCount: Math.round(totalAdaptiveQueue * 0.8),
        occupancy: Math.min(100, Math.round(totalAdaptiveQueue * 3.6)),
        temperature: 22,
        humidity: this.weather === 'rain' ? 88 : 55,
        rain: this.weather === 'rain' ? 4.2 : this.weather === 'heavy rain' ? 18.5 : 0,
        waterLevel: this.weather === 'flood' ? 12 : 0,
        rssi: -68,
        status: 'ONLINE',
      };
      jct.currentSensorReading = sensorReading;
      sensorAdapter.publish(`traffic/lane/${jctId}`, sensorReading);

      const cameraStats: CameraStats = {
        cameraId: `CAM-${jctId}-01`,
        junctionId: jctId,
        timestamp: timeSec,
        fps: 29.8,
        vehicles: totalAdaptiveQueue,
        cars: Math.round(totalAdaptiveQueue * 0.7),
        motorcycles: Math.round(totalAdaptiveQueue * 0.15),
        buses: Math.round(totalAdaptiveQueue * 0.07),
        trucks: Math.round(totalAdaptiveQueue * 0.08),
        averageSpeed: Math.max(12, 48 - totalAdaptiveQueue * 1.5),
        queueLength: totalAdaptiveQueue,
        density: Math.min(100, Math.round(totalAdaptiveQueue * 3.4)),
        confidence: this.weather === 'fog' ? 65 : this.weather === 'heavy rain' ? 78 : 94,
        status: 'ONLINE',
      };
      jct.currentCameraStats = cameraStats;
      cameraAdapter.publish(`traffic/camera/${jctId}`, cameraStats);

      // 5. Sensor Fusion Engine
      jct.fusedReading = fuseTelemetry(
        jctId,
        cameraStats,
        sensorReading,
        totalAdaptiveQueue,
        this.weather,
        timeSec
      );

      // Publish signal status
      eventBus.publish(`signal/status/${jctId}`, {
        junctionId: jctId,
        phase: jct.adaptiveController.currentPhase,
        signalA: jct.adaptiveController.signalA,
        signalB: jct.adaptiveController.signalB,
        countdown: jct.adaptiveController.countdown,
      });

      // 6. Record history every 5 seconds
      if (this.simTime % 5 === 0) {
        this.recordHistory(jct.fixedController);
        this.recordHistory(jct.adaptiveController);
      }
    }
  }

  private stepFixed(s: ControllerState, arrivals: Vehicle[]) {
    for (const v of arrivals) {
      if (v.phase === 'phaseA') s.queueA.push(v);
      else s.queueB.push(v);
      s.totalArrivals += 1;
    }

    for (const v of s.queueA) {
      v.waitDuration += 1;
      if (v.waitDuration > s.maxWait) s.maxWait = v.waitDuration;
    }
    for (const v of s.queueB) {
      v.waitDuration += 1;
      if (v.waitDuration > s.maxWait) s.maxWait = v.waitDuration;
    }

    s.phaseElapsed += 1;

    if (s.yellowRemaining > 0) {
      s.yellowRemaining -= 1;
      s.countdown = s.yellowRemaining;
      if (s.yellowRemaining <= 0) {
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
        s.countdown = this.fixedConfig.greenDuration;
      }
    } else {
      s.countdown = Math.max(0, this.fixedConfig.greenDuration - s.phaseElapsed);
      if (s.phaseElapsed >= this.fixedConfig.greenDuration) {
        s.yellowRemaining = this.fixedConfig.yellowDuration;
        s.countdown = s.yellowRemaining;
        if (s.currentPhase === 'phaseA') s.signalA = 'yellow';
        else s.signalB = 'yellow';
      }
    }

    // Clearance
    const activeQueue = s.currentPhase === 'phaseA' ? s.queueA : s.queueB;
    const isGreen =
      (s.currentPhase === 'phaseA' && s.signalA === 'green') ||
      (s.currentPhase === 'phaseB' && s.signalB === 'green');

    if (isGreen && activeQueue.length > 0) {
      const roll = this.prng.next();
      const count = roll < 0.15 ? 2 : roll < 0.75 ? 1 : 0;
      const actual = Math.min(count, activeQueue.length);
      for (let i = 0; i < actual; i++) {
        const clr = activeQueue.shift();
        if (clr) {
          s.totalProcessed += 1;
          s.totalWaitTime += clr.waitDuration;
        }
      }
    }

    s.avgWait = s.totalProcessed > 0 ? s.totalWaitTime / s.totalProcessed : 0;
    const curQueue = s.queueA.length + s.queueB.length;
    if (curQueue > s.maxQueue) s.maxQueue = curQueue;
    s.averageTravelTime = parseFloat((14 + s.avgWait * 0.9).toFixed(1));

    s.laneQueues = {
      north: s.queueA.filter((v) => v.direction === 'north').length,
      south: s.queueA.filter((v) => v.direction === 'south').length,
      east: s.queueB.filter((v) => v.direction === 'east').length,
      west: s.queueB.filter((v) => v.direction === 'west').length,
    };
  }

  private stepAdaptive(s: ControllerState, arrivals: Vehicle[]) {
    const cfg = this.adaptiveConfig;

    for (const v of arrivals) {
      if (v.phase === 'phaseA') s.queueA.push(v);
      else s.queueB.push(v);
      s.totalArrivals += 1;
    }

    for (const v of s.queueA) {
      v.waitDuration += 1;
      if (v.waitDuration > s.maxWait) s.maxWait = v.waitDuration;
    }
    for (const v of s.queueB) {
      v.waitDuration += 1;
      if (v.waitDuration > s.maxWait) s.maxWait = v.waitDuration;
    }

    s.phaseElapsed += 1;

    const activeQueue = s.currentPhase === 'phaseA' ? s.queueA : s.queueB;
    const inactiveQueue = s.currentPhase === 'phaseA' ? s.queueB : s.queueA;

    let inactiveMaxWait = 0;
    for (const v of inactiveQueue) {
      if (v.waitDuration > inactiveMaxWait) inactiveMaxWait = v.waitDuration;
    }

    if (s.yellowRemaining > 0) {
      s.yellowRemaining -= 1;
      s.countdown = s.yellowRemaining;
      if (s.yellowRemaining <= 0) {
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

        // Dynamic extra green calculation
        const newActive = s.currentPhase === 'phaseA' ? s.queueA.length : s.queueB.length;
        const newInactive = s.currentPhase === 'phaseA' ? s.queueB.length : s.queueA.length;
        const ratio = newActive / Math.max(1, newActive + newInactive);
        const extra = Math.min(cfg.maxExtraGreen, Math.round(cfg.maxExtraGreen * ratio * 1.5));
        s.targetGreenDuration = Math.max(cfg.baseGreen, cfg.baseGreen + extra);
        s.countdown = s.targetGreenDuration;
      }
    } else {
      s.countdown = Math.max(0, s.targetGreenDuration - s.phaseElapsed);
      const isGreen =
        (s.currentPhase === 'phaseA' && s.signalA === 'green') ||
        (s.currentPhase === 'phaseB' && s.signalB === 'green');

      if (isGreen) {
        let triggerYellow = false;

        // Condition 1: Starvation limit reached (e.g. 60s)
        if (inactiveMaxWait >= cfg.maxWaitCap && inactiveQueue.length > 0) {
          triggerYellow = true;
        }
        // Condition 2: Active queue cleared out early
        if (activeQueue.length === 0 && inactiveQueue.length > 0 && s.phaseElapsed >= Math.floor(cfg.baseGreen * 0.6)) {
          triggerYellow = true;
        }
        // Condition 3: Dynamic target duration reached
        if (s.phaseElapsed >= s.targetGreenDuration) {
          triggerYellow = true;
        }

        if (triggerYellow) {
          s.yellowRemaining = cfg.yellowDuration;
          s.countdown = s.yellowRemaining;
          if (s.currentPhase === 'phaseA') s.signalA = 'yellow';
          else s.signalB = 'yellow';
        }
      }
    }

    // Vehicle clearance
    const isGreen =
      (s.currentPhase === 'phaseA' && s.signalA === 'green') ||
      (s.currentPhase === 'phaseB' && s.signalB === 'green');

    if (isGreen && activeQueue.length > 0) {
      const roll = this.prng.next();
      const count = roll < 0.15 ? 2 : roll < 0.75 ? 1 : 0;
      const actual = Math.min(count, activeQueue.length);
      for (let i = 0; i < actual; i++) {
        const clr = activeQueue.shift();
        if (clr) {
          s.totalProcessed += 1;
          s.totalWaitTime += clr.waitDuration;
        }
      }
    }

    s.avgWait = s.totalProcessed > 0 ? s.totalWaitTime / s.totalProcessed : 0;
    const curQueue = s.queueA.length + s.queueB.length;
    if (curQueue > s.maxQueue) s.maxQueue = curQueue;
    s.averageTravelTime = parseFloat((14 + s.avgWait * 0.9).toFixed(1));

    s.laneQueues = {
      north: s.queueA.filter((v) => v.direction === 'north').length,
      south: s.queueA.filter((v) => v.direction === 'south').length,
      east: s.queueB.filter((v) => v.direction === 'east').length,
      west: s.queueB.filter((v) => v.direction === 'west').length,
    };
  }

  private recordHistory(s: ControllerState) {
    const curQueue = s.queueA.length + s.queueB.length;
    s.throughputHistory.push({
      timestamp: this.simTime,
      throughput: Math.round(s.totalProcessed * (60 / Math.max(1, this.simTime))),
    });
    s.waitHistory.push({
      timestamp: this.simTime,
      avgWait: parseFloat(s.avgWait.toFixed(1)),
    });
    s.queueHistory.push({
      timestamp: this.simTime,
      queueTotal: curQueue,
    });

    if (s.throughputHistory.length > 30) {
      s.throughputHistory.shift();
      s.waitHistory.shift();
      s.queueHistory.shift();
    }
  }

  public getSnapshot(): SimulationGlobalMetrics {
    let sumFixedWait = 0;
    let sumFixedMaxWait = 0;
    let sumFixedProcessed = 0;
    let sumFixedQueue = 0;
    let sumFixedTravel = 0;

    let sumAdaptiveWait = 0;
    let sumAdaptiveMaxWait = 0;
    let sumAdaptiveProcessed = 0;
    let sumAdaptiveQueue = 0;
    let sumAdaptiveTravel = 0;

    const jctKeys = Object.keys(this.junctions);
    const count = jctKeys.length;

    for (const key of jctKeys) {
      const j = this.junctions[key];
      sumFixedWait += j.fixedController.avgWait;
      sumFixedMaxWait = Math.max(sumFixedMaxWait, j.fixedController.maxWait);
      sumFixedProcessed += j.fixedController.totalProcessed;
      sumFixedQueue += j.fixedController.queueA.length + j.fixedController.queueB.length;
      sumFixedTravel += j.fixedController.averageTravelTime;

      sumAdaptiveWait += j.adaptiveController.avgWait;
      sumAdaptiveMaxWait = Math.max(sumAdaptiveMaxWait, j.adaptiveController.maxWait);
      sumAdaptiveProcessed += j.adaptiveController.totalProcessed;
      sumAdaptiveQueue += j.adaptiveController.queueA.length + j.adaptiveController.queueB.length;
      sumAdaptiveTravel += j.adaptiveController.averageTravelTime;
    }

    const fixedAvg = sumFixedWait / count;
    const adaptiveAvg = sumAdaptiveWait / count;

    let improvementPercent = 0;
    if (fixedAvg > 0) {
      improvementPercent = parseFloat((((fixedAvg - adaptiveAvg) / fixedAvg) * 100).toFixed(1));
    }

    const avgCongestionScore = Math.round(
      jctKeys.reduce((acc, k) => acc + this.junctions[k].fusedReading.congestionScore, 0) / count
    );

    let cityState: any = 'NORMAL';
    if (avgCongestionScore < 15) cityState = 'FREE';
    else if (avgCongestionScore < 35) cityState = 'NORMAL';
    else if (avgCongestionScore < 55) cityState = 'MODERATE';
    else if (avgCongestionScore < 75) cityState = 'HEAVY';
    else if (avgCongestionScore < 90) cityState = 'SEVERE';
    else cityState = 'GRIDLOCK';

    const health: SystemHealth = {
      eventBusStatus: 'HEALTHY',
      totalEventsProcessed: eventBus.getEventCount(),
      camerasOnline: 4,
      camerasTotal: 4,
      sensorsOnline: 4,
      sensorsTotal: 4,
      averageConfidence: Math.round(
        jctKeys.reduce((acc, k) => acc + this.junctions[k].fusedReading.confidence, 0) / count
      ),
    };

    return {
      simTime: this.simTime,
      timeOfDaySeconds: this.getTimeOfDaySeconds(),
      timeOfDayString: this.getTimeOfDayString(),
      hourOfDay: this.getHourOfDay(),
      intensityCurrent: Math.round(this.getCurrentIntensity()),
      rushMultiplier: this.rushMultiplier,
      weather: this.weather,
      seed: this.seed,
      junctions: { ...this.junctions },
      overallFixed: {
        avgWait: parseFloat(fixedAvg.toFixed(1)),
        maxWait: sumFixedMaxWait,
        totalProcessed: sumFixedProcessed,
        currentQueue: sumFixedQueue,
        avgTravelTime: parseFloat((sumFixedTravel / count).toFixed(1)),
      },
      overallAdaptive: {
        avgWait: parseFloat(adaptiveAvg.toFixed(1)),
        maxWait: sumAdaptiveMaxWait,
        totalProcessed: sumAdaptiveProcessed,
        currentQueue: sumAdaptiveQueue,
        avgTravelTime: parseFloat((sumAdaptiveTravel / count).toFixed(1)),
      },
      improvementPercent,
      cityWideCongestionState: cityState,
      health,
    };
  }
}
