import {
  CameraStats,
  FusedReading,
  SensorReading,
  TrafficState,
  WeatherType,
} from '../types';

export function scoreToTrafficState(score: number): TrafficState {
  if (score < 15) return 'FREE';
  if (score < 35) return 'NORMAL';
  if (score < 55) return 'MODERATE';
  if (score < 75) return 'HEAVY';
  if (score < 90) return 'SEVERE';
  return 'GRIDLOCK';
}

export function getWeatherPenalty(weather: WeatherType): {
  speedFactor: number;
  visibilityPenalty: number;
  frictionPenalty: number;
} {
  switch (weather) {
    case 'rain':
      return { speedFactor: 0.88, visibilityPenalty: 5, frictionPenalty: 10 };
    case 'heavy rain':
      return { speedFactor: 0.72, visibilityPenalty: 15, frictionPenalty: 22 };
    case 'fog':
      return { speedFactor: 0.65, visibilityPenalty: 30, frictionPenalty: 12 };
    case 'storm':
      return { speedFactor: 0.55, visibilityPenalty: 35, frictionPenalty: 30 };
    case 'flood':
      return { speedFactor: 0.35, visibilityPenalty: 40, frictionPenalty: 50 };
    case 'normal':
    default:
      return { speedFactor: 1.0, visibilityPenalty: 0, frictionPenalty: 0 };
  }
}

/**
 * Multi-source sensor fusion engine
 * Combines camera telemetry, inductive loop sensors, weather, and simulation model
 */
export function fuseTelemetry(
  junctionId: string,
  camera: CameraStats | null,
  sensor: SensorReading | null,
  simulatedQueue: number,
  weather: WeatherType,
  timestamp: number
): FusedReading {
  const sourcesUsed: string[] = [];
  const weatherPenalty = getWeatherPenalty(weather);

  let fallbackUsed = false;
  let finalVehicleCount = 0;
  let finalOccupancy = 0;
  let finalSpeed = 45 * weatherPenalty.speedFactor;
  let finalQueue = simulatedQueue;
  let finalDensity = 20;
  let finalConfidence = 95;

  // Camera confidence decreases in low visibility (fog, storm)
  const cameraConfidence = camera
    ? Math.max(10, camera.confidence - weatherPenalty.visibilityPenalty)
    : 0;

  // Sensor confidence is unaffected by visibility but loop sensors only see lanes
  const sensorConfidence = sensor ? (sensor.status === 'ONLINE' ? 88 : 45) : 0;

  // Simulation confidence is fallback baseline (60%)
  const simConfidence = 60;

  // CASE 1: Both Camera and Sensor available
  if (camera && sensor && camera.status === 'ONLINE' && sensor.status === 'ONLINE') {
    sourcesUsed.push(camera.cameraId);
    sourcesUsed.push(sensor.deviceId);

    const totalWeight = cameraConfidence + sensorConfidence;
    const wCam = cameraConfidence / totalWeight;
    const wSen = sensorConfidence / totalWeight;

    finalVehicleCount = Math.round(camera.vehicles * wCam + sensor.vehicleCount * wSen);
    finalOccupancy = Math.round(sensor.occupancy * wSen + camera.density * wCam);
    finalSpeed = parseFloat((camera.averageSpeed * weatherPenalty.speedFactor).toFixed(1));
    finalQueue = Math.round(camera.queueLength * wCam + simulatedQueue * wSen);
    finalDensity = Math.round(camera.density * wCam + sensor.occupancy * wSen);
    finalConfidence = Math.round((cameraConfidence * 0.6 + sensorConfidence * 0.4));
  }
  // CASE 2: Camera only
  else if (camera && camera.status === 'ONLINE') {
    sourcesUsed.push(camera.cameraId);
    sourcesUsed.push('ESTIMATED_OCCUPANCY');

    finalVehicleCount = camera.vehicles;
    finalOccupancy = camera.density;
    finalSpeed = parseFloat((camera.averageSpeed * weatherPenalty.speedFactor).toFixed(1));
    finalQueue = camera.queueLength;
    finalDensity = camera.density;
    finalConfidence = Math.round(cameraConfidence);
  }
  // CASE 3: Sensor only
  else if (sensor && sensor.status === 'ONLINE') {
    sourcesUsed.push(sensor.deviceId);
    sourcesUsed.push('ESTIMATED_SPEED_MODEL');
    fallbackUsed = true;

    finalVehicleCount = sensor.vehicleCount;
    finalOccupancy = sensor.occupancy;
    // Inductive loop speed estimation heuristic
    const estimatedSpeed = Math.max(
      10,
      (50 - (sensor.occupancy / 100) * 35) * weatherPenalty.speedFactor
    );
    finalSpeed = parseFloat(estimatedSpeed.toFixed(1));
    finalQueue = Math.round(sensor.occupancy * 0.35 + simulatedQueue * 0.65);
    finalDensity = sensor.occupancy;
    finalConfidence = Math.round(sensorConfidence * 0.85);
  }
  // CASE 4: Pure simulation fallback (flagged)
  else {
    sourcesUsed.push('SIMULATION_MODEL_FALLBACK');
    fallbackUsed = true;

    finalVehicleCount = Math.round(simulatedQueue * 1.4);
    finalOccupancy = Math.min(100, Math.round(simulatedQueue * 3.5));
    finalSpeed = Math.max(8, parseFloat((45 - simulatedQueue * 1.2).toFixed(1)));
    finalQueue = simulatedQueue;
    finalDensity = Math.min(100, Math.round(simulatedQueue * 3.8));
    finalConfidence = simConfidence;
  }

  // Calculate composite congestion score (0 to 100)
  const densityComp = Math.min(100, finalDensity) * 0.35;
  const occComp = Math.min(100, finalOccupancy) * 0.25;
  const queueComp = Math.min(100, (finalQueue / 25) * 100) * 0.25;
  const speedReduction = Math.max(0, 1 - finalSpeed / 50) * 100 * 0.15;

  const rawCongestion = densityComp + occComp + queueComp + speedReduction + weatherPenalty.frictionPenalty * 0.3;
  const congestionScore = Math.min(100, Math.max(0, Math.round(rawCongestion)));
  const state = scoreToTrafficState(congestionScore);

  return {
    junctionId,
    timestamp,
    vehicleCount: finalVehicleCount,
    occupancy: finalOccupancy,
    averageSpeed: finalSpeed,
    queueLength: finalQueue,
    density: finalDensity,
    congestionScore,
    state,
    confidence: finalConfidence,
    sourcesUsed,
    fallbackUsed,
    provenance: {
      deviceIds: sourcesUsed,
      confidence: finalConfidence,
      updatedAgo: 1,
      mode: 'SIMULATED',
    },
  };
}
