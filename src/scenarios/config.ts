// Scenario Engine Configuration & Simulated Demonstration Constants
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Award,
  CheckCircle2,
  FileCheck,
  Hospital,
  Layers,
  Radio,
  Shield,
  Siren,
  Truck,
  Users,
} from 'lucide-react';
import { ScenarioId } from './types';

export const DEMO_IDS = {
  INCIDENT_ID: 'INC-DEMO-001',
  POLICE_UNIT: 'UNIT-POL-DEMO',
  AMBULANCE_UNIT: 'UNIT-MED-DEMO',
  TOW_TRUCK_UNIT: 'UNIT-TOW-DEMO',
  JUNCTION_ID: 'J1_CENTRAL',
  CAMERA_ID: 'CAM-J1-SOUTH-01',
  RADAR_ID: 'SEN-RADAR-L12',
  HOSPITAL_ID: 'HOSP-01',
  ACTOR_NAME: 'Accident Demo (Simulated)',
};

export interface ScenarioMeta {
  id: ScenarioId;
  number: number;
  title: string;
  shortTitle: string;
  tag: string;
  tagColor: string;
  description: string;
  keyActionLabel: string;
  icon: typeof Activity;
}

export const SCENARIO_METADATA: ScenarioMeta[] = [
  {
    id: 'normal',
    number: 1,
    title: 'Scenario 1 — Normal Traffic Monitoring',
    shortTitle: '1. Normal Traffic',
    tag: 'BASELINE (SIMULATED)',
    tagColor: '#2EE6A6',
    description:
      'Continuous computer vision & radar telemetry monitoring vehicle queue densities, approach velocities, and adaptive cycle splits prior to any incident.',
    keyActionLabel: 'View Normal Baseline',
    icon: Activity,
  },
  {
    id: 'collision',
    number: 2,
    title: 'Scenario 2 — Two-Car Accident Detection',
    shortTitle: '2. Collision Detection',
    tag: 'POTENTIAL CRASH',
    tagColor: '#FF5C6C',
    description:
      'Controlled, non-graphic collision between Sedan-01 and Sedan-02 in Lane 2. Computer vision places a detection frame and alerts with initial model confidence.',
    keyActionLabel: 'Trigger Crash Simulation',
    icon: AlertOctagon,
  },
  {
    id: 'ai_verification',
    number: 3,
    title: 'Scenario 3 — AI Incident Verification',
    shortTitle: '3. AI Verification',
    tag: 'MULTI-MODAL FUSION',
    tagColor: '#4F8CFF',
    description:
      'Multi-stage pipeline: Potential Incident → Optical Analysis → Inductive Loop Verification → Confirmed Status. Supports simulated sensor outage fallback.',
    keyActionLabel: 'Run AI Verification',
    icon: Radio,
  },
  {
    id: 'police_dispatch',
    number: 4,
    title: 'Scenario 4 — Police Emergency Notification',
    shortTitle: '4. Police CAD Notification',
    tag: 'DISPATCH NOTIFIED',
    tagColor: '#38BDF8',
    description:
      'Automated CAD card generated for Metro Police Central Precinct with junction coordinates, collision severity, and verified evidence package.',
    keyActionLabel: 'Simulate Police Dispatch',
    icon: Shield,
  },
  {
    id: 'ambulance_hospital',
    number: 5,
    title: 'Scenario 5 — Ambulance and Hospital Coordination',
    shortTitle: '5. EMS & Hospital',
    tag: 'EMS TRIAGE',
    tagColor: '#FF5C6C',
    description:
      'Nearest available paramedic unit Medic-14 assigned. Harbor Memorial Hospital recommended using ICU bed capacity, trauma specialty, and 4.2 min ETA scoring.',
    keyActionLabel: 'Simulate Ambulance Dispatch',
    icon: Hospital,
  },
  {
    id: 'green_corridor',
    number: 6,
    title: 'Scenario 6 — Emergency Route and Green Corridor',
    shortTitle: '6. Green Wave Corridor',
    tag: 'PREEMPTION ACTIVE',
    tagColor: '#A855F7',
    description:
      'Adaptive signals along the emergency path preempted to green waves. Automated conflict-safety checks ensure zero conflicting green authorizations.',
    keyActionLabel: 'Activate Demo Green Corridor',
    icon: Siren,
  },
  {
    id: 'rescue_safety',
    number: 7,
    title: 'Scenario 7 — Accident Site Safety and Rescue',
    shortTitle: '7. Rescue & Perimeter',
    tag: 'PERIMETER SECURED',
    tagColor: '#FFB547',
    description:
      'Police secure high-visibility perimeter; emergency access lane kept strictly clear. Medical status states professional assessment required (non-graphic).',
    keyActionLabel: 'Start Rescue Simulation',
    icon: Ambulance,
  },
  {
    id: 'road_clearance',
    number: 8,
    title: 'Scenario 8 — Road and Debris Clearance',
    shortTitle: '8. Road Clearance',
    tag: '6-STEP RAPID CLEAR',
    tagColor: '#F97316',
    description:
      'Strict 6-step clearance: Inspection → Safe Zone → Vehicle Towing → Debris Sweeping → Structural Check → Clearance Officer Authorization.',
    keyActionLabel: 'Start Road Clearance',
    icon: Truck,
  },
  {
    id: 'pedestrian_safety',
    number: 9,
    title: 'Scenario 9 — Pedestrian Safety & Safe Passage',
    shortTitle: '9. Pedestrian Safety',
    tag: 'PROTECTED PASSAGE',
    tagColor: '#06B6D4',
    description:
      'Crosswalk near collision isolated with electronic guidance barriers. Crowd safely diverted to southern protected bypass away from emergency vehicles.',
    keyActionLabel: 'Activate Safe Pedestrian Route',
    icon: Users,
  },
  {
    id: 'traffic_restoration',
    number: 10,
    title: 'Scenario 10 — Traffic Restoration',
    shortTitle: '10. Traffic Restoration',
    tag: 'NORMALIZED FLOW',
    tagColor: '#2EE6A6',
    description:
      'Gated by strict safety invariant 4: all lanes reopened, adaptive cycle timings normalized, congestion cleared, and vehicle flow verified restored.',
    keyActionLabel: 'Restore Traffic Flow',
    icon: CheckCircle2,
  },
  {
    id: 'full_demo',
    number: 11,
    title: 'Scenario 11 — Complete Accident Response Demonstration',
    shortTitle: '11. Full Demonstration',
    tag: 'FULL WORKFLOW (1-10)',
    tagColor: '#FFB547',
    description:
      'Unified, deterministic 10-stage exhibition workflow demonstrating the complete incident lifecycle from baseline monitoring to final audit report.',
    keyActionLabel: 'Run Full Demonstration',
    icon: Award,
  },
];

export const ORDERED_DEMO_SEQUENCE: ScenarioId[] = [
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
];
