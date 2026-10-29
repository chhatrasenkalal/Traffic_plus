import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Car,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  LineChart as LineChartIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { fetchAIInsights } from '../lib/insights';
import { AIInsightData } from '../types';

export const IntelligencePage: React.FC = () => {
  const { metrics, reports, updateReportStatus } = useSimulation();

  const [insights, setInsights] = useState<AIInsightData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);

  const loadInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await fetchAIInsights(metrics, reports);
      setInsights(data);
    } catch (err) {
      console.error('Error generating AI insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Generate initial insights once on load
  useEffect(() => {
    loadInsights();
  }, []);

  // Format forecast chart data
  const forecastData = metrics.forecastCongestion.map((fc) => ({
    time: `+${fc.minuteAhead}m`,
    ProjectedQueue: fc.projectedQueue,
    Confidence: fc.confidence,
  }));

  const densityBadgeColor =
    metrics.densityLabel === 'Heavy'
      ? 'bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/30'
      : metrics.densityLabel === 'Moderate'
      ? 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/30'
      : 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#4F8CFF] uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Autonomous Operator Console</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Operational Intelligence
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Real-time synthesized telemetrics, AI-grounded cycle diagnostics, and citizen incident dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#0E1320] px-4 py-2 rounded-xl border border-[var(--border)]">
          <Clock className="w-4 h-4 text-[#2EE6A6]" />
          <span className="text-xs text-[#8A94A9]">Metropolitan Clock:</span>
          <span className="font-mono-data font-bold text-white text-xs">
            {metrics.timeOfDayString}
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vehicles today */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center justify-between text-[#8A94A9] text-xs mb-2">
            <span>Vehicles Cleared Today</span>
            <Car className="w-4 h-4 text-[#4F8CFF]" />
          </div>
          <div className="font-mono-data text-2xl font-bold text-white">
            {metrics.adaptive.totalProcessed.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#8A94A9] mt-1">
            Total arrivals logged: {metrics.adaptive.totalArrivals.toLocaleString()}
          </p>
        </div>

        {/* Card 2: Current density */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center justify-between text-[#8A94A9] text-xs mb-2">
            <span>Current Density</span>
            <Activity className="w-4 h-4 text-[#FFB547]" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono-data text-2xl font-bold text-white">
              {metrics.intensityCurrent}%
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold border ${densityBadgeColor}`}
            >
              {metrics.densityLabel}
            </span>
          </div>
          <p className="text-[11px] text-[#8A94A9] mt-1">
            Rush multiplier: {metrics.rushMultiplier.toFixed(1)}x
          </p>
        </div>

        {/* Card 3: Avg wait adaptive */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center justify-between text-[#8A94A9] text-xs mb-2">
            <span>Avg Wait (Adaptive)</span>
            <Clock className="w-4 h-4 text-[#2EE6A6]" />
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#2EE6A6]">
            {metrics.adaptive.avgWait.toFixed(1)}s
          </div>
          <p className="text-[11px] text-[#8A94A9] mt-1">
            Fixed benchmark: {metrics.fixed.avgWait.toFixed(1)}s
          </p>
        </div>

        {/* Card 4: Improvement vs fixed */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center justify-between text-[#8A94A9] text-xs mb-2">
            <span>Improvement vs Fixed</span>
            <TrendingUp className="w-4 h-4 text-[#2EE6A6]" />
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#2EE6A6]">
            +{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : '0.0'}%
          </div>
          <p className="text-[11px] text-[#8A94A9] mt-1">
            Relative commuter delay reduction
          </p>
        </div>
      </div>

      {/* Main Grid: AI Insights Card + Congestion Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insights Card (7 cols) */}
        <div className="lg:col-span-7 glass-panel-elevated p-6 rounded-2xl border border-[var(--border-light)] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            {/* Card Header with Regenerate */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F8CFF] to-[#2EE6A6] flex items-center justify-center text-[#07090F]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2">
                    <span>AI Signal Timing Insights</span>
                    {insights && (
                      <span className="text-[10px] font-mono-data font-normal text-[#8A94A9] bg-[#07090F] px-2 py-0.5 rounded border border-[var(--border)]">
                        {insights.source}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[#8A94A9]">
                    Autonomous multimodal LLM analysis calibrated to current queue ratio
                  </p>
                </div>
              </div>

              <button
                onClick={loadInsights}
                disabled={isLoadingInsights}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Shimmer Loading State */}
            {isLoadingInsights ? (
              <div className="space-y-4 py-6 animate-pulse">
                <div className="h-4 bg-[#151C2E] rounded w-3/4" />
                <div className="h-4 bg-[#151C2E] rounded w-full" />
                <div className="h-4 bg-[#151C2E] rounded w-5/6" />
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="h-16 bg-[#151C2E] rounded-xl" />
                  <div className="h-16 bg-[#151C2E] rounded-xl" />
                </div>
              </div>
            ) : insights ? (
              <div className="space-y-4 text-xs">
                {/* Executive Summary */}
                <div className="bg-[#07090F]/70 p-3.5 rounded-xl border border-[var(--border)]">
                  <span className="font-semibold text-[#2EE6A6] uppercase text-[10px] tracking-wider block mb-1">
                    Executive Summary
                  </span>
                  <p className="text-[#E8ECF5] leading-relaxed">
                    {insights.summary}
                  </p>
                </div>

                {/* Diagnostics */}
                <div className="bg-[#07090F]/70 p-3.5 rounded-xl border border-[var(--border)]">
                  <span className="font-semibold text-[#4F8CFF] uppercase text-[10px] tracking-wider block mb-1">
                    Bottleneck Diagnostics
                  </span>
                  <p className="text-[#8A94A9] leading-relaxed">
                    {insights.diagnostics}
                  </p>
                </div>

                {/* Actionable Recommendations */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-white uppercase text-[10px] tracking-wider block">
                    Actionable Timing Adjustments
                  </span>
                  <ul className="space-y-1.5">
                    {insights.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="bg-[#151C2E] p-2.5 rounded-lg border border-[var(--border)] flex items-start space-x-2 text-[#E8ECF5]"
                      >
                        <span className="text-[#2EE6A6] font-bold font-mono-data">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Environmental & Recommended Action Pill */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="flex-1 bg-[#07090F] p-2.5 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9] block">Sustainability Impact</span>
                    <span className="text-white font-medium text-[11px] mt-0.5 block">
                      {insights.environmentalImpact}
                    </span>
                  </div>
                  <div className="bg-[#07090F] p-2.5 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9] block">Recommended Mode</span>
                    <span className="text-[#2EE6A6] font-mono-data font-bold text-xs mt-0.5 block">
                      {insights.recommendedAction}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between text-[11px] text-[#8A94A9] font-mono-data">
            <span>Model: Gemini 3.8 Flash / Local Adaptive Twin</span>
            <span>Refreshed: {insights?.generatedAt || 'Just now'}</span>
          </div>
        </div>

        {/* 15-Minute Congestion Forecast Chart (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  15-Min Congestion Forecast
                </h3>
                <p className="text-xs text-[#8A94A9]">
                  Moving-average projected vehicular backlog
                </p>
              </div>
              <LineChartIcon className="w-4 h-4 text-[#4F8CFF]" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="queueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="ProjectedQueue"
                    stroke="#4F8CFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#queueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#07090F] p-3 rounded-xl border border-[var(--border)] mt-4 text-xs flex items-center justify-between">
            <span className="text-[#8A94A9]">Forecast Confidence Index:</span>
            <span className="font-mono-data font-bold text-[#2EE6A6]">94.2%</span>
          </div>
        </div>
      </div>

      {/* Citizen Reports Live Feed with Status Chips */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Live Citizen Incident Dispatch Feed
            </h3>
            <p className="text-xs text-[#8A94A9]">
              Real-time reports submitted via public gateway requiring operator triage.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono-data bg-[#151C2E] text-white border border-[var(--border)]">
            {reports.length} Total Reports
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((rep) => {
            const isApproved = rep.status === 'Approved';
            const isDismissed = rep.status === 'Dismissed';
            const isNew = rep.status === 'New';

            return (
              <div
                key={rep.id}
                className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-xs">{rep.type}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold border ${
                        isApproved
                          ? 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30'
                          : isDismissed
                          ? 'bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/30'
                          : 'bg-[#4F8CFF]/20 text-[#4F8CFF] border-[#4F8CFF]/30'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#8A94A9] leading-relaxed mb-3">
                    {rep.description}
                  </p>

                  <div className="text-[10px] text-[#8A94A9] font-mono-data flex justify-between pb-2 border-b border-[var(--border)]">
                    <span>Approach: {rep.direction}</span>
                    <span>Severity: {rep.severity}</span>
                  </div>
                </div>

                {/* Operator Triage Action Chips */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    onClick={() => updateReportStatus(rep.id, 'Approved')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors ${
                      isApproved
                        ? 'bg-[#2EE6A6] text-[#07090F]'
                        : 'bg-[#151C2E] text-[#8A94A9] hover:text-[#2EE6A6]'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => updateReportStatus(rep.id, 'Dismissed')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors ${
                      isDismissed
                        ? 'bg-[#FF5C6C] text-white'
                        : 'bg-[#151C2E] text-[#8A94A9] hover:text-[#FF5C6C]'
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
