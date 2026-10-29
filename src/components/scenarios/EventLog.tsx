// EventLog: Chronological Audit Trail of Scenario Simulation Events
import React from 'react';
import { Clock, FileCheck, Layers, ShieldCheck } from 'lucide-react';
import { useScenario } from '../../scenarios/ScenarioContext';

export const EventLog: React.FC = () => {
  const { state } = useScenario();

  return (
    <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] bg-[#0C101A] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-[#2EE6A6]" />
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
            Deterministic Incident Audit Trail
          </h3>
        </div>
        <span className="text-[10px] font-mono-data text-[#8A94A9]">
          Total Events: {state.eventLogs.length} • SHA-256 Provenance Log
        </span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {state.eventLogs.slice().reverse().map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-xl bg-[#151C2E] border border-[var(--border)] text-xs space-y-1 hover:border-[#2EE6A6]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono-data text-[10px] px-1.5 py-0.5 rounded bg-[#2EE6A6]/20 text-[#2EE6A6] font-bold">
                  {entry.timestamp}
                </span>
                <span className="font-bold text-white font-heading">{entry.action}</span>
              </div>
              <span className="text-[10px] font-mono-data text-[#8A94A9] uppercase">
                {entry.actor}
              </span>
            </div>

            <p className="text-[11px] text-[#8A94A9] leading-relaxed">
              {entry.details}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/40 text-[9px] font-mono-data text-[#4F8CFF]">
              <span>Stage: {entry.stage}</span>
              <span className="text-[#8A94A9]">Verified Simulated Event</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
