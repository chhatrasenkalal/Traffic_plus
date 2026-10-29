import React from 'react';
import { SystemMode } from '../types';

interface ModeBadgeProps {
  mode?: SystemMode;
  size?: 'sm' | 'md';
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode = 'SIMULATED', size = 'sm' }) => {
  const isSimulated = mode === 'SIMULATED';
  const isHybrid = mode === 'HYBRID';
  const isLive = mode === 'LIVE';

  return (
    <span
      className={`inline-flex items-center font-mono-data font-semibold uppercase tracking-wider rounded border ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${
        isSimulated
          ? 'bg-[#151C2E] text-[#8A94A9] border-[var(--border)]'
          : isHybrid
          ? 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/40'
          : 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/40'
      }`}
      title="Data mode indicator: All operational metrics in Phase 1 are procedural digital twin simulations"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isSimulated ? 'bg-[#8A94A9]' : isHybrid ? 'bg-[#FFB547]' : 'bg-[#2EE6A6]'
        }`}
      />
      <span>{mode}</span>
    </span>
  );
};
