// Deterministic Demonstration Timeline for TrafficPulse Exhibition
import { ScenarioStage } from './types';

export interface TimelineEvent {
  stepIndex: number;
  stage: ScenarioStage;
  targetScenarioId: string;
  simTimeOffsetSeconds: number;
  durationSeconds: number;
  title: string;
  narration: string;
  actor: string;
  action: string;
  details: string;
}

export const FULL_DEMO_TIMELINE: TimelineEvent[] = [
  {
    stepIndex: 0,
    stage: 'MONITORING',
    targetScenarioId: 'normal',
    simTimeOffsetSeconds: 0,
    durationSeconds: 6,
    title: 'Normal Traffic Baseline',
    narration:
      'TrafficPulse actively monitors central arterial intersections with edge AI computer vision cameras and inductive loop sensors.',
    actor: 'Edge Vision Daemon',
    action: 'Telemetry Streaming',
    details: 'J1 Central Square Phase A green split active. Queue density 28%, average velocity 44 km/h.',
  },
  {
    stepIndex: 1,
    stage: 'COLLISION',
    targetScenarioId: 'collision',
    simTimeOffsetSeconds: 6,
    durationSeconds: 6,
    title: 'Two-Car Incident Detected',
    narration:
      'Sudden deceleration detected in Northbound Lane 2. Computer vision places a bounding box and flags a potential incident.',
    actor: 'Edge Camera 01 (Optical)',
    action: 'Potential Collision Flagged',
    details: 'Optical bounding box centered at Lane 2. 2 civilian sedans involved. Non-graphic collision.',
  },
  {
    stepIndex: 2,
    stage: 'AI_ANALYSIS',
    targetScenarioId: 'ai_verification',
    simTimeOffsetSeconds: 12,
    durationSeconds: 6,
    title: 'AI Multi-Modal Verification',
    narration:
      'Optical evidence fused with inductive loop sensors and radar detectors. AI confidence reaches 94% without human delay.',
    actor: 'Fusion Engine (Tier 1)',
    action: 'Multi-Modal Corroboration',
    details: 'Loop sensor L-12 registers 88% occupancy stall. Vision confirms persistent vehicular blockage.',
  },
  {
    stepIndex: 3,
    stage: 'POLICE_NOTIFIED',
    targetScenarioId: 'police_dispatch',
    simTimeOffsetSeconds: 18,
    durationSeconds: 6,
    title: 'Police Emergency CAD Transmission',
    narration:
      'Automated CAD notification sent to Metro Police Central Precinct with junction ID, collision severity, and lane status.',
    actor: 'Metro Police CAD Interface',
    action: 'Police Unit Dispatched (Simulated)',
    details: 'Cruiser-104 assigned with code-2 response. Estimated travel time: 45 simulated seconds.',
  },
  {
    stepIndex: 4,
    stage: 'AMBULANCE_ASSIGNED',
    targetScenarioId: 'ambulance_hospital',
    simTimeOffsetSeconds: 24,
    durationSeconds: 6,
    title: 'Ambulance & Hospital Triage Coordination',
    narration:
      'Medic-14 dispatched. System scores regional hospitals and selects Harbor Memorial based on trauma capability and bed availability.',
    actor: 'EMS Dispatch System',
    action: 'Hospital Routing (Simulated)',
    details: 'Harbor Memorial Hospital recommended: Score 92/100, 8 open ICU beds, trauma center available.',
  },
  {
    stepIndex: 5,
    stage: 'CORRIDOR_ACTIVE',
    targetScenarioId: 'green_corridor',
    simTimeOffsetSeconds: 30,
    durationSeconds: 7,
    title: 'Emergency Green Corridor Active',
    narration:
      'Dynamic signal preemption opens a green wave along the ambulance transit corridor while strictly verifying zero conflicting green lights.',
    actor: 'Traffic Controller (Simulated)',
    action: 'Green Wave Preemption',
    details: 'J1 Central Square and J4 East preempted to green wave. Cross-traffic held at verified all-red.',
  },
  {
    stepIndex: 6,
    stage: 'RESCUE',
    targetScenarioId: 'rescue_safety',
    simTimeOffsetSeconds: 37,
    durationSeconds: 7,
    title: 'Accident Site Safety & Perimeter',
    narration:
      'Police units secure perimeter cones around Lane 2. Protected emergency access lane maintained for paramedic triage.',
    actor: 'Incident Command',
    action: 'Perimeter Secured',
    details: 'Safety perimeter active. Medical status: Professional assessment required (non-graphic).',
  },
  {
    stepIndex: 7,
    stage: 'CLEARANCE_INSPECT',
    targetScenarioId: 'road_clearance',
    simTimeOffsetSeconds: 44,
    durationSeconds: 8,
    title: '6-Step Rapid Road Clearance',
    narration:
      'Structured road clearance: damaged vehicles towed to safe shoulder, mechanical debris sweep completed, and road safety certified.',
    actor: 'Clearance Operations',
    action: 'Roadway Cleared & Inspected',
    details: 'Tow truck cleared vehicles. Debris removed. Physical road inspection certified by Officer Badge #4028.',
  },
  {
    stepIndex: 8,
    stage: 'PEDESTRIAN_PROTECTED',
    targetScenarioId: 'pedestrian_safety',
    simTimeOffsetSeconds: 52,
    durationSeconds: 6,
    title: 'Pedestrian Protection & Dynamic Reroute',
    narration:
      'Electronic barriers isolate northern crosswalk. Pedestrians safely guided across protected southern corridor with audio cues.',
    actor: 'Smart Crosswalk Daemon',
    action: 'Safe Passage Activated',
    details: 'Northern crosswalk barricaded. Southern pedestrian green phase extended with audible countdown.',
  },
  {
    stepIndex: 9,
    stage: 'RESTORATION',
    targetScenarioId: 'traffic_restoration',
    simTimeOffsetSeconds: 58,
    durationSeconds: 7,
    title: 'Full Traffic Flow Restoration',
    narration:
      'Clearance certified: Lane 2 reopened, adaptive signal timing restored, queue dissipation verified, and baseline speeds normalized.',
    actor: 'Autonomous Traffic Manager',
    action: 'Normal Operations Restored',
    details: 'All lanes reopened. Average speed recovered to 42 km/h. Complete incident audit trail recorded.',
  },
];
