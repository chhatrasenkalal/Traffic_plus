import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertOctagon,
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Send,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import {
  CitizenReportDirection,
  CitizenReportSeverity,
  CitizenReportType,
} from '../types';

const ISSUE_TYPES: { type: CitizenReportType; label: string; icon: any; desc: string }[] = [
  {
    type: 'Congestion',
    label: 'Unusual Congestion',
    icon: Car,
    desc: 'Persistent queue backlog spilling beyond approach threshold.',
  },
  {
    type: 'Accident',
    label: 'Vehicle Collision / Breakdown',
    icon: AlertOctagon,
    desc: 'Lanes blocked by stalled vehicle or minor fender bender.',
  },
  {
    type: 'Hazard',
    label: 'Road Hazard',
    icon: AlertTriangle,
    desc: 'Debris, double-parked delivery, or pavement obstruction.',
  },
  {
    type: 'Signal fault',
    label: 'Signal Equipment Fault',
    icon: Wrench,
    desc: 'Flashing indicator, delayed phase change, or sensor issue.',
  },
];

const APPROACH_DIRECTIONS: CitizenReportDirection[] = [
  'Northbound',
  'Southbound',
  'Eastbound',
  'Westbound',
];

const SEVERITIES: { level: CitizenReportSeverity; color: string; desc: string }[] = [
  { level: 'Low', color: '#4F8CFF', desc: 'Minor advisory, moving slowly' },
  { level: 'Medium', color: '#FFB547', desc: 'Substantial delay or partial block' },
  { level: 'Critical', color: '#FF5C6C', desc: 'Arterial blocked, emergency situation' },
];

