import React, { useState, useRef, useEffect } from 'react';
import { Database, Info, ShieldCheck, X } from 'lucide-react';
import { SystemMode } from '../types';
import { ModeBadge } from './ModeBadge';

export interface ProvenanceData {
  deviceIds?: string[];
  confidence?: number;
  updatedAgoSeconds?: number;
  mode?: SystemMode;
  notes?: string;
  isUnavailable?: boolean;
}

interface ProvenancePopoverProps {
  data?: ProvenanceData;
  label?: string;
}

export const ProvenancePopover: React.FC<ProvenancePopoverProps> = ({
  data = {
    deviceIds: ['CAM-JCT-001', 'SEN-JCT-001-L1'],
    confidence: 94,
    updatedAgoSeconds: 1,
    mode: 'SIMULATED',
  },
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (data.isUnavailable) {
    return (
      <span className="inline-flex items-center text-[10px] font-mono-data text-[#FF5C6C] bg-[#FF5C6C]/10 px-1.5 py-0.5 rounded border border-[#FF5C6C]/20">
        DATA UNAVAILABLE
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#8A94A9] hover:text-[#4F8CFF] transition-colors p-0.5 rounded hover:bg-[#151C2E] cursor-pointer inline-flex items-center"
        aria-label="View data provenance and telemetry source"
        title="Data Provenance"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-6 z-50 w-64 glass-panel-elevated p-3.5 rounded-xl border border-[var(--border-light)] shadow-2xl text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center space-x-1.5 text-white font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2EE6A6]" />
              <span>Data Provenance</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8A94A9] hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {label && (
            <div className="text-[11px] text-[#8A94A9]">
              Metric: <strong className="text-white">{label}</strong>
            </div>
          )}

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#8A94A9]">Telemetry Mode:</span>
              <ModeBadge mode={data.mode || 'SIMULATED'} size="sm" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8A94A9]">Confidence Score:</span>
              <span className="font-mono-data font-bold text-[#2EE6A6]">
                {data.confidence ?? 92}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8A94A9]">Freshness:</span>
              <span className="font-mono-data text-[#E8ECF5]">
                Updated {data.updatedAgoSeconds ?? 1}s ago
              </span>
            </div>

            <div>
              <span className="text-[#8A94A9] block mb-1">Source Devices:</span>
              <div className="flex flex-wrap gap-1">
                {(data.deviceIds || ['SIMULATION_MODEL']).map((dev, i) => (
                  <span
                    key={i}
                    className="font-mono-data text-[10px] bg-[#07090F] px-1.5 py-0.5 rounded border border-[var(--border)] text-[#E8ECF5]"
                  >
                    {dev}
                  </span>
                ))}
              </div>
            </div>

            {data.notes && (
              <p className="text-[10px] text-[#8A94A9] pt-1 border-t border-[var(--border)] italic">
                {data.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
