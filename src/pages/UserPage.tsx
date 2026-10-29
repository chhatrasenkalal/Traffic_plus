import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CloudRain,
  Compass,
  FileCheck,
  Flame,
  Info,
  MapPin,
  Navigation,
  Send,
  ShieldAlert,
  Wind,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const UserPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { metrics, weather, activeIncidents, junctions, addReport } = useSimulation();

  const [quickReportType, setQuickReportType] = useState<'crash' | 'blockage' | 'flood' | 'hazard'>('hazard');
  const [quickDesc, setQuickDesc] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const handleQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDesc.trim()) return;

    addReport({
      type: quickReportType,
      direction: 'Northbound',
      description: quickDesc.trim(),
      severity: 'Medium',
      junctionId: 'J1_CENTRAL',
    });

    setReportSent(true);
    setQuickDesc('');
    setTimeout(() => setReportSent(false), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Driver Companion & Live Corridor Advisory</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Metropolitan Commuter Portal
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Real-time arterial delays, road blockage advisories, weather hazards, and recommended detour routes.
          </p>
        </div>

        <button
          onClick={() => navigate('#/report')}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89] shadow-lg shadow-[#2EE6A6]/20 transition-all cursor-pointer flex items-center space-x-2"
        >
          <FileCheck className="w-4 h-4" />
          <span>Detailed Report Form</span>
        </button>
      </div>

      {/* Weather Hazard Advisory Card */}
      <div className="glass-panel-elevated p-5 rounded-2xl border border-[var(--border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-[#4F8CFF]/20 text-[#4F8CFF]">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono-data text-[#8A94A9] uppercase">Active Atmospheric Condition</span>
            <h3 className="font-heading font-bold text-lg text-white">
              {weather.label}
            </h3>
            <p className="text-xs text-[#8A94A9]">
              Visibility: {weather.visibilityKm} km • Road surface friction: {Math.round(weather.frictionCoefficient * 100)}%
            </p>
          </div>
        </div>

        <div className="bg-[#07090F] px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-right">
          <span className="text-[#8A94A9]">Commuter Advisory:</span>
          <div className="font-mono-data font-bold text-[#FFB547]">
            {weather.frictionCoefficient < 0.8 ? 'Maintain 4x Safe Following Distance' : 'Normal Driving Conditions'}
          </div>
        </div>
      </div>

      {/* Grid: Corridor Speeds & Active Blockages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4 Arterial Corridors Live Congestion (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
            <Car className="w-5 h-5 text-[#4F8CFF]" />
            <span>Arterial Corridor Speeds & Flow</span>
          </h3>

          <div className="space-y-3">
            {junctions.map((junc) => {
              const hasIncident = activeIncidents.some((inc) => inc.junctionId === junc.id);
              const congestion = junc.congestionLevel;
              const isHeavy = congestion > 60 || hasIncident;

              return (
                <div
                  key={junc.id}
                  className="glass-panel p-4 rounded-xl border border-[var(--border)] text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-heading font-bold text-sm text-white">
                        {junc.name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${
                        hasIncident
                          ? 'bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/30'
                          : isHeavy
                          ? 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/30'
                          : 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30'
                      }`}
                    >
                      {hasIncident ? 'INCIDENT ON SCENE' : isHeavy ? 'HEAVY CONGESTION' : 'NORMAL FLOW'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#8A94A9]">
                    <span>Current Signal Phase: <strong className="text-white font-mono-data">{junc.activePhase === 'phaseA' ? 'North-South' : 'East-West'}</strong></span>
                    <span>Density Index: <strong className="text-white font-mono-data">{congestion}%</strong></span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[#07090F] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        hasIncident ? 'bg-[#FF5C6C]' : isHeavy ? 'bg-[#FFB547]' : 'bg-[#2EE6A6]'
                      }`}
                      style={{ width: `${Math.min(100, congestion)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Detour Routes */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3">
            <h4 className="font-heading font-bold text-sm text-white flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-[#2EE6A6]" />
              <span>Recommended Alternative Detours</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#07090F] border border-[var(--border)] flex justify-between items-center">
                <div>
                  <strong className="text-white block">Avoid J1 Central Crossing</strong>
                  <span className="text-[#8A94A9]">Divert via J3 West Commercial Boulevard &rarr; Outer Ring</span>
                </div>
                <span className="text-[#2EE6A6] font-mono-data font-bold text-xs">-4.2 mins</span>
              </div>
              <div className="p-3 rounded-xl bg-[#07090F] border border-[var(--border)] flex justify-between items-center">
                <div>
                  <strong className="text-white block">East Concourse Bypass</strong>
                  <span className="text-[#8A94A9]">Use J4 East connector towards North Terminal</span>
                </div>
                <span className="text-[#2EE6A6] font-mono-data font-bold text-xs">-2.8 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Citizen Field Report Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-[#2EE6A6]" />
            <span>Fast Citizen Field Report</span>
          </h3>

          <div className="glass-panel-elevated p-6 rounded-2xl border border-[var(--border-light)] space-y-4">
            <p className="text-xs text-[#8A94A9]">
              Notice an unlisted obstacle, stalled car, or flood puddle? Send instant telemetry to the operator fusion engine.
            </p>

            <form onSubmit={handleQuickReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                  Obstacle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['crash', 'blockage', 'flood', 'hazard'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQuickReportType(t)}
                      className={`p-2 rounded-xl border text-center uppercase font-mono-data text-[10px] font-bold cursor-pointer transition-colors ${
                        quickReportType === t
                          ? 'bg-[#2EE6A6] text-[#07090F] border-[#2EE6A6]'
                          : 'bg-[#07090F] border-[var(--border)] text-[#8A94A9] hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                  Brief Location Note
                </label>
                <textarea
                  rows={3}
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="e.g. Left turn lane obstructed near J1 Central crosswalk..."
                  className="w-full bg-[#07090F] border border-[var(--border)] focus:border-[#2EE6A6] rounded-xl p-3 text-xs text-white placeholder-[#8A94A9]/50 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89] cursor-pointer transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Field Alert</span>
              </button>
            </form>

            {reportSent && (
              <div className="p-3 rounded-xl bg-[#2EE6A6]/20 border border-[#2EE6A6] text-xs text-[#2EE6A6]">
                Report sent and verified in multi-modal pipeline!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
