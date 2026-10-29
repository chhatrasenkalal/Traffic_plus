import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  Filter,
  Layers,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { CitizenReportValidationStage } from '../types';

export const ReportsHubPage: React.FC = () => {
  const { reports, updateReportStatus } = useSimulation();

  const [stageFilter, setStageFilter] = useState<'ALL' | CitizenReportValidationStage>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports[0]?.id || null
  );

  const selectedReport = reports.find((r) => r.id === selectedReportId);

  const filteredReports = reports.filter((rep) => {
    if (stageFilter !== 'ALL' && rep.validationStage !== stageFilter) return false;
    if (searchTerm && !rep.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStageBadge = (stage: CitizenReportValidationStage) => {
    switch (stage) {
      case 'CONFIRMED':
        return 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30';
      case 'VERIFIED':
        return 'bg-[#4F8CFF]/20 text-[#4F8CFF] border-[#4F8CFF]/30';
      case 'POSSIBLE':
        return 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/30';
      case 'UNVERIFIED':
        return 'bg-[#8A94A9]/20 text-[#8A94A9] border-[var(--border)]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#4F8CFF] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Modal Provenance Hub</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Citizen Reports Validation Evidence
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Auditable validation pipeline: UNVERIFIED → POSSIBLE → VERIFIED → CONFIRMED with edge camera, loop sensor, and anomaly evidence.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-[#07090F] p-1 rounded-xl border border-[var(--border)] text-xs font-mono-data">
          {(['ALL', 'CONFIRMED', 'VERIFIED', 'POSSIBLE', 'UNVERIFIED'] as const).map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                stageFilter === stage
                  ? 'bg-[#151C2E] text-white font-bold'
                  : 'text-[#8A94A9] hover:text-white'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8A94A9] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 outline-none"
          />
        </div>
      </div>

      {/* Main Grid: List & Evidence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredReports.map((rep) => {
            const isSelected = rep.id === selectedReportId;

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                  isSelected
                    ? 'bg-[#151C2E] border-[#2EE6A6] shadow-lg shadow-[#2EE6A6]/10'
                    : 'glass-panel border-[var(--border)] hover:border-[var(--border-light)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${getStageBadge(
                        rep.validationStage
                      )}`}
                    >
                      {rep.validationStage}
                    </span>
                    <strong className="text-white">{rep.type}</strong>
                  </div>
                  <span className="font-mono-data text-[10px] text-[#8A94A9]">
                    {rep.timestamp}
                  </span>
                </div>

                <p className="text-[#8A94A9] line-clamp-2">{rep.description}</p>

                <div className="flex items-center justify-between text-[11px] text-[#8A94A9] pt-1 border-t border-[var(--border)]">
                  <span>Approach: <strong className="text-white">{rep.direction}</strong></span>
                  <span>Junction: <strong className="text-white">{rep.junctionId}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evidence Detail Drawer (7 cols) */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="glass-panel-elevated p-6 rounded-2xl border border-[var(--border-light)] shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${getStageBadge(
                        selectedReport.validationStage
                      )}`}
                    >
                      STAGE: {selectedReport.validationStage}
                    </span>
                    <span className="text-xs font-mono-data text-[#8A94A9]">
                      Report {selectedReport.id}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white">
                    {selectedReport.type} — {selectedReport.direction} Approach
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'Approved')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89] cursor-pointer"
                  >
                    Confirm & Approve
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'Dismissed')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#151C2E] border border-[var(--border)] text-[#FF5C6C] hover:bg-[#1e2638] cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] text-xs text-[#E8ECF5] leading-relaxed">
                <span className="text-[10px] text-[#8A94A9] uppercase font-mono-data block mb-1">Citizen Narrative</span>
                {selectedReport.description}
              </div>

              {/* Cross-Check Evidence Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#4F8CFF]" />
                  <span>Validation Cross-Check Evidence Matrix</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Camera Check */}
                  <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] space-y-1.5">
                    <div className="flex items-center space-x-2 text-[#4F8CFF]">
                      <Camera className="w-4 h-4" />
                      <strong className="text-white">Optical Vision Camera Check</strong>
                    </div>
                    <div className="font-mono-data font-bold text-sm text-[#2EE6A6]">
                      {selectedReport.validationEvidence?.cameraCheckResult || 'Visual Verification In Progress'}
                    </div>
                    <p className="text-[11px] text-[#8A94A9]">
                      Confidence: {selectedReport.validationEvidence?.cameraConfidence ?? 85}%
                    </p>
                  </div>

                  {/* Loop Sensor Check */}
                  <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] space-y-1.5">
                    <div className="flex items-center space-x-2 text-[#FFB547]">
                      <Radio className="w-4 h-4" />
                      <strong className="text-white">Inductive Loop & Radar Telemetry</strong>
                    </div>
                    <div className="font-mono-data font-bold text-sm text-white">
                      {selectedReport.validationEvidence?.sensorCheckResult || 'Normal Sensor Baseline'}
                    </div>
                    <p className="text-[11px] text-[#8A94A9]">
                      Corroborating reports: {selectedReport.validationEvidence?.corroboratingReportsCount ?? 1}
                    </p>
                  </div>
                </div>

                {/* Anomaly & Provenance */}
                <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Historical Traffic Variance Index:</span>
                    <strong className="font-mono-data text-[#4F8CFF]">
                      {selectedReport.validationEvidence?.historicalAnomalyIndex ?? 1.5}x standard deviation
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A9]">Evidence Provenance Signature:</span>
                    <strong className="font-mono-data text-white">
                      {selectedReport.validationEvidence?.provenance || 'Multi-Source Fusion Node'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-[#8A94A9]">
              Select a report from the list to inspect evidence provenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
