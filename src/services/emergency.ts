// Emergency Response Operations Engine for TrafficPulse Digital Twin
import {
  EmergencyUnit,
  EmergencyUnitState,
  EmergencyUnitType,
  SimulatedHospital,
  SimulatedStation,
} from '../types';
import { addAuditLog } from './auditLog';
import { APP_EVENTS, eventBus } from './eventBus';
import { getShortestPathJunctions } from './roadGraph';

const STORAGE_KEY_UNITS = 'trafficpulse_units_v2';

export const SIMULATED_HOSPITALS: SimulatedHospital[] = [
  {
    id: 'HOSP-01',
    name: 'St. Jude Metro Trauma Center (SIMULATED)',
    specialty: 'Level 1 Trauma, Cardiology & Stroke',
    emergencyLoad: 68,
    icuBedsAvailable: 8,
    totalBeds: 45,
    baseEtaMinutes: 6.2,
    trafficAdjustedEtaMinutes: 7.5,
    recommendationScore: 94,
    recommendationReason: 'RECOMMENDED: Comprehensive Level 1 Trauma care with 8 ICU beds available despite slight ETA delta.',
  },
  {
    id: 'HOSP-02',
    name: 'City General Emergency Pavilion (SIMULATED)',
    specialty: 'General Emergency & Urgent Acute Care',
    emergencyLoad: 92,
    icuBedsAvailable: 1,
    totalBeds: 30,
    baseEtaMinutes: 4.1,
    trafficAdjustedEtaMinutes: 5.2,
    recommendationScore: 68,
    recommendationReason: 'NEAREST FACILITY BUT CRITICAL LOAD: 92% occupancy with only 1 ICU bed remaining; divert non-critical.',
  },
  {
    id: 'HOSP-03',
    name: 'University Health Memorial Hospital (SIMULATED)',
    specialty: 'Pediatric & Regional Burn Unit',
    emergencyLoad: 52,
    icuBedsAvailable: 14,
    totalBeds: 60,
    baseEtaMinutes: 8.5,
    trafficAdjustedEtaMinutes: 9.8,
    recommendationScore: 86,
    recommendationReason: 'HIGH CAPACITY: 14 ICU beds open; ideal fallback for major multi-casualty incidents.',
  },
];

export const SIMULATED_STATIONS: SimulatedStation[] = [
  {
    id: 'STN-P01',
    name: 'Metro Police Central District Precinct (SIMULATED)',
    type: 'police',
    location: 'North Approach Sector 2',
    junctionId: 'J2_NORTH',
    availableUnitsCount: 2,
  },
  {
    id: 'STN-F01',
    name: 'Downtown Fire & Rescue Station #4 (SIMULATED)',
    type: 'fire',
    location: 'West Commercial Concourse',
    junctionId: 'J3_WEST',
    availableUnitsCount: 1,
  },
  {
    id: 'STN-E01',
    name: 'Metropolitan EMS Dispatch Depot 01 (SIMULATED)',
    type: 'ems',
    location: 'East Highway Depot',
    junctionId: 'J4_EAST',
    availableUnitsCount: 2,
  },
];

const SEED_UNITS: EmergencyUnit[] = [
  {
    id: 'UNIT-MED-1',
    callSign: 'Medic-14 (Ambulance)',
    type: 'AMBULANCE',
    state: 'Available',
    currentJunctionId: 'J4_EAST',
    coords: { x: 35, z: 0 },
    homeStation: 'Metropolitan EMS Dispatch Depot 01',
    color: '#2EE6A6',
  },
  {
    id: 'UNIT-MED-2',
    callSign: 'Medic-22 (Ambulance)',
    type: 'AMBULANCE',
    state: 'Available',
    currentJunctionId: 'J2_NORTH',
    coords: { x: 0, z: -35 },
    homeStation: 'Metropolitan EMS Dispatch Depot 01',
    color: '#2EE6A6',
  },
  {
    id: 'UNIT-POL-1',
    callSign: 'Cruiser-104 (Police)',
    type: 'POLICE',
    state: 'Available',
    currentJunctionId: 'J2_NORTH',
    coords: { x: 0, z: -35 },
    homeStation: 'Metro Police Central District Precinct',
    color: '#4F8CFF',
  },
  {
    id: 'UNIT-POL-2',
    callSign: 'Cruiser-208 (Police)',
    type: 'POLICE',
    state: 'Available',
    currentJunctionId: 'J3_WEST',
    coords: { x: -35, z: 0 },
    homeStation: 'Metro Police Central District Precinct',
    color: '#4F8CFF',
  },
  {
    id: 'UNIT-FIR-1',
    callSign: 'Engine-4 (Fire/Rescue)',
    type: 'FIRE',
    state: 'Available',
    currentJunctionId: 'J3_WEST',
    coords: { x: -35, z: 0 },
    homeStation: 'Downtown Fire & Rescue Station #4',
    color: '#FF5C6C',
  },
];

