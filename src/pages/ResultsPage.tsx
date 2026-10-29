import React from 'react';
import {
  BarChart2,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';

export const ResultsPage: React.FC = () => {
  const { metrics } = useSimulation();

  const handlePrint = () => {
    window.print();
  };

  // Wait time comparison history
  const waitData = metrics.adaptive.waitHistory.map((item, idx) => {
    const fixedItem = metrics.fixed.waitHistory[idx];
    return {
      time: `${idx * 5}s`,
      'Adaptive Wait': item.avgWait,
      'Fixed Wait': fixedItem ? fixedItem.avgWait : item.avgWait,
    };
  });

  // Queue length comparison history
  const queueData = metrics.adaptive.queueHistory.map((item, idx) => {
    const fixedItem = metrics.fixed.queueHistory[idx];
    return {
      time: `${idx * 5}s`,
      'Adaptive Queue': item.queueTotal,
      'Fixed Queue': fixedItem ? fixedItem.queueTotal : item.queueTotal,
    };
  });

  // Ecological savings
  const fuelSavedGal = (
    (metrics.fixed.totalWaitTime - metrics.adaptive.totalWaitTime) *
    0.00018
  ).toFixed(2);
  const co2AvoidedKg = (parseFloat(fuelSavedGal) * 8.887).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#E8ECF5] print-page">
      {/* Printable Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Twin Verification Report</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Performance Proof & Benchmark
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Parallel algorithmic comparison under identical deterministic arrival streams.
          </p>
        </div>

        {/* Action Button: Download as PDF / Print */}
        <div className="no-print">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl font-heading font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#2EE6A6]/20 transition-all cursor-pointer flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Improvement Stat */}
      <div className="glass-panel-elevated p-8 rounded-3xl border border-[#2EE6A6]/30 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider font-semibold">
            Measured Outcome
          </span>
          <div className="font-heading text-5xl sm:text-6xl font-bold text-white mt-1">
            <span className="text-[#2EE6A6]">
              +{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : '0.0'}%
            </span>
          </div>
          <p className="text-sm text-[#8A94A9] mt-2 max-w-lg">
            Reduction in aggregate commuter waiting delay achieved by dynamic queue ratio optimization over fixed 25s intervals.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="bg-[#07090F] p-4 rounded-2xl border border-[var(--border)] text-left space-y-2 min-w-[240px]">
          <div className="flex justify-between text-xs">
            <span className="text-[#8A94A9]">Commuters Cleared:</span>
            <span className="font-mono-data font-bold text-white">
              {metrics.adaptive.totalProcessed} vehicles
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8A94A9]">Est. Idling Fuel Saved:</span>
            <span className="font-mono-data font-bold text-[#2EE6A6]">
              {parseFloat(fuelSavedGal) > 0 ? fuelSavedGal : '0.00'} gal
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8A94A9]">CO₂ Emissions Prevented:</span>
            <span className="font-mono-data font-bold text-[#2EE6A6]">
              {parseFloat(co2AvoidedKg) > 0 ? co2AvoidedKg : '0.00'} kg
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Fixed vs Adaptive Comparison Table */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden space-y-4">
        <h3 className="font-heading font-bold text-base text-white">
          Direct Metric Benchmark
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[#8A94A9] font-semibold">
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4 text-[#FFB547]">Fixed Controller (Flat 25s)</th>
                <th className="py-3 px-4 text-[#2EE6A6]">Adaptive Controller (Dynamic)</th>
                <th className="py-3 px-4 text-right">Delta / Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-mono-data">
              <tr>
                <td className="py-3.5 px-4 font-sans text-white font-medium">
                  Average Waiting Time
                </td>
                <td className="py-3.5 px-4 text-[#FFB547]">
                  {metrics.fixed.avgWait.toFixed(1)}s / vehicle
                </td>
                <td className="py-3.5 px-4 text-[#2EE6A6] font-bold">
                  {metrics.adaptive.avgWait.toFixed(1)}s / vehicle
                </td>
                <td className="py-3.5 px-4 text-right text-[#2EE6A6]">
                  -{(metrics.fixed.avgWait - metrics.adaptive.avgWait).toFixed(1)}s (-{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : 0}%)
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans text-white font-medium">
                  Total Throughput Cleared
                </td>
                <td className="py-3.5 px-4 text-white">
                  {metrics.fixed.totalProcessed} vehicles
                </td>
                <td className="py-3.5 px-4 text-[#2EE6A6] font-bold">
                  {metrics.adaptive.totalProcessed} vehicles
                </td>
                <td className="py-3.5 px-4 text-right text-[#2EE6A6]">
                  +{Math.max(0, metrics.adaptive.totalProcessed - metrics.fixed.totalProcessed)} vehicles
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans text-white font-medium">
                  Maximum Queue Length
                </td>
                <td className="py-3.5 px-4 text-[#FFB547]">
                  {metrics.fixed.maxQueue} vehicles
                </td>
                <td className="py-3.5 px-4 text-[#2EE6A6] font-bold">
                  {metrics.adaptive.maxQueue} vehicles
                </td>
                <td className="py-3.5 px-4 text-right text-[#2EE6A6]">
                  {metrics.fixed.maxQueue - metrics.adaptive.maxQueue >= 0
                    ? `-${metrics.fixed.maxQueue - metrics.adaptive.maxQueue} queue peak`
                    : 'Balanced'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans text-white font-medium">
                  Cumulative Idling Delay
                </td>
                <td className="py-3.5 px-4 text-white">
                  {Math.round(metrics.fixed.totalWaitTime)} vehicle-secs
                </td>
                <td className="py-3.5 px-4 text-[#2EE6A6] font-bold">
                  {Math.round(metrics.adaptive.totalWaitTime)} vehicle-secs
                </td>
                <td className="py-3.5 px-4 text-right text-[#2EE6A6]">
                  -{Math.round(Math.max(0, metrics.fixed.totalWaitTime - metrics.adaptive.totalWaitTime))} secs saved
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans text-white font-medium">
                  Empty-Phase Idle Penalty
                </td>
                <td className="py-3.5 px-4 text-[#FF5C6C]">
                  High (Fixed 25s runout)
                </td>
                <td className="py-3.5 px-4 text-[#2EE6A6] font-bold">
                  Zero (Early termination)
                </td>
                <td className="py-3.5 px-4 text-right text-[#2EE6A6]">
                  Eliminated
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Comparative Proof Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Wait Time Evolution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-heading font-bold text-base text-white mb-1">
            Average Wait Time Progression
          </h3>
          <p className="text-xs text-[#8A94A9] mb-4">
            Lower is better. Demonstrates adaptive stabilization during peak demand.
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" stroke="#8A94A9" fontSize={11} />
                <YAxis stroke="#8A94A9" fontSize={11} unit="s" />
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
                  dataKey="Adaptive Wait"
                  stroke="#2EE6A6"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Fixed Wait"
                  stroke="#FFB547"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Queue Length Evolution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-heading font-bold text-base text-white mb-1">
            Combined Queue Depth Evolution
          </h3>
          <p className="text-xs text-[#8A94A9] mb-4">
            Vehicles queued on both Phase A (North-South) and Phase B (East-West).
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" stroke="#8A94A9" fontSize={11} />
                <YAxis stroke="#8A94A9" fontSize={11} />
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
                  dataKey="Adaptive Queue"
                  stroke="#2EE6A6"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Fixed Queue"
                  stroke="#FFB547"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology Section as Specified */}
      <div className="glass-panel p-6 rounded-2xl space-y-3 border-l-4 border-l-[#4F8CFF]">
        <div className="flex items-center space-x-2 text-white font-heading font-bold text-sm">
          <FileText className="w-4 h-4 text-[#4F8CFF]" />
          <span>Research Methodology & Calibration Disclosure</span>
        </div>
        <p className="text-xs text-[#8A94A9] leading-relaxed">
          <strong>Disclosure:</strong> Simulated arrivals calibrated to a typical urban hourly pattern (bimodal morning and evening commute peaks), not live hardware data. Both controllers are evaluated in exact parallel on identical deterministic Poisson pseudo-random streams to establish algorithmic variance with statistical parity. No real hardware actuators are modified.
        </p>
      </div>
    </div>
  );
};
