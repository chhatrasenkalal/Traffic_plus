import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Eye,
  FileCheck,
  FileText,
  Flame,
  Hospital,
  Layers,
  Lightbulb,
  Maximize2,
  Minimize2,
  Navigation,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sliders,
  Sparkles,
  Truck,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { IncidentSeverity, PhaseId } from '../types';

export type ScenarioId =
  | 'normal'
  | 'collision'
  | 'ai_verification'
  | 'police_dispatch'
  | 'ambulance_hospital'
  | 'green_corridor'
  | 'rescue_safety'
  | 'road_clearance'
  | 'pedestrian_safety'
  | 'traffic_restoration'
  | 'full_demo';

interface ScenarioMeta {
  id: ScenarioId;
  number: number;
  title: string;
  shortTitle: string;
  tag: string;
  tagColor: string;
  description: string;
  keyActionLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SCENARIO_LIST: ScenarioMeta[] = [
  {
    id: 'normal',
    number: 1,
    title: 'Scenario 1 — Normal Traffic Monitoring',
    shortTitle: '1. Normal Monitoring',
    tag: 'BASELINE',
    tagColor: '#2EE6A6',
    description: 'Autonomous AI edge vision cameras and inductive loop sensors monitor vehicle velocity, queue density, and green wave cycles at J1 Central Square.',
    icon: Activity,
  },
  {
    id: 'collision',
    number: 2,
    title: 'Scenario 2 — Two-Car Accident Detection',
    shortTitle: '2. Accident Detection',
    tag: 'INCIDENT DETECTED',
    tagColor: '#FF5C6C',
    description: 'Controlled collision between two approaching vehicles in Northbound Lane 2. Camera bounding box locks on impact with AI confidence telemetry.',
    icon: AlertOctagon,
  },
  {
    id: 'ai_verification',
    number: 3,
    title: 'Scenario 3 — AI Incident Verification',
    shortTitle: '3. AI Verification',
    tag: 'MULTI-SENSOR FUSION',
    tagColor: '#4F8CFF',
    description: 'Incident progresses through 4 rigorous stages: Potential Incident → AI Vision Analysis → Sensor Fusion → Confirmed Emergency with fail-safe fallback checks.',
    icon: Cpu,
  },
  {
    id: 'police_dispatch',
    number: 4,
    title: 'Scenario 4 — Police Emergency Notification',
    shortTitle: '4. Police Notification',
    tag: 'CAD DISPATCH',
    tagColor: '#38BDF8',
    description: 'Automated high-priority alert sent to Police Metro Traffic Division with junction telemetry, live evidence feed, and unit CAD assignment.',
    keyActionLabel: 'Simulate Police Dispatch',
    icon: ShieldAlert,
  },
  {
    id: 'ambulance_hospital',
    number: 5,
    title: 'Scenario 5 — Ambulance & Hospital Coordination',
    shortTitle: '5. EMS & Hospital',
    tag: 'EMS TRIAGE',
    tagColor: '#FF5C6C',
    description: 'Medic-14 assigned. Evaluates live ICU bed availability, specialized trauma capabilities, and travel times across 3 regional hospitals.',
    keyActionLabel: 'Simulate Ambulance Dispatch',
    icon: Ambulance,
  },
  {
    id: 'green_corridor',
    number: 6,
    title: 'Scenario 6 — Emergency Route & Green Corridor',
    shortTitle: '6. Green Corridor',
    tag: 'SIGNAL PREEMPTION',
    tagColor: '#2EE6A6',
    description: 'Emergency preemption forces green signals along ambulance route while locking conflicting cross-street phases to Red with zero-conflict safety interlocks.',
    keyActionLabel: 'Activate Demo Green Corridor',
    icon: Zap,
  },
  {
    id: 'rescue_safety',
    number: 7,
    title: 'Scenario 7 — Accident Site Safety & Rescue',
    shortTitle: '7. Safety & Rescue',
    tag: 'FIRST RESPONDERS',
    tagColor: '#FFB547',
    description: 'Responders deploy upstream police perimeter, safety cones, protected emergency access zone, and secondary-crash mitigation protocols.',
    keyActionLabel: 'Start Rescue Simulation',
    icon: Siren,
  },
  {
    id: 'road_clearance',
    number: 8,
    title: 'Scenario 8 — Road & Debris Clearance',
    shortTitle: '8. Road Clearance',
    tag: 'RAPID RECOVERY',
    tagColor: '#A78BFA',
    description: 'Orderly 6-step clearance: Scene investigation, safe staging area vehicle relocation, debris sweeping, friction inspection, and authorized clearance sign-off.',
    keyActionLabel: 'Start Road Clearance',
    icon: Truck,
  },
  {
    id: 'pedestrian_safety',
    number: 9,
    title: 'Scenario 9 — Pedestrian Safety & Safe Passage',
    shortTitle: '9. Pedestrian Safety',
    tag: 'SAFE CROSSINGS',
    tagColor: '#38BDF8',
    description: 'Hazard perimeter stops pedestrians from crossing blocked zone. Dynamic alternate illuminated green pathway safely guides foot traffic away from responders.',
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
    description: 'Official clearance verified: Lane 2 reopened, temporary diversions lifted, traffic signals smoothly return to adaptive timing, velocity returns to normal.',
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
    description: 'Seamless automated sequence demonstrating the complete end-to-end incident lifecycle from normal traffic through detection, dispatch, clearance, and recovery.',
    keyActionLabel: 'Run Full Demonstration',
    icon: Award,
  },
];

export const AccidentSimulatorPage: React.FC = () => {
  const { theme } = useSimulation();

  // Active scenario state
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('normal');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);