export const ReportPage: React.FC<{ navigate: (route: string) => void }> = ({
  navigate,
}) => {
  const { addReport, reports } = useSimulation();

  // Form State
  const [selectedType, setSelectedType] = useState<CitizenReportType>('Congestion');
  const [selectedDirection, setSelectedDirection] =
    useState<CitizenReportDirection>('Northbound');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<CitizenReportSeverity>('Medium');

  const [errors, setErrors] = useState<{ description?: string }>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 8) {
      setErrors({ description: 'Please provide at least 8 characters describing the issue.' });
      return;
    }

    setErrors({});
    addReport({
      type: selectedType,
      direction: selectedDirection,
      description: description.trim(),
      severity,
    });

    setSubmittedSuccess(true);
    setDescription('');

    // Reset success banner after 4 seconds
    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#E8ECF5]">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#4F8CFF] uppercase tracking-wider mb-2">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Public Feedback Gateway</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">
          Citizen Traffic Report
        </h1>
        <p className="text-sm text-[#8A94A9] mt-2 max-w-2xl">
          Report immediate intersection bottlenecks, lane hazards, or signal abnormalities. Your report is ingested in real time by the TrafficPulse operator intelligence twin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-[var(--border-light)] shadow-xl relative overflow-hidden">
            {/* Success Overlay Animation */}
            <AnimatePresence>
              {submittedSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-[#0E1320]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#2EE6A6]/20 border border-[#2EE6A6] flex items-center justify-center text-[#2EE6A6] mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white mb-2">
                    Report Dispatched to Intelligence
                  </h3>
                  <p className="text-xs text-[#8A94A9] max-w-sm mb-6">
                    Telemetry received and logged in the digital twin feed. Operator status currently marked as <span className="text-[#4F8CFF] font-semibold">New</span>.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSubmittedSuccess(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)] cursor-pointer"
                    >
                      Submit Another
                    </button>
                    <button
                      onClick={() => navigate('#/intelligence')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89] cursor-pointer"
                    >
                      View in Intelligence
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Field 1: Issue Type */}
              <div>
                <label className="block text-xs font-semibold text-[#E8ECF5] uppercase tracking-wider mb-2.5">
                  1. Issue Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ISSUE_TYPES.map((item) => {
                    const isSelected = selectedType === item.type;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setSelectedType(item.type)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-[#151C2E] border-[#2EE6A6] shadow-sm'
                            : 'bg-[#07090F] border-[var(--border)] hover:border-[var(--border-light)]'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]' : 'bg-[#151C2E] text-[#8A94A9]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#8A94A9]'}`}>
                            {item.label}
                          </div>
                          <div className="text-[11px] text-[#8A94A9] mt-0.5 line-clamp-2">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: Approach Direction */}
              <div>
                <label className="block text-xs font-semibold text-[#E8ECF5] uppercase tracking-wider mb-2.5">
                  2. Approach Direction
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {APPROACH_DIRECTIONS.map((dir) => {
                    const isSelected = selectedDirection === dir;
                    return (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setSelectedDirection(dir)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4F8CFF]/20 border-[#4F8CFF] text-white font-bold'
                            : 'bg-[#07090F] border-[var(--border)] text-[#8A94A9] hover:text-white'
                        }`}
                      >
                        {dir}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Severity */}
              <div>
                <label className="block text-xs font-semibold text-[#E8ECF5] uppercase tracking-wider mb-2.5">
                  3. Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SEVERITIES.map((sev) => {
                    const isSelected = severity === sev.level;
                    return (
                      <button
                        key={sev.level}
                        type="button"
                        onClick={() => setSeverity(sev.level)}
                        className={`py-2 px-3 rounded-xl text-xs border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#151C2E] border-white text-white font-bold'
                            : 'bg-[#07090F] border-[var(--border)] text-[#8A94A9] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sev.color }}
                          />
                          <span>{sev.level}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 4: Description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="report-desc"
                    className="text-xs font-semibold text-[#E8ECF5] uppercase tracking-wider"
                  >
                    4. Situation Description
                  </label>
                  <span className="text-[11px] font-mono-data text-[#8A94A9]">
                    {description.length} / 240
                  </span>
                </div>
                <textarea
                  id="report-desc"
                  rows={3}
                  maxLength={240}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Queue backed up past 4th street stop line due to bus stall in curbside lane..."
                  className="w-full bg-[#07090F] border border-[var(--border)] focus:border-[#2EE6A6] focus:ring-1 focus:ring-[#2EE6A6] rounded-xl p-3 text-xs text-white placeholder-[#8A94A9]/60 outline-none transition-colors"
                />
                {errors.description && (
                  <p className="text-[11px] text-[#FF5C6C] mt-1.5 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-heading font-semibold text-sm bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#2EE6A6]/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Citizen Report</span>
              </button>
            </form>
          </div>
        </div>

        {/* Recent Submissions Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white">
              Recent Submissions
            </h3>
            <span className="text-xs font-mono-data text-[#8A94A9]">
              {reports.length} reports logged
            </span>
          </div>

          <div className="space-y-3">
            {reports.slice(0, 5).map((rep) => {
              const statusBadgeColor =
                rep.status === 'Approved'
                  ? 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30'
                  : rep.status === 'Dismissed'
                  ? 'bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/30'
                  : 'bg-[#4F8CFF]/20 text-[#4F8CFF] border-[#4F8CFF]/30';

              const severityColor =
                rep.severity === 'Critical'
                  ? '#FF5C6C'
                  : rep.severity === 'Medium'
                  ? '#FFB547'
                  : '#4F8CFF';

              return (
                <div
                  key={rep.id}
                  className="glass-panel p-4 rounded-xl border border-[var(--border)] text-xs space-y-2 hover:border-[var(--border-light)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: severityColor }}
                      />
                      <span className="font-semibold text-white">{rep.type}</span>
                      <span className="text-[#8A94A9]">•</span>
                      <span className="text-[#8A94A9]">{rep.direction}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold border ${statusBadgeColor}`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-[#8A94A9] leading-relaxed line-clamp-2">
                    {rep.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8A94A9] pt-1 border-t border-[var(--border)]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{rep.timestamp}</span>
                    </span>
                    <span>Severity: {rep.severity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
