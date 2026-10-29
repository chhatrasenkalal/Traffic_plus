// StatusPanels: Synchronized Simulation Panels for Multi-Agency Telemetry
import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  FileText,
  Hospital,
  Radio,
  Shield,
  ShieldCheck,
  Siren,
  Truck,
  Users,
} from 'lucide-react';
import { DEMO_IDS } from '../../scenarios/config';
import { useScenario } from '../../scenarios/ScenarioContext';

export const StatusPanels: React.FC = () => {
  const { state } = useScenario();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel 1: Live Incident & Traffic Telemetry */}
      <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] bg-[#0C101A] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#2EE6A6]" />
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Intersection Telemetry (Simulated)
            </h3>
          </div>
          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#2EE6A6]/20 text-[#2EE6A6] font-bold">
            LIVE METRICS
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
          <div className="p-2.5 rounded-xl bg-[#151C2E] border border-[var(--border)]">
            <span className="text-[#8A94A9] block text-[10px]">VEHICLE COUNT</span>
            <span className="text-lg font-bold text-white">{state.vehicleCount} veh</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#151C2E] border border-[var(--border)]">
            <span className="text-[#8A94A9] block text-[10px]">CONGESTION DENSITY</span>
            <span
              className={`text-lg font-bold ${
                state.trafficDensityPercent > 70
                  ? 'text-[#FF5C6C]'
                  : state.trafficDensityPercent > 45
                  ? 'text-[#FFB547]'
                  : 'text-[#2EE6A6]'
              }`}
            >
              {state.trafficDensityPercent}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#151C2E] border border-[var(--border)]">
            <span className="text-[#8A94A9] block text-[10px]">AVERAGE VELOCITY</span>
            <span className="text-lg font-bold text-white">{state.averageSpeedKmh} km/h</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#151C2E] border border-[var(--border)]">
            <span className="text-[#8A94A9] block text-[10px]">LANE 2 STATUS</span>
            <span
              className={`text-xs font-bold uppercase ${
                state.laneStatus === 'blocked'
                  ? 'text-[#FF5C6C]'
                  : state.laneStatus === 'clearance_in_progress'
                  ? 'text-[#FFB547]'
                  : state.laneStatus === 'inspection_pending'
                  ? 'text-[#38BDF8]'
                  : 'text-[#2EE6A6]'
              }`}
            >
              {state.laneStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* AI Multi-Modal Verification Evidence Box */}
        <div className="p-3 rounded-xl bg-[#080B14] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8A94A9] flex items-center space-x-1.5 font-bold">
              <Radio className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span>Multi-Modal AI Fusion Evidence</span>
            </span>
            <span
              className={`font-mono-data text-[10px] font-bold px-1.5 py-0.5 rounded ${
                state.verificationStatus === 'AI Confirmed'
                  ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]'
                  : state.verificationStatus.includes('Unverified')
                  ? 'bg-[#FFB547]/20 text-[#FFB547]'
                  : 'bg-[#151C2E] text-[#8A94A9]'
              }`}
            >
              {state.verificationStatus}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono-data text-[#8A94A9]">
            <div className="flex justify-between">
              <span>Edge Vision Confidence:</span>
              <span className="text-white font-bold">{state.cameraConfidence}% (Optical)</span>
            </div>
            <div className="flex justify-between">
              <span>Loop Sensor Telemetry:</span>
              <span className={state.sensorOutageSimulated ? 'text-[#FF5C6C] font-bold' : 'text-white font-bold'}>
                {state.sensorOutageSimulated ? 'OFFLINE (Outage Simulated)' : `${state.sensorOccupancyRate}% Occupancy Spike`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Secondary Collision Risk:</span>
              <span
                className={`font-bold ${
                  state.secondaryCollisionRisk === 'HIGH'
                    ? 'text-[#FF5C6C]'
                    : state.secondaryCollisionRisk === 'MEDIUM'
                    ? 'text-[#FFB547]'
                    : 'text-[#2EE6A6]'
                }`}
              >
                {state.secondaryCollisionRisk}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: Emergency Response & Hospital Dispatch CAD */}
      <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] bg-[#0C101A] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-2">
            <Siren className="w-4 h-4 text-[#4F8CFF]" />
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Emergency CAD & EMS Triage (Simulated)
            </h3>
          </div>
          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] font-bold">
            CAD DISPATCH
          </span>
        </div>

        {/* Police Status Card */}
        <div className="p-3 rounded-xl bg-[#151C2E] border border-[var(--border)] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Metro Police CAD: Cruiser-104</span>
            </span>
            <span
              className={`text-[10px] font-mono-data font-bold px-1.5 py-0.5 rounded ${
                state.policeDispatched
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                  : 'bg-[#0E1320] text-[#8A94A9]'
              }`}
            >
              {state.policeDispatched ? 'DISPATCHED' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[11px] text-[#8A94A9]">
            Assigned to establish 30-meter high-visibility safety perimeter around Northbound Lane 2.
          </p>
        </div>

        {/* Hospital Recommendation Card */}
        <div className="p-3 rounded-xl bg-[#151C2E] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Hospital className="w-3.5 h-3.5 text-[#FF5C6C]" />
              <span>Harbor Memorial Hospital</span>
            </span>
            <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-[#2EE6A6]/20 text-[#2EE6A6] font-bold">
              SCORE: 92/100
            </span>
          </div>

          <div className="text-[11px] font-mono-data text-[#8A94A9] space-y-1">
            <div className="flex justify-between">
              <span>Ambulance Assigned:</span>
              <span className="text-white font-bold">{state.ambulanceDispatched ? 'Medic-14 (En Route)' : 'Pending Dispatch'}</span>
            </div>
            <div className="flex justify-between">
              <span>Open ICU Beds:</span>
              <span className="text-[#2EE6A6] font-bold">8 Beds Available</span>
            </div>
            <div className="flex justify-between">
              <span>Travel Time (Green Corridor):</span>
              <span className="text-[#4F8CFF] font-bold">4.2 min (Reduced 40%)</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0E1320] text-[10px] text-[#8A94A9] leading-snug">
            <span className="text-[#2EE6A6] font-bold">Scoring Reason:</span> {state.hospitalRecommendationReason}
          </div>
        </div>

        {/* Medical Non-Graphic Disclaimer */}
        <div className="p-2.5 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/30 text-[11px] text-[#FFB547] flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>Status: {state.victimAssistanceStatus}</span>
        </div>
      </div>

      {/* Panel 3: Green Wave & Rapid Road Clearance Checklist */}
      <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] bg-[#0C101A] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#F97316]" />
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Road Clearance & Signals
            </h3>
          </div>
          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#F97316]/20 text-[#F97316] font-bold">
            INVARIANT 4 GATED
          </span>
        </div>

        {/* 6-Step Clearance Roadmap Checklist */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-[#8A94A9] uppercase font-mono-data mb-1">
            Ordered Clearance Lifecycle (Step {state.clearanceStep}/6):
          </div>

          {[
            { step: 1, label: 'Responders inspect accident zone' },
            { step: 2, label: 'Police establish safe working area' },
            { step: 3, label: 'Damaged vehicles towed to shoulder' },
            { step: 4, label: 'Mechanical debris removal completed' },
            { step: 5, label: 'Physical roadway inspected' },
            { step: 6, label: 'Clearance confirmation authorized' },
          ].map((item) => {
            const isDone = state.clearanceStep >= item.step;
            const isCurrent = state.clearanceStep === item.step;

            return (
              <div
                key={item.step}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono-data border transition-all ${
                  isCurrent
                    ? 'bg-[#151C2E] border-[#F97316] text-[#F97316] font-bold'
                    : isDone
                    ? 'bg-[#0E1524] border-[#2EE6A6]/40 text-[#2EE6A6]'
                    : 'bg-[#090D18] border-[var(--border)] text-[#8A94A9]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-4 text-center">{isDone ? '✓' : item.step}</span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] uppercase">
                  {isDone ? 'Completed' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Green Corridor Conflict Matrix */}
        <div className="p-3 rounded-xl bg-[#151C2E] border border-[var(--border)] space-y-1.5 text-xs font-mono-data">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2EE6A6]" />
              <span>Signal Conflict Safety Invariant</span>
            </span>
            <span className="text-[#2EE6A6] font-bold">VERIFIED SAFE</span>
          </div>
          <div className="text-[10px] text-[#8A94A9] leading-relaxed">
            Phase A North-South: <span className="text-white font-bold">{state.signalPlan.phaseA.toUpperCase()}</span> • Phase B East-West: <span className="text-white font-bold">{state.signalPlan.phaseB.toUpperCase()}</span>. Conflicting greens strictly prevented by software interlock.
          </div>
        </div>
      </div>
    </div>
  );
};