  // Full demonstration playback state
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [demoProgress, setDemoProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Sub-states for individual scenario actions
  const [policeDispatched, setPoliceDispatched] = useState<boolean>(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState<boolean>(false);
  const [greenCorridorActive, setGreenCorridorActive] = useState<boolean>(false);
  const [rescueActive, setRescueActive] = useState<boolean>(false);
  const [roadClearanceStep, setRoadClearanceStep] = useState<number>(0); // 0: not started, 1: inspect, 2: perimeter, 3: towed, 4: sweep, 5: check, 6: cleared
  const [pedestrianRouteActive, setPedestrianRouteActive] = useState<boolean>(false);
  const [trafficRestored, setTrafficRestored] = useState<boolean>(false);
  const [sensorFailureFallback, setSensorFailureFallback] = useState<boolean>(false);

  // Animation ticks for visual movement in canvas
  const [simTick, setSimTick] = useState<number>(0);

  // Simulation timer for animated vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setSimTick((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Demo auto-runner sequence
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ordered sequence of steps in full demo (Scenarios 1 through 10)
  const fullDemoSequence: ScenarioId[] = [
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

  // Jump directly to any stage in the 10-step full demonstration workflow
  const jumpToDemoStep = (stepIdx: number) => {
    const clampedIdx = Math.max(0, Math.min(stepIdx, fullDemoSequence.length - 1));
    setDemoStepIndex(clampedIdx);
    const targetScenario = fullDemoSequence[clampedIdx];
    setActiveScenarioId(targetScenario);
    applyScenarioPreset(targetScenario);
    // Dynamically calculate completion percentage for this step
    setDemoProgress(((clampedIdx + 1) / fullDemoSequence.length) * 100);
  };

  // Helper to switch scenario and apply preset states
  const selectScenario = (id: ScenarioId) => {
    if (id === 'full_demo') {
      startFullDemo();
      return;
    }
    setIsDemoPlaying(false);
    setActiveScenarioId(id);
    applyScenarioPreset(id);
    const seqIdx = fullDemoSequence.indexOf(id);
    if (seqIdx !== -1) {
      setDemoStepIndex(seqIdx);
      setDemoProgress(((seqIdx + 1) / fullDemoSequence.length) * 100);
    }
  };

  const applyScenarioPreset = (id: ScenarioId) => {
    switch (id) {
      case 'normal':
        setPoliceDispatched(false);
        setAmbulanceDispatched(false);
        setGreenCorridorActive(false);
        setRescueActive(false);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        setSensorFailureFallback(false);
        break;
      case 'collision':
        setPoliceDispatched(false);
        setAmbulanceDispatched(false);
        setGreenCorridorActive(false);
        setRescueActive(false);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        break;
      case 'ai_verification':
        setPoliceDispatched(false);
        setAmbulanceDispatched(false);
        setGreenCorridorActive(false);
        setRescueActive(false);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        break;
      case 'police_dispatch':
        setPoliceDispatched(true);
        setAmbulanceDispatched(false);
        setGreenCorridorActive(false);
        setRescueActive(false);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        break;
      case 'ambulance_hospital':
        setPoliceDispatched(true);
        setAmbulanceDispatched(true);
        setGreenCorridorActive(false);
        setRescueActive(false);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        break;
      case 'green_corridor':
        setPoliceDispatched(true);
        setAmbulanceDispatched(true);
        setGreenCorridorActive(true);
        setRescueActive(false);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        break;
      case 'rescue_safety':
        setPoliceDispatched(true);
        setAmbulanceDispatched(true);
        setGreenCorridorActive(true);
        setRescueActive(true);
        setRoadClearanceStep(0);
        setPedestrianRouteActive(false);
        setTrafficRestored(false);
        break;
      case 'road_clearance':
        setPoliceDispatched(true);
        setAmbulanceDispatched(true);
        setGreenCorridorActive(false);
        setRescueActive(true);
        setRoadClearanceStep(3); // Damaged vehicles moved
        setPedestrianRouteActive(true);
        setTrafficRestored(false);
        break;
      case 'pedestrian_safety':
        setPoliceDispatched(true);
        setAmbulanceDispatched(true);
        setGreenCorridorActive(false);
        setRescueActive(true);
        setRoadClearanceStep(4);
        setPedestrianRouteActive(true);
        setTrafficRestored(false);
        break;
      case 'traffic_restoration':
        setPoliceDispatched(false);
        setAmbulanceDispatched(false);
        setGreenCorridorActive(false);
        setRescueActive(false);
        setRoadClearanceStep(6);
        setPedestrianRouteActive(false);
        setTrafficRestored(true);
        break;
    }
  };

  const startFullDemo = () => {
    setActiveScenarioId('normal');
    setDemoStepIndex(0);
    setDemoProgress(10); // Start at step 1 (10% completion)
    setIsDemoPlaying(true);
    applyScenarioPreset('normal');
  };

  const pauseFullDemo = () => {
    setIsDemoPlaying(false);
  };

  const resumeFullDemo = () => {
    setIsDemoPlaying(true);
  };

  const resetFullDemo = () => {
    setIsDemoPlaying(false);
    setDemoStepIndex(0);
    setDemoProgress(0);
    setActiveScenarioId('normal');
    applyScenarioPreset('normal');
  };

  const nextDemoStep = () => {
    const nextIdx = Math.min(demoStepIndex + 1, fullDemoSequence.length - 1);
    jumpToDemoStep(nextIdx);
  };

  const prevDemoStep = () => {
    const prevIdx = Math.max(demoStepIndex - 1, 0);
    jumpToDemoStep(prevIdx);
  };

  // Automated progression in full demo
  useEffect(() => {
    if (!isDemoPlaying) {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      return;
    }

    const stepDuration = 6000 / playbackSpeed; // 6 seconds per stage at 1x
    const updateFreq = 200;
    const progressInc = (updateFreq / stepDuration) * (100 / fullDemoSequence.length);

    const timer = setInterval(() => {
      setDemoProgress((prev) => {
        const nextVal = prev + progressInc;
        const currentTargetStep = Math.floor((nextVal / 100) * fullDemoSequence.length);

        if (currentTargetStep !== demoStepIndex && currentTargetStep < fullDemoSequence.length) {
          setDemoStepIndex(currentTargetStep);
          const nextScenario = fullDemoSequence[currentTargetStep];
          setActiveScenarioId(nextScenario);
          applyScenarioPreset(nextScenario);
        }

        if (nextVal >= 100) {
          setIsDemoPlaying(false);
          setActiveScenarioId('traffic_restoration');
          applyScenarioPreset('traffic_restoration');
          return 100;
        }
        return nextVal;
      });
    }, updateFreq);

    demoTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [isDemoPlaying, demoStepIndex, playbackSpeed]);

  const activeMeta =
    SCENARIO_LIST.find((s) => s.id === activeScenarioId) || SCENARIO_LIST[0];

  // Road clearance automated step runner
  const triggerRoadClearanceSequence = () => {
    setRoadClearanceStep(1); // Inspect
    setTimeout(() => setRoadClearanceStep(2), 1200); // Police perimeter
    setTimeout(() => setRoadClearanceStep(3), 2500); // Tow vehicles
    setTimeout(() => setRoadClearanceStep(4), 3800); // Sweep debris
    setTimeout(() => setRoadClearanceStep(5), 5000); // Inspection pending
    setTimeout(() => setRoadClearanceStep(6), 6200); // Cleared
  };

  return (
    <div
      className={`min-h-screen text-[#E8ECF5] transition-all duration-300 ${
        isPresentationMode
          ? 'fixed inset-0 z-50 bg-[#060810] overflow-y-auto p-4 sm:p-8'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'
      }`}
    >
      {/* Simulation Watermark / Exhibition Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#151C2E]/90 via-[#0E1320]/90 to-[#151C2E]/90 border border-[var(--border-light)] shadow-sm">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EE6A6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2EE6A6]"></span>
          </span>
          <span className="font-mono-data text-xs font-bold uppercase tracking-wider text-[#2EE6A6]">
            ACADEMIC B.TECH EXHIBITION ENVIRONMENT • SIMULATED DATA ONLY
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-[#8A94A9]">
            Safe autonomous demonstration logic (no real emergency dispatches or infrastructure commands).
          </span>
          <button
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1E2738] hover:bg-[#28354D] text-xs font-semibold text-white border border-[var(--border)] transition-colors cursor-pointer"
            title="Toggle Fullscreen Projector Mode"
          >
            {isPresentationMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#2EE6A6]" />
                <span>Exit Projector Mode</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#2EE6A6]" />
                <span>Projector / Exhibition Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#4F8CFF] uppercase tracking-wider mb-1.5">
            <Compass className="w-4 h-4 text-[#2EE6A6]" />
            <span>TrafficPulse Core Operational Center</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Accident Scenario Control Center
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1 max-w-3xl">
            Interactive, non-graphic simulation system demonstrating AI accident detection, sensor verification, multi-agency dispatch, Green Corridor signal preemption, site rescue, rapid debris clearance, and traffic recovery.
          </p>
        </div>

        {/* Global Primary Action: Run Full Demonstration */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (isDemoPlaying) {
                pauseFullDemo();
              } else {
                startFullDemo();
              }
            }}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2EE6A6] via-[#24c78f] to-[#1cb380] text-[#07090F] font-heading font-extrabold text-sm shadow-xl shadow-[#2EE6A6]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {isDemoPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Full Demonstration</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Full Demonstration</span>
              </>
            )}
          </button>

          <button
            onClick={resetFullDemo}
            className="flex items-center space-x-1.5 px-3.5 py-3 rounded-2xl bg-[#151C2E] hover:bg-[#1C263D] border border-[var(--border)] text-xs font-semibold text-[#8A94A9] hover:text-white transition-colors cursor-pointer"
            title="Reset to Normal Baseline"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* 11 Scenario Selector Buttons (Always Visible & Independent) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#2EE6A6]" />
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Independent Scenario Launcher (Click any scenario to jump immediately)
            </h3>
          </div>
          <span className="text-xs font-mono-data text-[#8A94A9]">
            10 Independent Modules + 1 Full Automation Loop
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SCENARIO_LIST.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            const Icon = sc.icon;
            const isFullDemoBtn = sc.id === 'full_demo';

            return (
              <button
                key={sc.id}
                onClick={() => selectScenario(sc.id)}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? 'bg-[#151C2E] border-[#2EE6A6] shadow-lg shadow-[#2EE6A6]/10 ring-1 ring-[#2EE6A6]'
                    : isFullDemoBtn
                    ? 'bg-gradient-to-br from-[#2EE6A6]/10 via-[#4F8CFF]/10 to-[#151C2E] border-[#2EE6A6]/40 hover:border-[#2EE6A6]'
                    : 'bg-[#0E1320]/80 hover:bg-[#151C2E] border-[var(--border)] hover:border-[var(--border-light)]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-1 bg-[#2EE6A6]" />
                )}
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className="text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{
                      backgroundColor: `${sc.tagColor}20`,
                      color: sc.tagColor,
                    }}
                  >
                    #{sc.number}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#2EE6A6]' : 'text-[#8A94A9] group-hover:text-white'
                    }`}
                  />
                </div>
                <div className="font-heading font-bold text-xs text-white leading-tight line-clamp-1 mb-1">
                  {sc.shortTitle}
                </div>
                <div className="text-[10px] text-[#8A94A9] line-clamp-1 leading-snug">
                  {sc.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Demonstration Workflow Dynamic Progress Bar & Control Center */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[#0E1424] to-[#080B14] shadow-2xl space-y-4">
        {/* Top Header Row: Stage Name, Running State Badge, and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-xs font-mono-data font-bold text-[#4F8CFF]">
                <Activity className="w-3.5 h-3.5" />
                <span>WORKFLOW PROGRESSION</span>
              </span>

              {/* Dynamic State Badge */}
              {isDemoPlaying ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#2EE6A6]/20 border border-[#2EE6A6]/40 text-xs font-mono-data font-bold text-[#2EE6A6] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#2EE6A6] inline-block animate-ping" />
                  <span>● RUNNING AUTOMATED DEMO ({playbackSpeed}x)</span>
                </span>
              ) : demoProgress >= 100 ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#2EE6A6]/20 border border-[#2EE6A6]/40 text-xs font-mono-data font-bold text-[#2EE6A6]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6]" />
                  <span>DEMONSTRATION COMPLETED (100%)</span>
                </span>
              ) : demoProgress > 0 ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FFB547]/20 border border-[#FFB547]/40 text-xs font-mono-data font-bold text-[#FFB547]">
                  <Pause className="w-3 h-3 text-[#FFB547]" />
                  <span>DEMONSTRATION PAUSED (STEP {demoStepIndex + 1}/10)</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#151C2E] border border-[var(--border)] text-xs font-mono-data text-[#8A94A9]">
                  <Play className="w-3 h-3 text-[#8A94A9]" />
                  <span>STANDBY (CLICK PLAY OR ANY SCENARIO)</span>
                </span>
              )}

              <span className="text-xs font-mono-data text-[#8A94A9] hidden sm:inline">
                • Step {demoStepIndex + 1} of {fullDemoSequence.length}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                {activeMeta.title}
              </h2>
              <span className="text-xs text-[#8A94A9] font-sans">
                {demoStepIndex < fullDemoSequence.length - 1
                  ? `(Next: ${SCENARIO_LIST[demoStepIndex + 1]?.shortTitle || ''})`
                  : '(End of Workflow — Traffic Fully Normalized)'}
              </span>
            </div>
          </div>

          {/* Right Controls & Large Percentage Readout */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Prominent Completion Percentage Callout */}
            <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-[#090D18] border border-[var(--border)]">
              <div className="text-right">
                <div className="text-[10px] font-mono-data uppercase text-[#8A94A9] font-semibold leading-none">
                  Completion
                </div>
                <div className="text-[11px] font-mono-data text-[#4F8CFF] font-bold">
                  {demoStepIndex + 1} / 10 Steps
                </div>
              </div>
              <div className="font-mono-data text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2EE6A6] via-[#4F8CFF] to-[#FFB547] leading-none drop-shadow-sm">
                {Math.round(demoProgress)}%
              </div>
            </div>

            {/* Scrubber Controls */}
            <div className="flex items-center space-x-1.5 bg-[#090D18] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={prevDemoStep}
                disabled={demoStepIndex === 0}
                className="p-2 rounded-lg bg-[#151C2E] hover:bg-[#1E2738] disabled:opacity-40 disabled:hover:bg-[#151C2E] text-white transition-colors cursor-pointer"
                title="Previous Scenario Step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (isDemoPlaying) pauseFullDemo();
                  else if (demoProgress >= 100) startFullDemo();
                  else resumeFullDemo();
                }}
                className="px-3.5 py-2 rounded-lg bg-[#2EE6A6] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#2EE6A6]/20"
                title={isDemoPlaying ? 'Pause Demonstration' : 'Play / Resume Demonstration'}
              >
                {isDemoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : demoProgress >= 100 ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{demoProgress > 0 ? 'Resume' : 'Play'}</span>
                  </>
                )}
              </button>

              <button
                onClick={nextDemoStep}
                disabled={demoStepIndex >= fullDemoSequence.length - 1}
                className="p-2 rounded-lg bg-[#151C2E] hover:bg-[#1E2738] disabled:opacity-40 disabled:hover:bg-[#151C2E] text-white transition-colors cursor-pointer"
                title="Next Scenario Step"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={resetFullDemo}
                className="p-2 rounded-lg bg-[#151C2E] hover:bg-[#1E2738] text-[#8A94A9] hover:text-white transition-colors cursor-pointer"
                title="Reset to Step 1 Baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Playback Speed Selector */}
            <div className="flex items-center space-x-1 bg-[#090D18] p-1 rounded-xl border border-[var(--border)] text-xs">
              <span className="text-[10px] font-mono-data text-[#8A94A9] px-1 uppercase hidden sm:inline">
                Rate:
              </span>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-lg font-mono-data text-[11px] font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#2EE6A6] text-[#07090F] shadow-sm'
                      : 'bg-transparent text-[#8A94A9] hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#151C2E] hover:bg-[#1C263D] border border-[var(--border)] text-xs text-[#8A94A9] hover:text-white transition-colors cursor-pointer"
              title="Show technical AI & engineering metrics"
            >
              <Cpu className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span className="hidden sm:inline">{showTechDetails ? 'Hide Deep Tech' : 'Tech Proof'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar Track with Visual Milestones */}
        <div className="space-y-1.5 pt-1">
          <div className="relative h-4 sm:h-5 bg-[#090D18] rounded-full p-1 border border-[var(--border)] overflow-hidden shadow-inner flex items-center">
            {/* Filled Progress Gradient Bar */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2EE6A6] via-[#4F8CFF] to-[#FFB547] transition-all duration-300 relative shadow-[0_0_12px_rgba(46,230,166,0.5)]"
              style={{ width: `${Math.min(100, Math.max(2, demoProgress))}%` }}
            >
              {/* Animated Leading Edge Highlight */}
              {isDemoPlaying && (
                <span className="absolute right-0 top-0 bottom-0 w-3 bg-white/60 rounded-full animate-pulse shadow-sm" />
              )}
            </div>

            {/* Subtle Milestone Notch Markers (10%, 20%, ..., 90%) */}
            <div className="absolute inset-0 pointer-events-none flex justify-between px-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                <div
                  key={m}
                  className="h-full w-[1px] bg-white/10"
                  style={{ left: `${m * 10}%` }}
                />
              ))}
            </div>
          </div>

          {/* Progress Percentages and Time Legend */}
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8A94A9] px-1">
            <span>0% Normal Traffic</span>
            <span>25% Incident CAD</span>
            <span>50% Green Corridor</span>
            <span>75% Site Clearance</span>
            <span>100% Traffic Restored</span>
          </div>
        </div>

        {/* Interactive 10-Step Workflow Sequence Map */}
        <div className="pt-2 border-t border-[var(--border)]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono-data uppercase font-bold text-[#8A94A9] tracking-wider flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#2EE6A6]" />
              <span>Full Demonstration Stage Roadmap (Click any stage to jump immediately)</span>
            </span>
            <span className="text-[10px] font-mono-data text-[#2EE6A6]">
              Interactive Deterministic Timeline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
            {fullDemoSequence.map((stepKey, idx) => {
              const isCurrent = idx === demoStepIndex;
              const isCompleted =
                demoProgress >= ((idx + 1) / fullDemoSequence.length) * 100 ||
                (idx < demoStepIndex && !isDemoPlaying);
              const meta = SCENARIO_LIST.find((s) => s.id === stepKey);
              if (!meta) return null;
              const StepIcon = meta.icon;

              return (
                <button
                  key={stepKey}
                  onClick={() => jumpToDemoStep(idx)}
                  className={`flex flex-col p-2 rounded-xl text-left border transition-all cursor-pointer relative group ${
                    isCurrent
                      ? 'bg-[#151C2E] border-[#2EE6A6] shadow-lg shadow-[#2EE6A6]/15 ring-2 ring-[#2EE6A6]/50'
                      : isCompleted
                      ? 'bg-[#0E1524] border-[#2EE6A6]/30 hover:border-[#2EE6A6]'
                      : 'bg-[#080B14] border-[var(--border)] hover:border-[var(--border-light)] opacity-70 hover:opacity-100'
                  }`}
                  title={`Jump directly to Step ${idx + 1}: ${meta.title}`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-[#2EE6A6] text-[#07090F]'
                          : isCompleted
                          ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]'
                          : 'bg-[#151C2E] text-[#8A94A9]'
                      }`}
                    >
                      {isCompleted ? '✓' : `#${idx + 1}`}
                    </span>
                    <StepIcon
                      className={`w-3 h-3 ${
                        isCurrent
                          ? 'text-[#2EE6A6]'
                          : isCompleted
                          ? 'text-[#2EE6A6]'
                          : 'text-[#8A94A9]'
                      }`}
                    />
                  </div>
                  <div
                    className={`font-heading font-bold text-[11px] leading-tight line-clamp-1 ${
                      isCurrent ? 'text-[#2EE6A6]' : isCompleted ? 'text-white' : 'text-[#8A94A9]'
                    }`}
                  >
                    {meta.shortTitle.replace(/^\d+\.\s*/, '')}
                  </div>
                  <div className="text-[9px] font-mono-data text-[#8A94A9] mt-0.5">
                    {((idx + 1) * 10)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Scenario Stage Banner */}
      <div className="p-4 rounded-2xl bg-[#0E1320] border-l-4 border-l-[#2EE6A6] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] font-bold uppercase mb-0.5">
            <span
              className="px-2 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: `${activeMeta.tagColor}20`,
                color: activeMeta.tagColor,
              }}
            >
              {activeMeta.tag}
            </span>
            <span>• Simulated Junction: J1 Central Square</span>
            <span>• Timestamp: 08:04:12 AM</span>
          </div>
          <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
            {activeMeta.title}
          </h2>
          <p className="text-xs text-[#8A94A9] mt-0.5">{activeMeta.description}</p>
        </div>

        {/* Dynamic Scenario Trigger Button if defined */}
        {activeMeta.keyActionLabel && (
          <div className="shrink-0">
            {activeScenarioId === 'police_dispatch' && (
              <button
                onClick={() => setPoliceDispatched(true)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                  policeDispatched
                    ? 'bg-[#2EE6A6]/20 text-[#2EE6A6] border border-[#2EE6A6]'
                    : 'bg-[#38BDF8] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#38BDF8]/20'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>
                  {policeDispatched
                    ? 'Police Unit Dispatched (Simulation)'
                    : 'Simulate Police Dispatch'}
                </span>
              </button>
            )}

            {activeScenarioId === 'ambulance_hospital' && (
              <button
                onClick={() => setAmbulanceDispatched(true)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                  ambulanceDispatched
                    ? 'bg-[#2EE6A6]/20 text-[#2EE6A6] border border-[#2EE6A6]'
                    : 'bg-[#FF5C6C] text-white hover:brightness-110 shadow-lg shadow-[#FF5C6C]/20'
                }`}
              >
                <Ambulance className="w-4 h-4" />
                <span>
                  {ambulanceDispatched
                    ? 'Ambulance Unit Assigned (Simulation)'
                    : 'Simulate Ambulance Dispatch'}
                </span>
              </button>
            )}

            {activeScenarioId === 'green_corridor' && (
              <button
                onClick={() => setGreenCorridorActive(!greenCorridorActive)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                  greenCorridorActive
                    ? 'bg-[#2EE6A6] text-[#07090F] shadow-lg shadow-[#2EE6A6]/20'
                    : 'bg-[#151C2E] border border-[#2EE6A6] text-[#2EE6A6] hover:bg-[#2EE6A6]/10'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {greenCorridorActive
                    ? 'Green Corridor Active (Safe Preemption)'
                    : 'Activate Demo Green Corridor'}
                </span>
              </button>
            )}

            {activeScenarioId === 'rescue_safety' && (
              <button
                onClick={() => setRescueActive(true)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                  rescueActive
                    ? 'bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]'
                    : 'bg-[#FFB547] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#FFB547]/20'
                }`}
              >
                <Siren className="w-4 h-4" />
                <span>
                  {rescueActive
                    ? 'Rescue In Progress — Perimeter Secured'
                    : 'Start Rescue Simulation'}
                </span>
              </button>
            )}

            {activeScenarioId === 'road_clearance' && (
              <button
                onClick={triggerRoadClearanceSequence}
                className="px-4 py-2.5 rounded-xl font-heading font-bold text-xs bg-[#A78BFA] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#A78BFA]/20 flex items-center space-x-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Start Road Clearance</span>
              </button>
            )}

            {activeScenarioId === 'pedestrian_safety' && (
              <button
                onClick={() => setPedestrianRouteActive(!pedestrianRouteActive)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                  pedestrianRouteActive
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]'
                    : 'bg-[#38BDF8] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#38BDF8]/20'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>
                  {pedestrianRouteActive
                    ? 'Safe Pedestrian Detour Active'
                    : 'Activate Safe Pedestrian Route'}
                </span>
              </button>
            )}

            {activeScenarioId === 'traffic_restoration' && (
              <button
                onClick={() => setTrafficRestored(true)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                  trafficRestored
                    ? 'bg-[#2EE6A6]/20 text-[#2EE6A6] border border-[#2EE6A6]'
                    : 'bg-[#2EE6A6] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#2EE6A6]/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {trafficRestored
                    ? 'Traffic Flow Restored & Normalized'
                    : 'Restore Traffic Flow'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Interactive Presentation Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): The Animated Road Intersection & Live HUD */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-[var(--border)] bg-[#07090F] relative overflow-hidden shadow-2xl">
            {/* Stage Header & Camera HUD Overlay */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)] text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#151C2E] border border-[var(--border)] text-[#2EE6A6] font-mono-data text-[10px]">
                  <Video className="w-3 h-3 text-[#2EE6A6] animate-pulse" />
                  <span>CAM-01 • DOWNTOWN HIGH ANGLE [60 FPS]</span>
                </div>
                <span className="text-[#8A94A9] hidden sm:inline text-[11px]">
                  J1 Central Square Intersection
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono-data text-[11px]">
                <span className="text-[#8A94A9]">Phase:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    greenCorridorActive
                      ? 'bg-[#2EE6A6] text-[#07090F]'
                      : 'bg-[#151C2E] text-[#2EE6A6]'
                  }`}
                >
                  {greenCorridorActive ? 'PREEMPTED (N-S GREEN)' : 'PHASE A (N-S)'}
                </span>
              </div>
            </div>

            {/* SVG Visual Road Simulation Canvas */}
            <div className="relative w-full aspect-square max-h-[520px] bg-[#0A0D16] rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center">
              <svg viewBox="0 0 500 500" className="w-full h-full select-none">
                {/* Background Grass / Sidewalk blocks */}
                <rect x="0" y="0" width="500" height="500" fill="#0A0D16" />
                <rect x="0" y="0" width="170" height="170" fill="#0E1322" rx="12" />
                <rect x="330" y="0" width="170" height="170" fill="#0E1322" rx="12" />
                <rect x="0" y="330" width="170" height="170" fill="#0E1322" rx="12" />
                <rect x="330" y="330" width="170" height="170" fill="#0E1322" rx="12" />

                {/* Road Asphalt: North-South & East-West Roads */}
                <rect x="170" y="0" width="160" height="500" fill="#141926" />
                <rect x="0" y="170" width="500" height="160" fill="#141926" />

                {/* Central Junction Box */}
                <rect x="170" y="170" width="160" height="160" fill="#181F30" />

                {/* Lane Divider Lines (Yellow center, white dashed lane divides) */}
                {/* North-South Center Divider */}
                <line x1="250" y1="0" x2="250" y2="160" stroke="#FFB547" strokeWidth="2.5" />
                <line x1="250" y1="340" x2="250" y2="500" stroke="#FFB547" strokeWidth="2.5" />
                {/* East-West Center Divider */}
                <line x1="0" y1="250" x2="160" y2="250" stroke="#FFB547" strokeWidth="2.5" />
                <line x1="340" y1="250" x2="500" y2="250" stroke="#FFB547" strokeWidth="2.5" />

                {/* Dashed Lane Lines */}
                <line x1="210" y1="0" x2="210" y2="160" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />
                <line x1="290" y1="0" x2="290" y2="160" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />
                <line x1="210" y1="340" x2="210" y2="500" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />
                <line x1="290" y1="340" x2="290" y2="500" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />

                <line x1="0" y1="210" x2="160" y2="210" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />
                <line x1="0" y1="290" x2="160" y2="290" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />
                <line x1="340" y1="210" x2="500" y2="210" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />
                <line x1="340" y1="290" x2="500" y2="290" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 6" strokeOpacity="0.4" />

                {/* Pedestrian Crosswalks */}
                {/* North Crosswalk */}
                <g opacity={pedestrianRouteActive ? 0.35 : 0.8}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <rect key={`nw-${i}`} x={175 + i * 19} y={154} width={12} height={12} fill={pedestrianRouteActive ? '#FF5C6C' : '#E8ECF5'} rx={1} />
                  ))}
                </g>

                {/* South Crosswalk */}
                <g opacity={pedestrianRouteActive ? 1 : 0.8}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <rect
                      key={`sw-${i}`}
                      x={175 + i * 19}
                      y={334}
                      width={12}
                      height={12}
                      fill={pedestrianRouteActive ? '#2EE6A6' : '#E8ECF5'}
                      rx={1}
                    />
                  ))}
                </g>

                {/* East & West Crosswalks */}
                <g opacity="0.8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <rect key={`ew-${i}`} x={154} y={175 + i * 19} width={12} height={12} fill="#E8ECF5" rx={1} />
                  ))}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <rect
                      key={`ww-${i}`}
                      x={334}
                      y={175 + i * 19}
                      width={12}
                      height={12}
                      fill={pedestrianRouteActive ? '#2EE6A6' : '#E8ECF5'}
                      rx={1}
                    />
                  ))}
                </g>

                {/* Traffic Signals Heads */}
                {/* North Signal (controlling Southbound into junction) */}
                <g transform="translate(145, 140)">
                  <rect x="0" y="0" width="20" height="28" rx="4" fill="#07090F" stroke="#1E2738" />
                  <circle
                    cx="10"
                    cy="8"
                    r="4"
                    fill={greenCorridorActive ? '#2EE6A6' : activeScenarioId === 'collision' ? '#FF5C6C' : '#2EE6A6'}
                    className="filter drop-shadow"
                  />
                  <circle cx="10" cy="20" r="4" fill="#222A3B" />
                </g>

                {/* South Signal (controlling Northbound into junction) */}
                <g transform="translate(335, 332)">
                  <rect x="0" y="0" width="20" height="28" rx="4" fill="#07090F" stroke="#1E2738" />
                  <circle
                    cx="10"
                    cy="8"
                    r="4"
                    fill={
                      activeScenarioId === 'collision' || activeScenarioId === 'ai_verification'
                        ? '#FF5C6C'
                        : greenCorridorActive
                        ? '#2EE6A6'
                        : '#2EE6A6'
                    }
                  />
                  <circle cx="10" cy="20" r="4" fill="#222A3B" />
                </g>

                {/* East-West Signals (Cross traffic) */}
                <g transform="translate(335, 140)">
                  <rect x="0" y="0" width="28" height="20" rx="4" fill="#07090F" stroke="#1E2738" />
                  <circle
                    cx="8"
                    cy="10"
                    r="4"
                    fill={greenCorridorActive ? '#FF5C6C' : '#FF5C6C'}
                  />
                  <circle cx="20" cy="10" r="4" fill="#222A3B" />
                </g>

                {/* Normal Moving Traffic (Scenario 1 & background) */}
                {activeScenarioId === 'normal' && (
                  <g>
                    {/* Northbound Lane 1 Car */}
                    <rect
                      x="265"
                      y={450 - ((simTick * 8) % 450)}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#38BDF8"
                    />
                    {/* Northbound Lane 2 Car */}
                    <rect
                      x="295"
                      y={480 - ((simTick * 10) % 480)}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#E8ECF5"
                    />
                    {/* Southbound Lane 1 Car */}
                    <rect
                      x="220"
                      y={(simTick * 9) % 460}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#4F8CFF"
                    />
                    {/* Southbound Lane 2 Car */}
                    <rect
                      x="185"
                      y={(simTick * 7) % 480}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#2EE6A6"
                    />
                    {/* Eastbound Car */}
                    <rect
                      x={(simTick * 8) % 450}
                      y="265"
                      width="36"
                      height="20"
                      rx="4"
                      fill="#FFB547"
                    />
                  </g>
                )}

                {/* SCENARIO 2 - 9: ACCIDENT SITE & COLLISION STATE */}
                {activeScenarioId !== 'normal' && !trafficRestored && (
                  <g>
                    {/* Surrounding moving traffic on free lane (Lane 1) */}
                    <rect
                      x="220"
                      y={(simTick * 6) % 450}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#4F8CFF"
                      opacity="0.8"
                    />
                    {/* Lane 1 bypass car smoothly diverting */}
                    <rect
                      x="265"
                      y={420 - ((simTick * 5) % 380)}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#38BDF8"
                      opacity="0.85"
                    />

                    {/* Damaged Vehicles Positioned in Lane 2 */}
                    {roadClearanceStep < 3 && (
                      <g>
                        {/* Vehicle A (Blue Sedan) - stopped at slight collision angle */}
                        <g transform="translate(290, 215) rotate(18)">
                          <rect x="0" y="0" width="22" height="38" rx="4" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.5" />
                          <rect x="3" y="6" width="16" height="12" rx="2" fill="#93C5FD" />
                          {/* Blinking hazard lights */}
                          <circle cx="2" cy="2" r="2" fill="#FFB547" className="animate-ping" />
                          <circle cx="20" cy="2" r="2" fill="#FFB547" className="animate-ping" />
                        </g>

                        {/* Vehicle B (Silver Hatchback) - collided impact angle */}
                        <g transform="translate(276, 202) rotate(-32)">
                          <rect x="0" y="0" width="22" height="34" rx="4" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="1.5" />
                          <rect x="3" y="5" width="16" height="10" rx="2" fill="#E2E8F0" />
                          <circle cx="2" cy="2" r="2" fill="#FFB547" className="animate-ping" />
                          <circle cx="20" cy="2" r="2" fill="#FFB547" className="animate-ping" />
                        </g>

                        {/* Non-graphic Collision Impact Flash / Bounding Frame */}
                        <g>
                          <rect
                            x="265"
                            y="185"
                            width="60"
                            height="75"
                            fill="none"
                            stroke="#00E5FF"
                            strokeWidth="1.8"
                            strokeDasharray="4 2"
                            rx="4"
                          />
                          <text x="268" y="180" fill="#00E5FF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            AI OCCLUSION [94%]
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Road Clearance Step >= 3: Damaged Vehicles Towed to Staging Shoulder */}
                    {roadClearanceStep >= 3 && (
                      <g transform="translate(345, 185) scale(0.85)">
                        <rect x="0" y="0" width="40" height="22" rx="3" fill="#64748B" stroke="#94A3B8" />
                        <text x="4" y="14" fill="#FFFFFF" fontSize="8" fontFamily="monospace">
                          SECURED
                        </text>
                      </g>
                    )}

                    {/* Tow Truck during clearance step 2 or 3 */}
                    {roadClearanceStep >= 2 && roadClearanceStep < 4 && (
                      <g transform="translate(295, 235)">
                        <rect x="0" y="0" width="26" height="44" rx="4" fill="#FFB547" stroke="#FFFFFF" strokeWidth="1.5" />
                        <rect x="4" y="6" width="18" height="12" rx="2" fill="#1E2738" />
                        <circle cx="13" cy="2" r="3" fill="#FF5C6C" className="animate-ping" />
                        <text x="5" y="40" fill="#07090F" fontSize="6" fontWeight="bold">
                          TOW
                        </text>
                      </g>
                    )}

                    {/* Safety Perimeter Cones in Lane 2 (Scenarios 7, 8, 9) */}
                    {(rescueActive || roadClearanceStep > 0) && (
                      <g>
                        {/* Upstream Safety Cones */}
                        {[0, 1, 2, 3].map((idx) => (
                          <g key={`cone-${idx}`} transform={`translate(${275 + (idx % 2) * 20}, ${270 + idx * 15})`}>
                            <polygon points="4,0 8,12 0,12" fill="#FF5C6C" stroke="#FFFFFF" strokeWidth="0.8" />
                          </g>
                        ))}

                        {/* Perimeter Barrier Line */}
                        <line
                          x1="260"
                          y1="180"
                          x2="260"
                          y2="330"
                          stroke="#FFB547"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                        />
                      </g>
                    )}

                    {/* Police Cruiser P-102 (Scenarios 4 - 9) */}
                    {policeDispatched && (
                      <g transform="translate(275, 310)">
                        <rect x="0" y="0" width="24" height="42" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                        <rect x="3" y="8" width="18" height="14" rx="2" fill="#38BDF8" opacity="0.3" />
                        {/* Red and Blue Strobes */}
                        <circle cx="7" cy="2" r="3" fill="#38BDF8" className="animate-ping" />
                        <circle cx="17" cy="2" r="3" fill="#FF5C6C" className="animate-ping" />
                        <text x="4" y="36" fill="#FFFFFF" fontSize="7" fontFamily="monospace" fontWeight="bold">
                          POLICE
                        </text>
                      </g>
                    )}

                    {/* Ambulance Medic-14 (Scenarios 5 - 7) */}
                    {ambulanceDispatched && (
                      <g transform="translate(225, 230)">
                        <rect x="0" y="0" width="26" height="46" rx="4" fill="#FFFFFF" stroke="#FF5C6C" strokeWidth="1.8" />
                        <rect x="4" y="6" width="18" height="12" rx="2" fill="#E2E8F0" />
                        {/* Red Cross */}
                        <rect x="11" y="22" width="4" height="12" fill="#FF5C6C" />
                        <rect x="7" y="26" width="12" height="4" fill="#FF5C6C" />
                        {/* Emergency Strobe */}
                        <circle cx="13" cy="2" r="3" fill="#2EE6A6" className="animate-ping" />
                        <text x="3" y="42" fill="#FF5C6C" fontSize="6.5" fontWeight="bold">
                          MEDIC
                        </text>
                      </g>
                    )}

                    {/* Pedestrian Safe Passage Detour (Scenario 9) */}
                    {pedestrianRouteActive && (
                      <g>
                        {/* Blocked North Crosswalk Barrier */}
                        <g transform="translate(180, 145)">
                          <rect x="0" y="0" width="140" height="8" rx="2" fill="#FF5C6C" />
                          <text x="30" y="7" fill="#FFFFFF" fontSize="7" fontWeight="bold">
                            CROSSWALK CLOSED — USE SOUTH DETOUR
                          </text>
                        </g>

                        {/* Animated Pedestrian Dots on South Crosswalk */}
                        <circle cx="195" cy="340" r="4" fill="#38BDF8" />
                        <circle cx="230" cy="340" r="4" fill="#38BDF8" />
                        <circle cx="280" cy="340" r="4" fill="#38BDF8" />
                        <circle cx="310" cy="340" r="4" fill="#38BDF8" />

                        {/* Directional Pathway Arrow */}
                        <path
                          d="M 180,345 L 320,345"
                          stroke="#2EE6A6"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          markerEnd="url(#arrow)"
                        />
                      </g>
                    )}
                  </g>
                )}

                {/* SCENARIO 10: TRAFFIC FULLY RESTORED */}
                {trafficRestored && (
                  <g>
                    {/* All lanes open and moving smoothly */}
                    <rect
                      x="265"
                      y={450 - ((simTick * 9) % 450)}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#38BDF8"
                    />
                    <rect
                      x="295"
                      y={480 - ((simTick * 10) % 480)}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#2EE6A6"
                    />
                    <rect
                      x="220"
                      y={(simTick * 8) % 460}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#4F8CFF"
                    />
                    <rect
                      x="185"
                      y={(simTick * 9) % 480}
                      width="20"
                      height="36"
                      rx="4"
                      fill="#E8ECF5"
                    />
                    <rect
                      x={(simTick * 8) % 450}
                      y="265"
                      width="36"
                      height="20"
                      rx="4"
                      fill="#FFB547"
                    />

                    {/* Restored Lane 2 Stamp */}
                    <g transform="translate(270, 200)">
                      <rect x="0" y="0" width="55" height="20" rx="4" fill="#2EE6A6" opacity="0.9" />
                      <text x="5" y="14" fill="#07090F" fontSize="8" fontWeight="bold">
                        LANE 2 OPEN
                      </text>
                    </g>
                  </g>
                )}

                {/* Camera HUD Crosshair Overlay */}
                <g stroke="#2EE6A6" strokeWidth="1" strokeOpacity="0.4">
                  <line x1="20" y1="20" x2="40" y2="20" />
                  <line x1="20" y1="20" x2="20" y2="40" />
                  <line x1="480" y1="20" x2="460" y2="20" />
                  <line x1="480" y1="20" x2="480" y2="40" />
                  <line x1="20" y1="480" x2="40" y2="480" />
                  <line x1="20" y1="480" x2="20" y2="460" />
                  <line x1="480" y1="480" x2="460" y2="480" />
                  <line x1="480" y1="480" x2="480" y2="460" />
                </g>
              </svg>

              {/* Inset Camera HUD Legend / Status Overlay */}
              <div className="absolute bottom-3 left-3 bg-[#07090F]/90 backdrop-blur-md p-2.5 rounded-xl border border-[var(--border)] text-[10px] font-mono-data space-y-1">
                <div className="flex items-center space-x-2 text-[#2EE6A6]">
                  <Activity className="w-3 h-3" />
                  <span>SPEED: {activeScenarioId === 'normal' || trafficRestored ? '44.8 km/h' : '11.2 km/h (Slow)'}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#8A94A9]">
                  <span>DENSITY: {activeScenarioId === 'normal' || trafficRestored ? '38% (Optimal)' : '78% (Congested)'}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#FFB547]">
                  <span>LANE 2: {trafficRestored ? 'OPEN' : activeScenarioId === 'normal' ? 'NORMAL' : roadClearanceStep >= 6 ? 'CLEARED' : 'BLOCKED'}</span>
                </div>
              </div>
            </div>

            {/* Quick Simulation Telemetry Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[var(--border)] text-xs">
              <div className="p-2 rounded-xl bg-[#0E1320] border border-[var(--border)]">
                <div className="text-[10px] text-[#8A94A9]">Camera Status</div>
                <div className="font-mono-data font-bold text-[#2EE6A6] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2EE6A6]" />
                  <span>ACTIVE 60FPS</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#0E1320] border border-[var(--border)]">
                <div className="text-[10px] text-[#8A94A9]">Vehicle Flow</div>
                <div className="font-mono-data font-bold text-white">
                  {trafficRestored ? '1,280 veh/hr' : activeScenarioId === 'normal' ? '1,150 veh/hr' : '420 veh/hr'}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#0E1320] border border-[var(--border)]">
                <div className="text-[10px] text-[#8A94A9]">Incident Severity</div>
                <div
                  className={`font-mono-data font-bold ${
                    activeScenarioId === 'normal' || trafficRestored
                      ? 'text-[#2EE6A6]'
                      : 'text-[#FF5C6C]'
                  }`}
                >
                  {activeScenarioId === 'normal' || trafficRestored ? 'NONE (NORMAL)' : 'HIGH (SEV-3)'}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#0E1320] border border-[var(--border)]">
                <div className="text-[10px] text-[#8A94A9]">Corridor Interlock</div>
                <div
                  className={`font-mono-data font-bold ${
                    greenCorridorActive ? 'text-[#2EE6A6]' : 'text-[#8A94A9]'
                  }`}
                >
                  {greenCorridorActive ? '0 CONFLICTS' : 'STANDARD SPLIT'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Scenario Operational Modules & Dynamic Details */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Scenario-Specific Details Card */}
          <div className="glass-panel p-5 rounded-3xl border border-[var(--border)] bg-[#0A0D17] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeMeta.tagColor }}
                />
                <h3 className="font-heading font-bold text-base text-white">
                  Operational Details: Scenario {activeMeta.number}
                </h3>
              </div>
              <span className="text-[11px] font-mono-data text-[#8A94A9]">
                Module {activeMeta.number} of 10
              </span>
            </div>

            {/* SCENARIO 1 CONTENT */}
            {activeScenarioId === 'normal' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#8A94A9] leading-relaxed">
                  TrafficPulse continuously monitors the urban arterial before incidents happen. High-frame-rate edge video cameras combined with inductive loop occupancy detectors maintain optimal green light splits.
                </p>
                <div className="space-y-2 p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Junction ID:</span>
                    <span className="text-white">J1_CENTRAL (Square)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Camera Status:</span>
                    <span className="text-[#2EE6A6]">Online (Latency: 14ms)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Average Velocity:</span>
                    <span className="text-white">44.8 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Congestion Index:</span>
                    <span className="text-[#2EE6A6]">38% (Free Flow)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Pedestrian Walk Signals:</span>
                    <span className="text-white">Synchronized (Phase A/B)</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#2EE6A6]/10 border border-[#2EE6A6]/30 text-[#2EE6A6] text-[11px]">
                  <strong>Presenter Note:</strong> Emphasize that TrafficPulse prevents gridlock dynamically during normal hours before incidents even occur.
                </div>
              </div>
            )}

            {/* SCENARIO 2 CONTENT */}
            {activeScenarioId === 'collision' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FF5C6C]/10 border border-[#FF5C6C]/30 text-[#FF5C6C]">
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Potential Collision Event Triggered</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Edge camera detects sudden vehicle occlusion and deceleration in Northbound Lane 2. State machine initialized in controlled, non-graphic simulation.
                  </p>
                </div>
                <div className="space-y-2 p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Incident Code:</span>
                    <span className="text-white">INC-2024-ACC-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Vehicles Involved:</span>
                    <span className="text-white">2 (Sedan + Hatchback)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Impact Severity:</span>
                    <span className="text-[#FF5C6C] font-bold">HIGH (Score: 68/100)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">AI Vision Confidence:</span>
                    <span className="text-[#2EE6A6]">94.2% Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Blocked Lanes:</span>
                    <span className="text-[#FFB547]">Lane 2 (Northbound)</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 3 CONTENT */}
            {activeScenarioId === 'ai_verification' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#8A94A9]">
                  TrafficPulse never trusts a raw score blindly. The incident moves through an evidence-based multi-tier verification pipeline:
                </p>

                {/* 4-Stage Verification Ladder */}
                <div className="space-y-2">
                  {[
                    { step: 1, name: 'Potential Incident', desc: 'Sudden deceleration (45 -> 0 km/h)', done: true },
                    { step: 2, name: 'AI Vision Analysis', desc: 'YOLO edge model flags vehicle occlusion (94% conf)', done: true },
                    { step: 3, name: 'Sensor Verification', desc: 'Inductive loop reports 88% persistent lane occupancy', done: !sensorFailureFallback },
                    { step: 4, name: 'Confirmed Emergency', desc: 'Cross-validated; dispatched to Police CAD & EMS', done: !sensorFailureFallback },
                  ].map((st) => (
                    <div
                      key={st.step}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        st.done
                          ? 'bg-[#151C2E] border-[#2EE6A6]/40 text-white'
                          : 'bg-[#0E1320] border-[#FF5C6C]/40 text-[#8A94A9]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono-data ${
                            st.done ? 'bg-[#2EE6A6] text-[#07090F]' : 'bg-[#FF5C6C] text-white'
                          }`}
                        >
                          {st.step}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{st.name}</div>
                          <div className="text-[10px] text-[#8A94A9]">{st.desc}</div>
                        </div>
                      </div>
                      <CheckCircle2
                        className={`w-4 h-4 ${st.done ? 'text-[#2EE6A6]' : 'text-[#8A94A9]'}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Fallback Simulator Toggle */}
                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[11px] text-[#8A94A9]">Test Graceful Degradation:</span>
                  <button
                    onClick={() => setSensorFailureFallback(!sensorFailureFallback)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono-data bg-[#151C2E] border border-[var(--border)] text-[#FFB547] hover:bg-[#1E2738] cursor-pointer"
                  >
                    {sensorFailureFallback ? 'Restore Sensor Fusion' : 'Simulate Sensor Offline'}
                  </button>
                </div>
                {sensorFailureFallback && (
                  <div className="p-2 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/30 text-[#FFB547] text-[10px]">
                    <strong>Tier 3 Fallback Active:</strong> Physical loop sensor unavailable. System falls back to camera verification + operator review without false assertions.
                  </div>
                )}
              </div>
            )}

            {/* SCENARIO 4 CONTENT */}
            {activeScenarioId === 'police_dispatch' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Simulated Police Command Center Notification</span>
                  </div>
                  <p className="text-[11px]">
                    {policeDispatched
                      ? 'Police unit dispatched — simulation. Patrol Cruiser P-102 en route to secure arterial.'
                      : 'CAD Incident alert queued. Awaiting unit dispatch simulation command.'}
                  </p>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Unit Call-Sign:</span>
                    <span className="text-white">Patrol Cruiser P-102</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Station Location:</span>
                    <span className="text-white">Metro Central Precinct</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Simulated ETA:</span>
                    <span className="text-[#38BDF8]">2.5 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Arterial Mandate:</span>
                    <span className="text-white">Divert Lane 2 to Lane 1; establish cones</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">CAD Status:</span>
                    <span className="text-[#2EE6A6]">
                      {policeDispatched ? 'DISPATCHED (SIMULATED)' : 'STANDBY'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 5 CONTENT */}
            {activeScenarioId === 'ambulance_hospital' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#8A94A9]">
                  Smart hospital routing matches patient trauma severity against real-time hospital bed capacity and travel times:
                </p>

                {/* 3 Hospital Options */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#2EE6A6]/10 border border-[#2EE6A6]/40">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        <Hospital className="w-3.5 h-3.5 text-[#2EE6A6]" />
                        <span>St. Jude Metro Trauma Center (SIMULATED)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#2EE6A6] text-[#07090F] font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8A94A9] space-y-0.5 font-mono-data">
                      <div>ICU Beds: 8 Available • Capacity Load: 68%</div>
                      <div>Travel ETA: 5.1 mins • Specialty: Level 1 Trauma Care</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0E1320] border border-[var(--border)] opacity-60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">City General Pavilion</span>
                      <span className="text-[10px] text-[#FF5C6C] font-bold">DIVERTED (92% LOAD)</span>
                    </div>
                    <div className="text-[10px] text-[#8A94A9] font-mono-data">
                      Nearest (4.1m) but only 1 ICU bed open. High diversion risk.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0E1320] border border-[var(--border)] opacity-75">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">University Health Memorial</span>
                      <span className="text-[10px] text-[#4F8CFF] font-bold">FALLBACK (14 BEDS)</span>
                    </div>
                    <div className="text-[10px] text-[#8A94A9] font-mono-data">
                      ETA 8.5m • Secondary pediatric / burn trauma center.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 6 CONTENT */}
            {activeScenarioId === 'green_corridor' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#2EE6A6]/10 border border-[#2EE6A6]/30 text-[#2EE6A6]">
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Emergency Green Corridor Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Signals along the emergency route (J4 East → J1 Central → St. Jude Hospital) are preempted to Green. NEMA safety interlocks lock cross-streets to Red.
                  </p>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Route Waypoints:</span>
                    <span className="text-white">J4 East → J1 Central → Hospital</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Preemption Phase:</span>
                    <span className="text-[#2EE6A6]">North-South Priority GREEN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Safety Conflict Check:</span>
                    <span className="text-[#2EE6A6] font-bold">VERIFIED (0 Conflicting Greens)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Estimated Travel Time Saved:</span>
                    <span className="text-[#2EE6A6] font-bold">-38% (Saved 3.4 mins)</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 7 CONTENT */}
            {activeScenarioId === 'rescue_safety' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#8A94A9]">
                  Emergency responders secure the accident scene. System prioritizes safe access, victim stabilization, and secondary-crash mitigation:
                </p>

                {/* Responder Checklist */}
                <div className="space-y-2 font-mono-data">
                  {[
                    { label: 'Upstream Safety Perimeter Established', checked: true },
                    { label: 'Protected Emergency Access Lane Kept Open', checked: true },
                    { label: 'Secondary Collision Risk Suppressed (-71%)', checked: true },
                    { label: 'Patient Triage: Professional Assessment in Progress', checked: true },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-[#0E1320] border border-[var(--border)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6]" />
                      <span className="text-white text-[11px]">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/30 text-[#FFB547] text-[11px]">
                  <strong>Safety Protocol Note:</strong> The system strictly adheres to non-graphic visualization and does not claim automated medical diagnosis.
                </div>
              </div>
            )}

            {/* SCENARIO 8 CONTENT */}
            {activeScenarioId === 'road_clearance' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#8A94A9]">
                  Step-by-step preparation for arterial reopening. Lanes remain strictly blocked until inspection and authorized clearance are logged:
                </p>

                <div className="space-y-1.5 font-mono-data text-[11px]">
                  {[
                    { step: 1, name: 'Responders inspect accident zone' },
                    { step: 2, name: 'Police establish secured work perimeter' },
                    { step: 3, name: 'Damaged vehicles towed to safe staging area' },
                    { step: 4, name: 'Debris sweeping and fluid absorption' },
                    { step: 5, name: 'Final roadway friction & surface inspection' },
                    { step: 6, name: 'Authorized clearance confirmation recorded' },
                  ].map((s) => {
                    const isDone = roadClearanceStep >= s.step;
                    const isCurrent = roadClearanceStep === s.step;
                    return (
                      <div
                        key={s.step}
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          isDone
                            ? 'bg-[#151C2E] border-[#2EE6A6]/40 text-white'
                            : isCurrent
                            ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]'
                            : 'bg-[#0E1320] border-[var(--border)] text-[#8A94A9]'
                        }`}
                      >
                        <span>
                          {s.step}. {s.name}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6]" />
                        ) : (
                          <span className="text-[10px] text-[#8A94A9]">PENDING</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-[#8A94A9]">Lane 2 Status:</span>
                  <span
                    className={`font-mono-data font-bold px-2 py-0.5 rounded ${
                      roadClearanceStep >= 6
                        ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]'
                        : 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                    }`}
                  >
                    {roadClearanceStep >= 6 ? 'CLEARED FOR REOPENING' : 'BLOCKED / CLEARING'}
                  </span>
                </div>
              </div>
            )}

            {/* SCENARIO 9 CONTENT */}
            {activeScenarioId === 'pedestrian_safety' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <Users className="w-4 h-4" />
                    <span>Dynamic Pedestrian Safe Passage Active</span>
                  </div>
                  <p className="text-[11px]">
                    Hazard area crosswalks are blocked with temporary barriers. Pedestrians are automatically routed through protected south/west illuminated crosswalks safely separated from emergency vehicles.
                  </p>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">North Crosswalk:</span>
                    <span className="text-[#FF5C6C] font-bold">CLOSED (Hazard Barrier Active)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Detour Crosswalk:</span>
                    <span className="text-[#2EE6A6] font-bold">SOUTH APPROACH OPEN (Green)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Emergency Path Separation:</span>
                    <span className="text-white">100% Isolated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Crowd Safety Score:</span>
                    <span className="text-[#2EE6A6]">98.5% (Protected)</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 10 CONTENT */}
            {activeScenarioId === 'traffic_restoration' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#2EE6A6]/10 border border-[#2EE6A6]/30 text-[#2EE6A6]">
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Normal Arterial Operations Restored</span>
                  </div>
                  <p className="text-[11px]">
                    Inspection confirmed. Lane 2 reopened. Temporary diversions lifted. Signal timing returned to autonomous queue-adaptive mode.
                  </p>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Average Velocity:</span>
                    <span className="text-[#2EE6A6] font-bold">44.8 km/h (Recovered from 11 km/h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Arterial Throughput:</span>
                    <span className="text-white">1,280 vehicles/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Congestion Index:</span>
                    <span className="text-[#2EE6A6]">32% (Fluid Flow)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Adaptive Control Status:</span>
                    <span className="text-white">Active Dynamic Split</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 11 CONTENT (Full Demonstration Summary) */}
            {activeScenarioId === 'full_demo' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#2EE6A6]/20 to-[#4F8CFF]/20 border border-[#2EE6A6]/40">
                  <div className="font-heading font-bold text-white text-sm mb-1 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#2EE6A6]" />
                    <span>Complete Incident Response Demonstration</span>
                  </div>
                  <p className="text-[#8A94A9] text-[11px] leading-relaxed">
                    Automated, connected presentation workflow guiding evaluators through the entire 10-stage incident response pipeline with live timeline progression.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0E1320] border border-[var(--border)] space-y-2 font-mono-data">
                  <div className="text-[11px] text-[#8A94A9]">Presentation Checklist:</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="text-[#2EE6A6]">✓ 1. Normal Monitoring</div>
                    <div className="text-[#2EE6A6]">✓ 2. Two-Car Collision</div>
                    <div className="text-[#2EE6A6]">✓ 3. AI Verification</div>
                    <div className="text-[#2EE6A6]">✓ 4. Police CAD Alert</div>
                    <div className="text-[#2EE6A6]">✓ 5. Hospital Triage</div>
                    <div className="text-[#2EE6A6]">✓ 6. Green Corridor</div>
                    <div className="text-[#2EE6A6]">✓ 7. Site Rescue</div>
                    <div className="text-[#2EE6A6]">✓ 8. Road Clearance</div>
                    <div className="text-[#2EE6A6]">✓ 9. Pedestrian Safety</div>
                    <div className="text-[#2EE6A6]">✓ 10. Recovery</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Incident Audit Log Trail */}
          <div className="glass-panel p-4 rounded-2xl border border-[var(--border)] bg-[#07090F] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="text-[#8A94A9] font-bold uppercase">Immutable Incident Audit Log</span>
              <span className="text-[#2EE6A6]">SHA-256 Verified</span>
            </div>
            <div className="space-y-1.5 font-mono-data text-[10px] text-[#8A94A9] max-h-32 overflow-y-auto">
              <div className="flex justify-between border-b border-[var(--border)] pb-1">
                <span>08:02:10 AM</span>
                <span className="text-white">Edge Camera 01: Baseline Flow 44km/h</span>
              </div>
              {activeScenarioId !== 'normal' && (
                <div className="flex justify-between border-b border-[var(--border)] pb-1">
                  <span>08:03:14 AM</span>
                  <span className="text-[#FF5C6C]">ACCIDENT DETECTED: 2 Cars in Lane 2</span>
                </div>
              )}
              {policeDispatched && (
                <div className="flex justify-between border-b border-[var(--border)] pb-1">
                  <span>08:03:45 AM</span>
                  <span className="text-[#38BDF8]">POLICE DISPATCH: Cruiser P-102 Assigned</span>
                </div>
              )}
              {greenCorridorActive && (
                <div className="flex justify-between border-b border-[var(--border)] pb-1">
                  <span>08:04:02 AM</span>
                  <span className="text-[#2EE6A6]">GREEN CORRIDOR: Preempted Phase A (N-S)</span>
                </div>
              )}
              {trafficRestored && (
                <div className="flex justify-between border-b border-[var(--border)] pb-1">
                  <span>08:07:30 AM</span>
                  <span className="text-[#2EE6A6]">RESTORATION: Lane 2 Reopened & Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Technical Details Drawer */}
      {showTechDetails && (
        <div className="glass-panel p-6 rounded-3xl border border-[#4F8CFF]/40 bg-[#07090F] space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#4F8CFF]" />
              <h3 className="font-heading font-bold text-lg text-white">
                Technical Deep Dive & System Architecture
              </h3>
            </div>
            <button
              onClick={() => setShowTechDetails(false)}
              className="p-1 rounded-lg hover:bg-[#151C2E] text-[#8A94A9] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0E1320] border border-[var(--border)] space-y-2">
              <h4 className="font-bold text-white flex items-center space-x-1.5">
                <Video className="w-4 h-4 text-[#2EE6A6]" />
                <span>Edge Computer Vision Model</span>
              </h4>
              <p className="text-[#8A94A9] leading-relaxed">
                YOLOv8 Edge inference running at 60 FPS on edge TPU devices. Calculates optical flow vectors, spatial occlusion, and sudden velocity drops across 4 intersection zones.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1320] border border-[var(--border)] space-y-2">
              <h4 className="font-bold text-white flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-[#4F8CFF]" />
                <span>NEMA TS-2 Signal Interlocks</span>
              </h4>
              <p className="text-[#8A94A9] leading-relaxed">
                Preemption protocols enforce strict yellow clearance intervals and conflict monitors. It is physically impossible to grant concurrent green phases to intersecting trajectories.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1320] border border-[var(--border)] space-y-2">
              <h4 className="font-bold text-white flex items-center space-x-1.5">
                <Hospital className="w-4 h-4 text-[#FF5C6C]" />
                <span>Hospital Load Balancing Matrix</span>
              </h4>
              <p className="text-[#8A94A9] leading-relaxed">
                Multi-objective ranking algorithm balances travel ETA, open ICU beds, and specialized trauma capabilities to prevent critical emergency room overcrowding during mass incidents.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
