import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Flame,
  Layers,
  MapPin,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { Incident, IncidentSeverity } from '../types';

export const IncidentsPage: React.FC = () => {
  const {
    incidents,
    activeIncidents,
    resolveIncident,
    dispatchUnit,
    activateGreenCorridor,
    emergencyUnits,
    injectIncident,
  } = useSimulation();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    activeIncidents[0]?.id || incidents[0]?.id || null
  );
  const [severityFilter, setSeverityFilter] = useState<'ALL' | IncidentSeverity>('ALL');

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/30';
      case 'HIGH':
        return 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/30';
      case 'MEDIUM':
        return 'bg-[#4F8CFF]/20 text-[#4F8CFF] border-[#4F8CFF]/30';
      case 'LOW':
        return 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#FF5C6C] uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Autonomous Incident Engine (SIMULATED)</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Incident Management & Priority Queue
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Real-time pipeline tracking: Potential → AI Confidence → Verification → Severity → Confirmed.
          </p>
        </div>

        {/* Quick Demo Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const inc = injectIncident({
                type: 'multi-vehicle collision',
                title: 'Multi-Vehicle Pileup on North Approach',
                junctionId: 'J2_NORTH',
                phase: 'phaseA',
                direction: 'Northbound',
                vehiclesInvolved: 3,
                blockedLanes: 2,
                peopleInvolved: 4,
                fireSmokePresent: true,
              });
              setSelectedIncidentId(inc.id);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FF5C6C] text-white hover:bg-[#e04b5a] shadow-lg shadow-[#FF5C6C]/20 transition-all cursor-pointer flex items-center space-x-2"
          >
            <Flame className="w-4 h-4" />
            <span>Inject Critical Incident</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-[var(--border)]">
          <span className="text-[11px] text-[#8A94A9]">Active Incidents</span>
          <div className="font-mono-data text-2xl font-bold text-white mt-1">
            {activeIncidents.length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-[var(--border)]">
          <span className="text-[11px] text-[#8A94A9]">Critical / High Priority</span>
          <div className="font-mono-data text-2xl font-bold text-[#FF5C6C] mt-1">
            {activeIncidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-[var(--border)]">
          <span className="text-[11px] text-[#8A94A9]">Green Corridors Active</span>
          <div className="font-mono-data text-2xl font-bold text-[#2EE6A6] mt-1">
            {activeIncidents.filter((i) => i.greenCorridorActive).length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-[var(--border)]">
          <span className="text-[11px] text-[#8A94A9]">Total Ingested Today</span>
          <div className="font-mono-data text-2xl font-bold text-[#4F8CFF] mt-1">
            {incidents.length}
          </div>
        </div>
      </div>

      {/* Main Grid: Incident List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white">
              Incident Priority Queue
            </h3>
            <div className="flex items-center space-x-1 bg-[#07090F] p-1 rounded-lg border border-[var(--border)] text-[10px] font-mono-data">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    severityFilter === sev
                      ? 'bg-[#151C2E] text-white font-bold'
                      : 'text-[#8A94A9] hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              const isResolved = inc.stage === 'Resolved';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                    isSelected
                      ? 'bg-[#151C2E] border-[#4F8CFF] shadow-lg shadow-[#4F8CFF]/10'
                      : 'glass-panel border-[var(--border)] hover:border-[var(--border-light)]'
                  } ${isResolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${getSeverityBadge(
                          inc.severity
                        )}`}
                      >
                        {inc.severity}
                      </span>
                      <span className="font-mono-data text-[11px] text-[#8A94A9]">
                        {inc.id}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono-data text-[#8A94A9]">
                      Stage: <strong className="text-white">{inc.stage}</strong>
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-white line-clamp-1">
                    {inc.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-[#8A94A9]">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#4F8CFF]" />
                      <span>{inc.junctionId} • {inc.direction}</span>
                    </span>
                    <span className="font-mono-data">AI Conf: {inc.aiConfidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Drawer (7 cols) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="glass-panel-elevated p-6 rounded-2xl border border-[var(--border-light)] shadow-2xl space-y-6">
              {/* Drawer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${getSeverityBadge(
                        selectedIncident.severity
                      )}`}
                    >
                      {selectedIncident.severity}
                    </span>
                    <span className="text-xs font-mono-data text-[#8A94A9]">
                      {selectedIncident.id} • {selectedIncident.type}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white">
                    {selectedIncident.title}
                  </h3>
                  <p className="text-xs text-[#8A94A9] mt-0.5">
                    {selectedIncident.locationDesc}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedIncident.stage !== 'Resolved' && (
                    <button
                      onClick={() => resolveIncident(selectedIncident.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89] transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-modal Evidence & Diagnostics */}
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#4F8CFF]" />
                  <span>Multi-Modal Provenance & Evidence</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-[#07090F] p-3 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">Camera AI Confidence</span>
                    <div className="font-mono-data font-bold text-base text-[#4F8CFF] mt-0.5">
                      {selectedIncident.evidence.cameraConfidence}%
                    </div>
                  </div>
                  <div className="bg-[#07090F] p-3 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">Sensor Occupancy</span>
                    <div className="font-mono-data font-bold text-base text-[#FFB547] mt-0.5">
                      {selectedIncident.evidence.sensorOccupancyRate}%
                    </div>
                  </div>
                  <div className="bg-[#07090F] p-3 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">Blocked Lanes</span>
                    <div className="font-mono-data font-bold text-base text-[#FF5C6C] mt-0.5">
                      {selectedIncident.blockedLanes} Lane(s)
                    </div>
                  </div>
                  <div className="bg-[#07090F] p-3 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">Occupants / People</span>
                    <div className="font-mono-data font-bold text-base text-white mt-0.5">
                      {selectedIncident.peopleInvolved}
                    </div>
                  </div>
                </div>
                <div className="bg-[#07090F] p-3 rounded-xl border border-[var(--border)] mt-2 text-xs text-[#8A94A9]">
                  <strong className="text-white">Evidence Log:</strong> {selectedIncident.evidence.description}
                </div>
              </div>

              {/* 5-Stage Verification Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2EE6A6]" />
                  <span>Pipeline Lifecycle Progression</span>
                </h4>
                <div className="space-y-3 relative pl-4 border-l border-[var(--border)]">
                  {selectedIncident.history.map((step, idx) => (
                    <div key={idx} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#2EE6A6] ring-4 ring-[#0E1320]" />
                      <div className="flex items-center space-x-2">
                        <strong className="text-white">{step.stage}</strong>
                        <span className="font-mono-data text-[10px] text-[#8A94A9]">{step.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#8A94A9] mt-0.5">{step.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Dispatch & Green Corridor Actions */}
              {selectedIncident.stage !== 'Resolved' && (
                <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const unit = emergencyUnits.find((u) => u.state === 'Available');
                      if (unit) {
                        dispatchUnit(unit.id, selectedIncident.id, selectedIncident.junctionId);
                        activateGreenCorridor(
                          unit.id,
                          selectedIncident.id,
                          unit.currentJunctionId,
                          selectedIncident.junctionId,
                          selectedIncident.phase
                        );
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#2EE6A6]/20 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Dispatch Nearest Unit & Activate Green Corridor</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-[#8A94A9]">
              Select an incident from the queue to view full multi-modal telemetry and timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
