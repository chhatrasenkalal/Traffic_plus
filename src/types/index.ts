// Phase 1 + Phase 2 Types for TrafficPulse

export type ThemeMode = 'dark' | 'light';

export type PhaseId = 'phaseA' | 'phaseB'; // Phase A: North-South, Phase B: East-West

export type SignalState = 'red' | 'yellow' | 'green';

export interface Vehicle {
  id: string;
  phase: PhaseId;
  direction: 'north' | 'south' | 'east' | 'west';
  arrivalTime: number; // in simulated seconds
  waitDuration: number; // seconds spent waiting in queue
  clearedTime?: number;
  color: string;
  speed: number;
  isEmergencyYielding?: boolean;
  type?: VehicleType;
  length?: number;
}

export interface ControllerState {
  currentPhase: PhaseId;
  signalA: SignalState; // North-South
  signalB: SignalState; // East-West
  phaseElapsed: number; // seconds in current phase
  yellowRemaining: number; // seconds in yellow transition (0 if green/red)
  targetGreenDuration: number; // planned green duration for current phase
  // Live Queues
  queueA: Vehicle[];
  queueB: Vehicle[];
  // Cumulative Metrics
  totalArrivals: number;
  totalProcessed: number;
  totalWaitTime: number; // cumulative seconds waited by cleared vehicles
  avgWait: number; // totalWaitTime / totalProcessed
  maxQueue: number;
  throughputHistory: { timestamp: number; throughput: number }[]; // cleared per minute
  waitHistory: { timestamp: number; avgWait: number }[];
  queueHistory: { timestamp: number; queueTotal: number }[];
  // Green Corridor Override State
  greenCorridorActive?: boolean;
  greenCorridorCorridorId?: string;
  greenCorridorTargetPhase?: PhaseId;
  countdown?: number;
  maxWait?: number;
  averageTravelTime?: number;
  laneQueues?: Record<string, number>;
}

export interface AdaptiveConfig {
  baseGreen: number; // default: 15s
  maxExtraGreen: number; // default: 20s
  maxWaitCap: number; // starvation threshold: default 60s
  yellowDuration: number; // default: 3s
}

export interface FixedConfig {
  greenDuration: number; // default: 25s
  yellowDuration: number; // default: 3s
}

export interface SimulationMetrics {
  simTime: number; // in seconds from start
  timeOfDaySeconds: number; // 0 to 86399 (repeating 24h)
  timeOfDayString: string; // e.g. "08:35 AM"
  hourOfDay: number; // 0 to 23
  intensityCurrent: number; // % of max arrival intensity
  rushMultiplier: number;
  activeIncident: {
    phase: PhaseId;
    secondsRemaining: number;
  } | null;
  fixed: ControllerState;
  adaptive: ControllerState;
  improvementPercent: number; // ((fixed_avg_wait - adaptive_avg_wait) / fixed_avg_wait) * 100
  densityLabel: 'Low' | 'Moderate' | 'Heavy';
  forecastCongestion: { minuteAhead: number; projectedQueue: number; confidence: number }[];
  weather?: WeatherState;
}

// ----------------------------------------------------
// PHASE 2 EXTENSIONS: ROLES, WEATHER, NETWORK JUNCTIONS
// ----------------------------------------------------

export type UserRole =
  | 'admin'
  | 'operator'
  | 'police'
  | 'emergency'
  | 'citizen'
  | 'ADMIN'
  | 'OPERATOR'
  | 'POLICE'
  | 'EMERGENCY'
  | 'USER';

export type SystemMode = 'SIMULATED' | 'HYBRID' | 'LIVE';

export interface AdminUserSession {
  id: string;
  username: string;
  displayName: string;
  role: string;
  clearanceLevel: number;
  loginTime: string;
  token: string;
}

export interface UserAuthSession {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  agency: string;
  badgeOrCallsign?: string;
  clearanceLevel: number;
  loginTime: string;
  token: string;
}

export type WeatherType =
  | 'clear'
  | 'fog'
  | 'rain'
  | 'storm'
  | 'heavy rain'
  | 'flood'
  | 'normal';

export interface WeatherState {
  type: WeatherType;
  label: string;
  visibilityKm: number;
  frictionCoefficient: number; // 1.0 clear down to 0.55 in storm
  incidentRiskMultiplier: number;
  speedReductionFactor: number;
}

export interface JunctionNode {
  id: string; // 'J1_CENTRAL', 'J2_NORTH', 'J3_WEST', 'J4_EAST'
  name: string;
  coords: { x: number; z: number };
  activePhase: PhaseId;
  signalA: SignalState;
  signalB: SignalState;
  isGreenCorridor: boolean;
  congestionLevel: number; // 0 to 100%
  cameraSourceActive: boolean;
  sensorSourceActive: boolean;
}

