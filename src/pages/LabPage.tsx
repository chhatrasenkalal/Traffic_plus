import React from 'react';
import {
  AlertCircle,
  Clock,
  FastForward,
  Flame,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { ControllerState, PhaseId } from '../types';
import { HOURLY_INTENSITY } from '../lib/simulator';

// 2D Top-Down Intersection Schematic Component
const IntersectionSchematic: React.FC<{
  title: string;
  controller: ControllerState;
  colorTheme: 'adaptive' | 'fixed';
}> = ({ title, controller, colorTheme }) => {
  const isAdaptive = colorTheme === 'adaptive';
  const sigA = controller.signalA;
  const sigB = controller.signalB;

  const getSignalColor = (state: 'red' | 'yellow' | 'green') => {
    if (state === 'green') return '#2EE6A6';
    if (state === 'yellow') return '#FFB547';
    return '#FF5C6C';
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAdaptive ? 'bg-[#2EE6A6]' : 'bg-[#FFB547]'
            }`}
          />
          <h3 className="font-heading font-bold text-base text-white">{title}</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono-data">
          <span className="text-[#8A94A9]">Phase:</span>
          <span
            className={`px-2 py-0.5 rounded font-semibold ${
              controller.currentPhase === 'phaseA'
                ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]'
                : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
            }`}
          >
            {controller.currentPhase === 'phaseA' ? 'A (N-S)' : 'B (E-W)'}
          </span>
        </div>
      </div>

      {/* SVG 2D Canvas */}
      <div className="relative w-full max-w-[320px] aspect-square bg-[var(--background)] rounded-xl border border-[var(--border)] p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background asphalt roads */}
          {/* North-South road */}
          <rect x="75" y="0" width="50" height="200" fill="currentColor" className="text-slate-800 dark:text-[#111622]" />
          {/* East-West road */}
          <rect x="0" y="75" width="200" height="50" fill="currentColor" className="text-slate-800 dark:text-[#111622]" />
          {/* Intersection box */}
          <rect x="75" y="75" width="50" height="50" fill="currentColor" className="text-slate-700 dark:text-[#151C2E]" />

          {/* Lane divider dashed lines */}
          <line
            x1="100"
            y1="0"
            x2="100"
            y2="70"
            stroke="#FFB547"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="100"
            y1="130"
            x2="100"
            y2="200"
            stroke="#FFB547"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="100"
            x2="70"
            y2="100"
            stroke="#FFB547"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="130"
            y1="100"
            x2="200"
            y2="100"
            stroke="#FFB547"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Stop lines */}
          {/* North stop line */}
          <line x1="75" y1="72" x2="100" y2="72" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* South stop line */}
          <line x1="100" y1="128" x2="125" y2="128" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* West stop line */}
          <line x1="72" y1="100" x2="72" y2="125" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* East stop line */}
          <line x1="128" y1="75" x2="128" y2="100" stroke="#FFFFFF" strokeWidth="2.5" />

          {/* Traffic Signals: Placed on corner curbs so they never overlap queued vehicles */}
          {/* North-South Phase A Signals */}
          <g>
            <rect x="58" y="56" width="14" height="14" rx="3" fill="#07090F" stroke="#222A3A" strokeWidth="1" />
            <circle cx="65" cy="63" r="4.5" fill={getSignalColor(sigA)} filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))" />
            <text x="65" y="52" fill="#8A94A9" fontSize="7" textAnchor="middle" fontFamily="monospace">NS</text>
          </g>
          <g>
            <rect x="128" y="130" width="14" height="14" rx="3" fill="#07090F" stroke="#222A3A" strokeWidth="1" />
            <circle cx="135" cy="137" r="4.5" fill={getSignalColor(sigA)} filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))" />
            <text x="135" y="152" fill="#8A94A9" fontSize="7" textAnchor="middle" fontFamily="monospace">NS</text>
          </g>

          {/* East-West Phase B Signals */}
          <g>
            <rect x="58" y="130" width="14" height="14" rx="3" fill="#07090F" stroke="#222A3A" strokeWidth="1" />
            <circle cx="65" cy="137" r="4.5" fill={getSignalColor(sigB)} filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))" />
            <text x="50" y="140" fill="#8A94A9" fontSize="7" textAnchor="middle" fontFamily="monospace">EW</text>
          </g>
          <g>
            <rect x="128" y="56" width="14" height="14" rx="3" fill="#07090F" stroke="#222A3A" strokeWidth="1" />
            <circle cx="135" cy="63" r="4.5" fill={getSignalColor(sigB)} filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))" />
            <text x="150" y="66" fill="#8A94A9" fontSize="7" textAnchor="middle" fontFamily="monospace">EW</text>
          </g>

          {/* Queued Cars: Phase A (North-South) */}
          {controller.queueA.slice(0, 10).map((v, i) => {
            const isSouth = v.direction === 'south';
            // Southbound queue lines up behind y=70 (y going up to 0)
            // Northbound queue lines up behind y=130 (y going down to 200)
            const cx = isSouth ? 87 : 113;
            const cy = isSouth ? 60 - i * 11 : 140 + i * 11;
            return (
              <rect
                key={v.id}
                x={cx - 4}
                y={cy - 4}
                width="8"
                height="9"
                rx="2"
                fill={v.color}
                stroke="#000"
                strokeWidth="1"
              />
            );
          })}

          {/* Queued Cars: Phase B (East-West) */}
          {controller.queueB.slice(0, 10).map((v, i) => {
            const isEast = v.direction === 'east';
            // Eastbound queue lines up behind x=70
            // Westbound queue lines up behind x=130
            const cx = isEast ? 60 - i * 11 : 140 + i * 11;
            const cy = isEast ? 113 : 87;
            return (
              <rect
                key={v.id}
                x={cx - 4}
                y={cy - 4}
                width="9"
                height="8"
                rx="2"
                fill={v.color}
                stroke="#000"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Floating Queue Stats Badge */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between bg-[var(--surface)]/95 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[11px] font-mono-data shadow-md">
          <span className="text-[var(--muted)]">
            N-S Queue: <strong className="text-[var(--text)]">{controller.queueA.length}</strong>
          </span>
          <span className="text-[var(--muted)]">
            E-W Queue: <strong className="text-[var(--text)]">{controller.queueB.length}</strong>
          </span>
        </div>
      </div>

      {/* Snapshot metrics below schematic */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
          <div className="text-[10px] text-[var(--muted)]">Avg Wait</div>
          <div
            className={`font-mono-data text-sm font-bold mt-0.5 ${
              isAdaptive ? 'text-[#2EE6A6]' : 'text-[#FFB547]'
            }`}
          >
            {controller.avgWait.toFixed(1)}s
          </div>
        </div>
        <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
          <div className="text-[10px] text-[var(--muted)]">Cleared</div>
          <div className="font-mono-data text-sm font-bold text-[var(--text)] mt-0.5">
            {controller.totalProcessed}
          </div>
        </div>
        <div className="bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)]">
          <div className="text-[10px] text-[var(--muted)]">Max Queue</div>
          <div className="font-mono-data text-sm font-bold text-[var(--text)] mt-0.5">
            {controller.maxQueue}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LabPage: React.FC = () => {
  const {
    metrics,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    resetSimulation,
    setRushMultiplier,
    injectIncident,
    theme,
    setTheme,
    toggleTheme,
    dayNightRatio,
    setDayNightRatio,
  } = useSimulation();

  // Combine throughput history for Recharts
  const throughputData = metrics.adaptive.throughputHistory.map((item, idx) => {
    const fixedItem = metrics.fixed.throughputHistory[idx];
    return {
      time: `${idx * 5}s`,
      Adaptive: item.throughput,
      Fixed: fixedItem ? fixedItem.throughput : item.throughput,
    };
  });

  // Prepare 24-hour curve data
  const hourlyData = HOURLY_INTENSITY.map((val, hour) => ({
    hour: `${hour}:00`,
    hourNum: hour,
    intensity: Math.round(val * metrics.rushMultiplier),
    isNow: hour === metrics.hourOfDay,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Parallel Benchmark Lab</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Simulation Control & Analysis
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Observe identical Poisson traffic streams processed simultaneously by Fixed 25s vs Adaptive queue logic.
          </p>
        </div>

        {/* Live Improvement Badge */}
        <div className="flex items-center space-x-3 bg-[#151C2E] px-4 py-2.5 rounded-2xl border border-[var(--border-light)] shadow-sm">
          <TrendingUp className="w-5 h-5 text-[#2EE6A6]" />
          <div>
            <div className="text-[11px] text-[#8A94A9]">Adaptive Advantage</div>
            <div className="font-mono-data font-bold text-lg text-[#2EE6A6]">
              +{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : '0.0'}% Less Delay
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel Bar */}
      <div className="glass-panel-elevated p-5 rounded-2xl border border-[var(--border-light)] flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause/Reset & Speed */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)]'
                : 'bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Sim' : 'Resume Sim'}</span>
          </button>

          <button
            onClick={resetSimulation}
            className="p-2.5 rounded-xl bg-[#0E1320] text-[#8A94A9] hover:text-white border border-[var(--border)] hover:bg-[#151C2E] transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Pills */}
          <div className="flex items-center bg-[#07090F] p-1 rounded-xl border border-[var(--border)]">
            {([1, 5, 20] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 text-xs font-mono-data font-semibold rounded-lg transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-[#4F8CFF] text-white'
                    : 'text-[#8A94A9] hover:text-[#E8ECF5]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Rush-Hour Intensity Multiplier */}
        <div className="flex items-center space-x-3 bg-[#07090F]/70 px-4 py-2 rounded-xl border border-[var(--border)]">
          <Sliders className="w-4 h-4 text-[#FFB547]" />
          <span className="text-xs text-[#8A94A9]">Rush Multiplier:</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={metrics.rushMultiplier}
            onChange={(e) => setRushMultiplier(parseFloat(e.target.value))}
            className="w-24 accent-[#2EE6A6] cursor-pointer h-1.5 bg-[#151C2E] rounded-lg"
          />
          <span className="font-mono-data text-xs font-bold text-white w-8 text-right">
            {metrics.rushMultiplier.toFixed(1)}x
          </span>
        </div>

        {/* Day/Night Simulation Mode in Lab */}
        <div className="flex items-center space-x-2 bg-[var(--surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => {
              setDayNightRatio(0.15);
              setTheme('light');
            }}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              dayNightRatio <= 0.5 ? 'bg-[#FFB547]/20 text-[#FFB547]' : 'text-[var(--muted)] hover:text-[#FFB547]'
            }`}
            title="Day Simulation (0.15)"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Day</span>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={dayNightRatio}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setDayNightRatio(val);
              if (val <= 0.5 && theme !== 'light') setTheme('light');
              if (val > 0.5 && theme !== 'dark') setTheme('dark');
            }}
            className="w-16 accent-[#2EE6A6] cursor-pointer h-1.5 bg-[var(--elevated)] rounded-lg"
            aria-label="Simulation Lighting / Day-Night"
          />
          <button
            onClick={() => {
              setDayNightRatio(0.85);
              setTheme('dark');
            }}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              dayNightRatio > 0.5 ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]' : 'text-[var(--muted)] hover:text-[#4F8CFF]'
            }`}
            title="Night Simulation (0.85)"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Night</span>
          </button>
        </div>

        {/* Inject Incident Surge */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => injectIncident('phaseA', 30)}
            disabled={!!metrics.activeIncident}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              metrics.activeIncident
                ? 'bg-[#FF5C6C]/20 text-[#FF5C6C] border border-[#FF5C6C]/40 animate-pulse'
                : 'bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#FF5C6C]" />
            <span>
              {metrics.activeIncident
                ? `Incident Active (${metrics.activeIncident.secondsRemaining}s)`
                : 'Inject Incident (30s)'}
            </span>
          </button>
        </div>
      </div>

      {/* Side-by-Side 2D Top-Down Schematics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntersectionSchematic
          title="Fixed Timer (Flat 25s Cycle)"
          controller={metrics.fixed}
          colorTheme="fixed"
        />
        <IntersectionSchematic
          title="Adaptive Controller (Dynamic Queue Ratio)"
          controller={metrics.adaptive}
          colorTheme="adaptive"
        />
      </div>

      {/* Live Comparison Bars: Average Wait */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-heading font-bold text-base text-white mb-4">
          Direct Delay Benchmark (Average Wait Per Vehicle)
        </h3>
        <div className="space-y-4">
          {/* Fixed bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#FFB547] font-semibold">Fixed Controller (Flat 25s)</span>
              <span className="font-mono-data font-bold text-white">
                {metrics.fixed.avgWait.toFixed(1)} seconds
              </span>
            </div>
            <div className="w-full h-3 bg-[#07090F] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-[#FFB547] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (metrics.fixed.avgWait / 60) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Adaptive bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#2EE6A6] font-semibold">Adaptive Controller (Queue Dynamic)</span>
              <span className="font-mono-data font-bold text-[#2EE6A6]">
                {metrics.adaptive.avgWait.toFixed(1)} seconds (
                -{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : '0.0'}%)
              </span>
            </div>
            <div className="w-full h-3 bg-[#07090F] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-[#2EE6A6] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (metrics.adaptive.avgWait / 60) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput line chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-white">
              Throughput (Vehicles Cleared / Min)
            </h3>
            <span className="text-xs text-[#8A94A9]">Rolling 60s Window</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" stroke="#8A94A9" fontSize={11} />
                <YAxis stroke="#8A94A9" fontSize={11} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1320',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Adaptive"
                  stroke="#2EE6A6"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Fixed"
                  stroke="#FFB547"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Intensity Bar Chart with "NOW" Marker */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-white">
              24-Hour Metropolitan Intensity Profile
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono-data bg-[#2EE6A6]/20 text-[#2EE6A6] font-semibold">
              Now: {metrics.timeOfDayString}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" stroke="#8A94A9" fontSize={10} interval={2} />
                <YAxis stroke="#8A94A9" fontSize={11} domain={[0, 150]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1320',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isNow ? '#2EE6A6' : '#4F8CFF'}
                      opacity={entry.isNow ? 1 : 0.45}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
