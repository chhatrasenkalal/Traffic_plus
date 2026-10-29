// StageInfoPanel: Collapsible Technical Proof & Edge AI Diagnostics Panel
import React from 'react';
import { Cpu, Database, Eye, Lock, ShieldCheck, Zap } from 'lucide-react';
import { useScenario } from '../../scenarios/ScenarioContext';

export const StageInfoPanel: React.FC = () => {
  const { state } = useScenario();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-data">
      {/* Box 1: Edge Vision & Hardware */}
      <div className="p-4 rounded-xl bg-[#151C2E] border border-[var(--border)] space-y-2">
        <div className="flex items-center space-x-2 text-[#2EE6A6] font-bold">
          <Cpu className="w-4 h-4" />
          <span>Edge Model: YOLO-Traffic v8</span>
        </div>
        <div className="space-y-1 text-[#8A94A9] text-[11px]">
          <div className="flex justify-between">
            <span>Inference Latency:</span>
            <span className="text-white font-bold">14.2 ms (TensorRT)</span>
          </div>
          <div className="flex justify-between">
            <span>Input Resolution:</span>
            <span className="text-white font-bold">1080p @ 60 FPS</span>
          </div>
          <div className="flex justify-between">
            <span>Model Confidence:</span>
            <span className="text-[#2EE6A6] font-bold">{state.cameraConfidence}%</span>
          </div>
          <div className="flex justify-between">
            <span>Edge Hardware:</span>
            <span className="text-white font-bold">NVIDIA Jetson AGX Orin</span>
          </div>
        </div>
      </div>

      {/* Box 2: Multi-Modal Sensor Fusion */}
      <div className="p-4 rounded-xl bg-[#151C2E] border border-[var(--border)] space-y-2">
        <div className="flex items-center space-x-2 text-[#4F8CFF] font-bold">
          <Database className="w-4 h-4" />
          <span>Multi-Modal Fusion Pipeline</span>
        </div>
        <div className="space-y-1 text-[#8A94A9] text-[11px]">
          <div className="flex justify-between">
            <span>Loop Telemetry:</span>
            <span className={state.sensorOutageSimulated ? 'text-[#FF5C6C]' : 'text-white font-bold'}>
              {state.sensorOutageSimulated ? 'Outage Fallback' : `${state.sensorOccupancyRate}% Occupancy`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Verification Status:</span>
            <span className="text-white font-bold">{state.verificationStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Cross-Check:</span>
            <span className="text-white font-bold">Radar + 2 Citizen Reports</span>
          </div>
          <div className="flex justify-between">
            <span>Safety Invariant 1:</span>
            <span className="text-[#2EE6A6] font-bold">Enforced (Dual-Witness)</span>
          </div>
        </div>
      </div>

      {/* Box 3: Formal Interlock & Safety Invariants */}
      <div className="p-4 rounded-xl bg-[#151C2E] border border-[var(--border)] space-y-2">
        <div className="flex items-center space-x-2 text-[#FFB547] font-bold">
          <Lock className="w-4 h-4" />
          <span>Signal Conflict Interlock</span>
        </div>
        <div className="space-y-1 text-[#8A94A9] text-[11px]">
          <div className="flex justify-between">
            <span>Phase A / Phase B:</span>
            <span className="text-white font-bold">{state.signalPlan.phaseA.toUpperCase()} / {state.signalPlan.phaseB.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Conflicting Greens:</span>
            <span className="text-[#2EE6A6] font-bold">0 (Mathematically Impossible)</span>
          </div>
          <div className="flex justify-between">
            <span>Clearance Prereq:</span>
            <span className="text-white font-bold">{state.clearanceStep}/6 Steps</span>
          </div>
          <div className="flex justify-between">
            <span>Safety Invariant 4:</span>
            <span className="text-[#2EE6A6] font-bold">Active Interlock</span>
          </div>
        </div>
      </div>
    </div>
  );
};
