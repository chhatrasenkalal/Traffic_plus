// PresentationMode: Fullscreen Projector / Classroom Exhibition Experience
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { ORDERED_DEMO_SEQUENCE, SCENARIO_METADATA } from '../../scenarios/config';
import { useScenario } from '../../scenarios/ScenarioContext';
import { ScenarioStage } from './ScenarioStage';
import { StageInfoPanel } from './StageInfoPanel';

interface PresentationModeProps {
  onExit: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ onExit }) => {
  const {
    state,
    startFullDemo,
    pauseFullDemo,
    resumeFullDemo,
    resetDemo,
    nextStep,
    prevStep,
    jumpToStep,
  } = useScenario();

  const [showTechDrawer, setShowTechDrawer] = useState(false);

  // Keyboard Shortcuts: Space (pause/resume), ArrowLeft/Right (prev/next), R (replay), Esc (exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isDemoRunning) pauseFullDemo();
        else resumeFullDemo();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetDemo();
        startFullDemo();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isDemoRunning, pauseFullDemo, resumeFullDemo, nextStep, prevStep, resetDemo, startFullDemo, onExit]);

  const activeMeta =
    SCENARIO_METADATA.find((s) => s.id === state.activeScenarioId) || SCENARIO_METADATA[0];

  return (
    <div
      role="region"
      aria-label="Presentation Mode Exhibition Viewport"
      className="fixed inset-0 z-50 bg-[#060810] text-[#E8ECF5] flex flex-col justify-between overflow-hidden p-3 sm:p-6"
    >
      {/* Aria-live announcement region for screen readers during stage transitions */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Current Exhibition Stage: {activeMeta.title}. Completion: {Math.round(state.demoProgress)}%.
      </div>

      {/* Top Projector Header */}
      <header className="flex items-center justify-between pb-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EE6A6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2EE6A6]"></span>
            </span>
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white">
              TrafficPulse — Exhibition Projection Mode
            </span>
          </div>

          <span className="hidden md:inline font-mono-data text-xs px-2.5 py-0.5 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] font-bold">
            STEP {state.demoStepIndex + 1} OF 10: {activeMeta.shortTitle}
          </span>
        </div>

        {/* Top Right Projector Controls */}
        <div className="flex items-center space-x-2">
          {/* Completion Percentage Badge */}
          <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-[#0E1320] border border-[var(--border)] font-mono-data text-sm">
            <span className="text-[#8A94A9] text-xs">Progress:</span>
            <span className="text-[#2EE6A6] font-extrabold">{Math.round(state.demoProgress)}%</span>
          </div>

          <button
            onClick={() => setShowTechDrawer(!showTechDrawer)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#151C2E] hover:bg-[#1C263D] text-xs font-semibold text-[#8A94A9] hover:text-white border border-[var(--border)] cursor-pointer"
            title="Toggle Technical Edge Details"
            aria-pressed={showTechDrawer}
          >
            <Cpu className="w-3.5 h-3.5 text-[#4F8CFF]" />
            <span className="hidden sm:inline">Technical Proof</span>
            {showTechDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onExit}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FF5C6C]/20 hover:bg-[#FF5C6C]/30 text-[#FF5C6C] text-xs font-bold border border-[#FF5C6C]/40 cursor-pointer"
            title="Exit Presentation Mode (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </header>

      {/* Main Viewport: Canvas occupies >= 65% of viewport */}
      <main className="flex-1 flex flex-col justify-center items-center my-3 relative overflow-hidden min-h-[65vh]">
        <div className="w-full h-full max-h-[80vh] flex items-center justify-center">
          <ScenarioStage />
        </div>

        {/* Collapsible Tech Proof Drawer */}
        {showTechDrawer && (
          <div className="absolute inset-x-0 bottom-0 max-h-[50vh] overflow-y-auto bg-[#0A0E18]/95 backdrop-blur-md p-4 rounded-t-2xl border-t border-[var(--border)] shadow-2xl z-30">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono-data font-bold text-[#4F8CFF] uppercase">
                Hardware Provenance & Safety Proof Panel
              </h4>
              <button
                onClick={() => setShowTechDrawer(false)}
                className="p-1 text-[#8A94A9] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <StageInfoPanel />
          </div>
        )}
      </main>

      {/* Presentation Stage Controls & Caption Bar */}
      <footer className="space-y-3 shrink-0">
        {/* Dynamic Progress Bar */}
        <div className="w-full bg-[#151C2E] h-2 rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full bg-gradient-to-r from-[#2EE6A6] via-[#4F8CFF] to-[#FFB547] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(2, state.demoProgress))}%` }}
          />
        </div>

        {/* Bottom Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F19] p-3 rounded-2xl border border-[var(--border)]">
          {/* Narration Caption */}
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] font-bold">
              <span>{activeMeta.title}</span>
              <span className="text-[#8A94A9]">• Time: {state.simTimestamp}</span>
            </div>
            <p className="text-xs text-white max-w-2xl line-clamp-1">
              {activeMeta.description}
            </p>
          </div>

          {/* Quick Playback Shortcuts */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={prevStep}
              className="p-2 rounded-xl bg-[#151C2E] hover:bg-[#1E2738] text-white border border-[var(--border)] cursor-pointer"
              title="Previous Event (Left Arrow)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (state.isDemoRunning) pauseFullDemo();
                else resumeFullDemo();
              }}
              className="px-4 py-2 rounded-xl bg-[#2EE6A6] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 cursor-pointer shadow-md shadow-[#2EE6A6]/20"
              title="Play / Pause (Space)"
            >
              {state.isDemoRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause (Space)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume (Space)</span>
                </>
              )}
            </button>

            <button
              onClick={nextStep}
              className="p-2 rounded-xl bg-[#151C2E] hover:bg-[#1E2738] text-white border border-[var(--border)] cursor-pointer"
              title="Next Event (Right Arrow)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                resetDemo();
                startFullDemo();
              }}
              className="p-2 rounded-xl bg-[#151C2E] hover:bg-[#1E2738] text-[#8A94A9] hover:text-white border border-[var(--border)] cursor-pointer"
              title="Replay from Step 1 (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Exhibition Disclaimer */}
        <div className="text-center text-[10px] text-[#8A94A9] font-mono-data">
          ALL CAMERAS, DISPATCHES, HOSPITALS AND TRAFFIC CONTROLLERS ARE SIMULATED FOR ACADEMIC B.TECH DEMONSTRATION. NO REAL EMERGENCY SERVICES WERE CONTACTED.
        </div>
      </footer>
    </div>
  );
};