// ----------------------------------------------------
// INCIDENT ENGINE
// ----------------------------------------------------

export type IncidentType =
  | 'crash'
  | 'multi-vehicle collision'
  | 'road blockage'
  | 'breakdown'
  | 'wrong-way vehicle'
  | 'sudden jam'
  | 'signal failure'
  | 'construction'
  | 'lane closure'
  | 'flood'
  | 'fog/low visibility'
  | 'fire'
  | 'pedestrian crowd'
  | 'event traffic'
  | 'railway crossing'
  | 'power outage'
  | 'emergency request';

export type IncidentStage =
  | 'Potential'
  | 'AI confidence'
  | 'Verification'
  | 'Severity'
  | 'Confirmed'
  | 'Resolved';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentEvidence {
  cameraConfidence: number; // 0 - 100%
  sensorOccupancyRate: number; // 0 - 100%
  corroboratingReportsCount: number;
  anomalyScore: number;
  detectedAtSimTime: number;
  description: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  junctionId: string;
  phase: PhaseId;
  direction: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound';
  locationDesc: string;
  stage: IncidentStage;
  severity: IncidentSeverity;
  vehiclesInvolved: number;
  blockedLanes: number;
  peopleInvolved: number;
  fireSmokePresent: boolean;
  trafficImpactScore: number; // 0 - 100
  secondaryRiskScore: number; // 0 - 100
  aiConfidence: number; // 0 - 100%
  evidence: IncidentEvidence;
  simTimeCreated: number;
  simTimeResolved?: number;
  assignedUnitId?: string;
  hospitalRecommendationId?: string;
  greenCorridorActive: boolean;
  history: { stage: IncidentStage; timestamp: string; note: string }[];
}

// ----------------------------------------------------
// CITIZEN REPORT ENGINE WITH VALIDATION PIPELINE
// ----------------------------------------------------

export type CitizenReportType =
  | 'crash'
  | 'blockage'
  | 'flood'
  | 'broken signal'
  | 'hazard'
  | 'emergency help'
  | 'Congestion'
  | 'Accident'
  | 'Hazard'
  | 'Signal fault';

export type CitizenReportDirection =
  | 'Northbound'
  | 'Southbound'
  | 'Eastbound'
  | 'Westbound';

export type CitizenReportSeverity = 'Low' | 'Medium' | 'Critical';

export type CitizenReportValidationStage =
  | 'UNVERIFIED'
  | 'POSSIBLE'
  | 'VERIFIED'
  | 'CONFIRMED';

export type CitizenReportStatus = 'New' | 'Approved' | 'Dismissed';

export interface ReportValidationEvidence {
  cameraCheckResult: 'Confirmed Obstruction' | 'Unusual Speed Drop' | 'No Visible Obstruction' | 'Sensor Offline';
  cameraConfidence: number;
  sensorCheckResult: 'Occupancy Spike (88%)' | 'Normal Flow Pattern' | 'Speed Variance Detected';
  corroboratingReportsCount: number;
  historicalAnomalyIndex: number; // e.g. 1.8x typical morning variance
  provenance: string; // e.g. "Edge AI Camera 04 + Inductive Loop L-12"
}

export interface CitizenReport {
  id: string;
  type: CitizenReportType;
  direction: CitizenReportDirection;
  description: string;
  severity: CitizenReportSeverity;
  status: CitizenReportStatus;
  validationStage: CitizenReportValidationStage;
  validationEvidence?: ReportValidationEvidence;
  timestamp: string; // human readable or ISO
  simTime: number;
  junctionId: string;
  linkedIncidentId?: string;
}

// ----------------------------------------------------
// EMERGENCY ENGINE
// ----------------------------------------------------

export type EmergencyUnitType = 'AMBULANCE' | 'POLICE' | 'FIRE';

export type EmergencyUnitState =
  | 'Available'
  | 'Dispatched'
  | 'En route'
  | 'On scene'
  | 'Transporting/Resolving'
  | 'At hospital'
  | 'Returning';

export interface EmergencyUnit {
  id: string;
  callSign: string;
  type: EmergencyUnitType;
  state: EmergencyUnitState;
  currentJunctionId: string;
  coords: { x: number; z: number };
  targetJunctionId?: string;
  assignedIncidentId?: string;
  assignedHospitalId?: string;
  etaSeconds?: number;
  homeStation: string;
  color: string;
}

export interface SimulatedHospital {
  id: string;
  name: string;
  specialty: string;
  emergencyLoad: number; // percentage 0 - 100%
  icuBedsAvailable: number;
  totalBeds: number;
  baseEtaMinutes: number;
  trafficAdjustedEtaMinutes: number;
  recommendationScore: number;
  recommendationReason: string; // Single line explanation of why it is/isn't recommended
}

