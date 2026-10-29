// 4-Junction Urban Network Graph for TrafficPulse Digital Twin
import { JunctionNode } from '../types';

export const INITIAL_JUNCTIONS: JunctionNode[] = [
  {
    id: 'J1_CENTRAL',
    name: 'J1 Central Square (Main Intersection)',
    coords: { x: 0, z: 0 },
    activePhase: 'phaseA',
    signalA: 'green',
    signalB: 'red',
    isGreenCorridor: false,
    congestionLevel: 42,
    cameraSourceActive: true,
    sensorSourceActive: true,
  },
  {
    id: 'J2_NORTH',
    name: 'J2 North Grand Arterial',
    coords: { x: 0, z: -35 },
    activePhase: 'phaseA',
    signalA: 'green',
    signalB: 'red',
    isGreenCorridor: false,
    congestionLevel: 65,
    cameraSourceActive: true,
    sensorSourceActive: true,
  },
  {
    id: 'J3_WEST',
    name: 'J3 West Commercial Boulevard',
    coords: { x: -35, z: 0 },
    activePhase: 'phaseB',
    signalA: 'red',
    signalB: 'green',
    isGreenCorridor: false,
    congestionLevel: 30,
    cameraSourceActive: true,
    sensorSourceActive: true,
  },
  {
    id: 'J4_EAST',
    name: 'J4 East Metro Highway Concourse',
    coords: { x: 35, z: 0 },
    activePhase: 'phaseB',
    signalA: 'red',
    signalB: 'green',
    isGreenCorridor: false,
    congestionLevel: 55,
    cameraSourceActive: true,
    sensorSourceActive: true,
  },
];

export interface RoadLink {
  from: string;
  to: string;
  distanceMeters: number;
  baseTravelSeconds: number;
}

export const ROAD_LINKS: RoadLink[] = [
  { from: 'J2_NORTH', to: 'J1_CENTRAL', distanceMeters: 450, baseTravelSeconds: 35 },
  { from: 'J1_CENTRAL', to: 'J2_NORTH', distanceMeters: 450, baseTravelSeconds: 35 },
  { from: 'J3_WEST', to: 'J1_CENTRAL', distanceMeters: 450, baseTravelSeconds: 35 },
  { from: 'J1_CENTRAL', to: 'J3_WEST', distanceMeters: 450, baseTravelSeconds: 35 },
  { from: 'J4_EAST', to: 'J1_CENTRAL', distanceMeters: 450, baseTravelSeconds: 35 },
  { from: 'J1_CENTRAL', to: 'J4_EAST', distanceMeters: 450, baseTravelSeconds: 35 },
];

export function getShortestPathJunctions(startId: string, endId: string): string[] {
  if (startId === endId) return [startId];
  if (startId === 'J1_CENTRAL' || endId === 'J1_CENTRAL') {
    return [startId, endId];
  }
  // All satellite junctions route through J1 Central
  return [startId, 'J1_CENTRAL', endId];
}
