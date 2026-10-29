// Scenario Center: Top Control Hub with 11 Scenario Buttons, Full Demo Scrubber, and Progress Bar
import React from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ORDERED_DEMO_SEQUENCE, SCENARIO_METADATA } from '../../scenarios/config';
import { useScenario } from '../../scenarios/ScenarioContext';
import { ScenarioId } from '../../scenarios/types';

interface ScenarioCenterProps {
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  showTechDetails: boolean;
  onToggleTechDetails: () => void;
}

export const ScenarioCenter: React.FC<ScenarioCenterProps> = ({
  isPresentationMode,
  onTogglePresentationMode,
  showTechDetails,
  onToggleTechDetails,
}) => {
  const {
    state,
    selectScenario,
    startFullDemo,
    pauseFullDemo,
    resumeFullDemo,
    resetDemo,
    nextStep,
    prevStep,
    jumpToStep,
    setPlaybackSpeed,
  } = useScenario();

  const activeMeta =
    SCENARIO_METADATA.find((s) => s.id === state.activeScenarioId) || SCENARIO_METADATA[0];

  return (
    <div className="space-y-5">
      {/* Simulation Watermark & B.Tech Exhibition Banner */}
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
            Autonomous demonstration logic (no real emergency dispatches or infrastructure commands).
          </span>
          <button
            onClick={onTogglePresentationMode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1E2738] hover:bg-[#28354D] text-xs font-semibold text-white border border-[var(--border)] transition-colors cursor-pointer"
            title="Toggle Fullscreen Projector Exhibition Mode"
            aria-pressed={isPresentationMode}
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
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
              if (state.isDemoRunning) {
                pauseFullDemo();
              } else {
                startFullDemo();
              }
            }}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2EE6A6] via-[#24c78f] to-[#1cb380] text-[#07090F] font-heading font-extrabold text-sm shadow-xl shadow-[#2EE6A6]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
          >
            {state.isDemoRunning ? (
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
            onClick={resetDemo}
            className="flex items-center space-x-1.5 px-3.5 py-3 rounded-2xl bg-[#151C2E] hover:bg-[#1C263D] border border-[var(--border)] text-xs font-semibold text-[#8A94A9] hover:text-white transition-colors cursor-pointer"
            title="Reset to Normal Baseline (Cleans demo state without erasing other records)"
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
          {SCENARIO_METADATA.map((sc) => {
            const isActive = state.activeScenarioId === sc.id;
            const Icon = sc.icon;
            const isFullDemoBtn = sc.id === 'full_demo';

            return (
              <button
                key={sc.id}
                onClick={() => selectScenario(sc.id)}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-[#2EE6A6] ${
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

      {/* Full Demonstration Workflow Dynamic Progress Bar & Scrubber */}
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
              {state.isDemoRunning ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#2EE6A6]/20 border border-[#2EE6A6]/40 text-xs font-mono-data font-bold text-[#2EE6A6] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#2EE6A6] inline-block animate-ping" />
                  <span>● RUNNING AUTOMATED DEMO ({state.playbackSpeed}x)</span>
                </span>
              ) : state.demoProgress >= 100 ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#2EE6A6]/20 border border-[#2EE6A6]/40 text-xs font-mono-data font-bold text-[#2EE6A6]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6]" />
                  <span>DEMONSTRATION COMPLETED (100%)</span>
                </span>
              ) : state.demoProgress > 0 ? (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FFB547]/20 border border-[#FFB547]/40 text-xs font-mono-data font-bold text-[#FFB547]">
                  <Pause className="w-3 h-3 text-[#FFB547]" />
                  <span>DEMONSTRATION PAUSED (STEP {state.demoStepIndex + 1}/10)</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#151C2E] border border-[var(--border)] text-xs font-mono-data text-[#8A94A9]">
                  <Play className="w-3 h-3 text-[#8A94A9]" />
                  <span>STANDBY (CLICK PLAY OR ANY SCENARIO)</span>
                </span>
              )}

              <span className="text-xs font-mono-data text-[#8A94A9] hidden sm:inline">
                • Step {state.demoStepIndex + 1} of {ORDERED_DEMO_SEQUENCE.length}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                {activeMeta.title}
              </h2>
              <span className="text-xs text-[#8A94A9] font-sans">
                {state.demoStepIndex < ORDERED_DEMO_SEQUENCE.length - 1
                  ? `(Next: ${SCENARIO_METADATA[state.demoStepIndex + 1]?.shortTitle || ''})`
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
                  {state.demoStepIndex + 1} / 10 Steps
                </div>
              </div>
              <div className="font-mono-data text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2EE6A6] via-[#4F8CFF] to-[#FFB547] leading-none drop-shadow-sm">
                {Math.round(state.demoProgress)}%
              </div>
            </div>

            {/* Scrubber Controls */}
            <div className="flex items-center space-x-1.5 bg-[#090D18] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={prevStep}
                disabled={state.demoStepIndex === 0}
                className="p-2 rounded-lg bg-[#151C2E] hover:bg-[#1E2738] disabled:opacity-40 disabled:hover:bg-[#151C2E] text-white transition-colors cursor-pointer"
                title="Previous Scenario Step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (state.isDemoRunning) pauseFullDemo();
                  else if (state.demoProgress >= 100) startFullDemo();
                  else resumeFullDemo();
                }}
                className="px-3.5 py-2 rounded-lg bg-[#2EE6A6] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#2EE6A6]/20"
                title={state.isDemoRunning ? 'Pause Demonstration' : 'Play / Resume Demonstration'}
              >
                {state.isDemoRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : state.demoProgress >= 100 ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{state.demoProgress > 0 ? 'Resume' : 'Play'}</span>
                  </>
                )}
              </button>

              <button
                onClick={nextStep}
                disabled={state.demoStepIndex >= ORDERED_DEMO_SEQUENCE.length - 1}
                className="p-2 rounded-lg bg-[#151C2E] hover:bg-[#1E2738] disabled:opacity-40 disabled:hover:bg-[#151C2E] text-white transition-colors cursor-pointer"
                title="Next Scenario Step"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={resetDemo}
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
                  onClick={() => setPlaybackSpeed(spd as 1 | 2 | 4)}
                  className={`px-2 py-1 rounded-lg font-mono-data text-[11px] font-bold transition-all cursor-pointer ${
                    state.playbackSpeed === spd
                      ? 'bg-[#2EE6A6] text-[#07090F] shadow-sm'
                      : 'bg-transparent text-[#8A94A9] hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={onToggleTechDetails}
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
              style={{ width: `${Math.min(100, Math.max(2, state.demoProgress))}%` }}
            >
              {/* Animated Leading Edge Highlight */}
              {state.isDemoRunning && (
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
            {ORDERED_DEMO_SEQUENCE.map((stepKey, idx) => {
              const isCurrent = idx === state.demoStepIndex;
              const isCompleted =
                state.demoProgress >= ((idx + 1) / ORDERED_DEMO_SEQUENCE.length) * 100 ||
                (idx < state.demoStepIndex && !state.isDemoRunning);
              const meta = SCENARIO_METADATA.find((s) => s.id === stepKey);
              if (!meta) return null;
              const StepIcon = meta.icon;

              return (
                <button
                  key={stepKey}
                  onClick={() => jumpToStep(idx)}
                  className={`flex flex-col p-2 rounded-xl text-left border transition-all cursor-pointer relative group focus-visible:ring-2 focus-visible:ring-[#2EE6A6] ${
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
    </div>
  );
};