export interface SimulatedStation {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'ems';
  location: string;
  junctionId: string;
  availableUnitsCount: number;
}

// ----------------------------------------------------
// GREEN CORRIDOR
// ----------------------------------------------------

export interface GreenCorridorState {
  id: string;
  unitId: string;
  incidentId: string;
  pathJunctionIds: string[];
  activeJunctionId: string;
  status: 'PREPARING' | 'ACTIVE' | 'CLEARING' | 'COMPLETED';
  phaseGranted: PhaseId;
  estimatedClearanceSeconds: number;
  secondsElapsed: number;
  safetyInterlockVerified: boolean; // no conflicting greens
}

// ----------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------

export interface SystemNotification {
  id: string;
  simTime: number;
  timestamp: string;
  severity: IncidentSeverity;
  targetRoles: UserRole[];
  title: string;
  message: string;
  incidentId?: string;
  unitId?: string;
  read: boolean;
}

// ----------------------------------------------------
// AUDIT LOG
// ----------------------------------------------------

export interface AuditLogEntry {
  id: string;
  simTime: number;
  timestamp: string;
  actor: string; // e.g. "Admin", "Police Dispatcher", "Autonomous Controller", "Emergency Ops"
  action: string;
  target: string;
  provenance: string; // e.g. "Authorized Controller Layer", "Manual Override"
  result: 'Success' | 'Overridden' | 'Fallback' | 'Rejected';
  details: string;
}

// ----------------------------------------------------
// DATA SOURCES & FAIL-SAFE PROVENANCE
// ----------------------------------------------------

export interface DataSourceStatus {
  cameraVision: boolean;
  inductiveSensors: boolean;
  citizenStream: boolean;
  v2xConnectedVehicles: boolean;
  fallbackTier: 'Tier 1 (Camera + Sensor Fusion)' | 'Tier 2 (Sensors Only)' | 'Tier 3 (Rule-Based Fallback - DATA UNAVAILABLE)';
}

// ----------------------------------------------------
// AI INSIGHT DATA
// ----------------------------------------------------

export interface AIInsightData {
  summary: string;
  diagnostics: string;
  recommendations: string[];
  environmentalImpact: string;
  recommendedAction: string;
  generatedAt: string;
  source: 'Gemini 3.8 Flash' | 'Local Rule-Based Diagnostics Engine';
}

// ----------------------------------------------------
// TELEMETRY & SENSOR FUSION TYPES
// ----------------------------------------------------

export interface CameraStats {
  cameraId: string;
  junctionId?: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  vehicles: number;
  averageSpeed: number;
  queueLength: number;
  density: number;
  confidence: number;
  timestamp?: number;
  fps?: number;
  cars?: number;
  motorcycles?: number;
  buses?: number;
  trucks?: number;
}

export interface SensorReading {
  deviceId: string;
  junctionId?: string;
  status: 'ONLINE' | 'OFFLINE';
  vehicleCount: number;
  occupancy: number;
  timestamp: number;
  lane?: number;
  temperature?: number;
  humidity?: number;
  rain?: number;
  waterLevel?: number;
  rssi?: number;
}

export type TrafficState = 'FREE' | 'NORMAL' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'GRIDLOCK';

export interface FusedReading {
  junctionId: string;
  timestamp: number;
  vehicleCount: number;
  occupancy: number;
  averageSpeed: number;
  queueLength: number;
  density: number;
  congestionScore: number;
  state: TrafficState;
  confidence: number;
  sourcesUsed: string[];
  fallbackUsed: boolean;
  provenance: {
    deviceIds: string[];
    confidence: number;
    updatedAgo: number;
    mode: string;
  };
}

export type Direction =
  | 'Northbound'
  | 'Southbound'
  | 'Eastbound'
  | 'Westbound'
  | 'north'
  | 'south'
  | 'east'
  | 'west';

export type VehicleType = 'car' | 'bus' | 'truck' | 'emergency' | 'motorcycle';

export type SimulationGlobalMetrics = SimulationMetrics;

export interface SystemHealth {
  cameraOnline: boolean;
  sensorOnline: boolean;
  mode: string;
  latencyMs: number;
  eventBusStatus?: string;
  totalEventsProcessed?: number;
}

export interface JunctionData {
  id: string;
  name: string;
  queue?: number;
  activePhase?: PhaseId;
  signalState?: SignalState;
  gridX?: number;
  gridZ?: number;
  fixedController?: ControllerState;
  adaptiveController?: ControllerState;
  currentSensorReading?: SensorReading | null;
  currentCameraStats?: CameraStats | null;
  fusedReading?: FusedReading;
}