class EmergencyEngine {
  private units: Map<string, EmergencyUnit> = new Map();

  constructor() {
    this.loadUnits();
  }

  private loadUnits() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNITS);
      if (saved) {
        const parsed: EmergencyUnit[] = JSON.parse(saved);
        parsed.forEach((u) => this.units.set(u.id, u));
        return;
      }
    } catch (e) {}
    SEED_UNITS.forEach((u) => this.units.set(u.id, u));
  }

  private saveUnits() {
    try {
      localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(Array.from(this.units.values())));
    } catch (e) {}
  }

  public getAllUnits(): EmergencyUnit[] {
    return Array.from(this.units.values());
  }

  public getUnitById(id: string): EmergencyUnit | undefined {
    return this.units.get(id);
  }

  public getRecommendedHospital(): SimulatedHospital {
    // Returns highest score hospital based on load and specialty
    return [...SIMULATED_HOSPITALS].sort((a, b) => b.recommendationScore - a.recommendationScore)[0];
  }

  /**
   * Finds nearest available unit of the required type using road graph travel times
   */
  public findNearestAvailableUnit(type: EmergencyUnitType, targetJunctionId: string): EmergencyUnit | undefined {
    const available = this.getAllUnits().filter((u) => u.type === type && u.state === 'Available');
    if (available.length === 0) return undefined;

    // Rank by graph distance
    return available.sort((a, b) => {
      const pathA = getShortestPathJunctions(a.currentJunctionId, targetJunctionId);
      const pathB = getShortestPathJunctions(b.currentJunctionId, targetJunctionId);
      return pathA.length - pathB.length;
    })[0];
  }

  /**
   * Dispatch unit to an incident
   */
  public dispatchUnit(
    unitId: string,
    incidentId: string,
    targetJunctionId: string,
    simTime: number = 0,
    actor: string = 'Emergency Operations Dispatcher'
  ): EmergencyUnit | undefined {
    const unit = this.units.get(unitId);
    if (!unit) return undefined;

    unit.state = 'Dispatched';
    unit.assignedIncidentId = incidentId;
    unit.targetJunctionId = targetJunctionId;
    unit.etaSeconds = 45; // 45 simulated seconds ETA

    // If unit is ambulance, recommend hospital
    if (unit.type === 'AMBULANCE') {
      const bestHosp = this.getRecommendedHospital();
      unit.assignedHospitalId = bestHosp.id;
    }

    this.saveUnits();

    addAuditLog(
      actor,
      `Unit Dispatched: ${unit.callSign}`,
      `Incident ${incidentId} at ${targetJunctionId}`,
      'Emergency Dispatch CAD Engine',
      'Success',
      `Unit ${unit.callSign} assigned. Initial ETA ~45s. Hospital target: ${unit.assignedHospitalId || 'N/A'}.`,
      simTime
    );

    eventBus.emit(APP_EVENTS.UNIT_DISPATCHED, unit);
    return unit;
  }

  /**
   * Transition emergency unit state along lifecycle
   */
  public updateUnitState(
    unitId: string,
    nextState: EmergencyUnitState,
    simTime: number = 0,
    actor: string = 'Field CAD Terminal'
  ): EmergencyUnit | undefined {
    const unit = this.units.get(unitId);
    if (!unit) return undefined;

    const oldState = unit.state;
    unit.state = nextState;

    if (nextState === 'On scene') {
      if (unit.targetJunctionId) {
        unit.currentJunctionId = unit.targetJunctionId;
      }
      unit.etaSeconds = 0;
    } else if (nextState === 'Available') {
      unit.assignedIncidentId = undefined;
      unit.targetJunctionId = undefined;
      unit.assignedHospitalId = undefined;
      unit.etaSeconds = undefined;
    }

    this.saveUnits();

    addAuditLog(
      actor,
      `Unit State Change: ${unit.callSign}`,
      `${oldState} -> ${nextState}`,
      'Emergency Operations State Machine',
      'Success',
      `Unit ${unit.callSign} transitioned to ${nextState}.`,
      simTime
    );

    eventBus.emit(APP_EVENTS.UNIT_STATE_CHANGED, unit);
    return unit;
  }
}

export const emergencyEngine = new EmergencyEngine();
