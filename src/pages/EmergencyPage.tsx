import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Ambulance,
  Building2,
  CheckCircle2,
  Flame,
  Hospital,
  MapPin,
  Navigation,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Users,
  Zap,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { EmergencyUnitState, EmergencyUnitType } from '../types';

export const EmergencyPage: React.FC = () => {
  const {
    emergencyUnits,
    hospitals,
    stations,
    activeIncidents,
    updateUnitState,
    dispatchUnit,
    activateGreenCorridor,
    deactivateGreenCorridor,
    greenCorridor,
    isInterfaceAuthenticated,
    loginInterface,
    logoutUser,
    currentUserSession,
  } = useSimulation();

  // EOC CAD In-Page Auth State
  const [callsignInput, setCallsignInput] = useState('MEDIC-1');
  const [pinInput, setPinInput] = useState('medic2026');
  const [stationId, setStationId] = useState('STATION-01-CENTRAL');
  const [authError, setAuthError] = useState('');

  const isEmergencyAuthed = isInterfaceAuthenticated('emergency');

  const handleEmergencyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = loginInterface('emergency', callsignInput, pinInput, {
      badge: `CALLSIGN ${callsignInput} (${stationId})`,
    });
    if (!res.success) {
      setAuthError(res.error || 'Invalid EOC dispatch passcode. Try: medic2026 or 1234');
    }
  };

  const handleQuickEmergencyAuth = () => {
    setCallsignInput('MEDIC-1');
    setPinInput('medic2026');
    setStationId('STATION-01-CENTRAL');
    setAuthError('');
    loginInterface('emergency', 'MEDIC-1', 'medic2026', {
      badge: 'CALLSIGN MEDIC-1 (STATION-01-CENTRAL)',
    });
  };

  const getUnitIcon = (type: EmergencyUnitType) => {
    switch (type) {
      case 'AMBULANCE':
        return Ambulance;
      case 'POLICE':
        return Shield;
      case 'FIRE':
        return Flame;
    }
  };

  const getStateBadge = (state: EmergencyUnitState) => {
    switch (state) {
      case 'Available':
        return 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30';
      case 'Dispatched':
        return 'bg-[#4F8CFF]/20 text-[#4F8CFF] border-[#4F8CFF]/30';
      case 'En route':
        return 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/30 animate-pulse';
      case 'On scene':
        return 'bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/30';
      case 'Transporting/Resolving':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'At hospital':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-[#151C2E] text-[#8A94A9] border-[var(--border)]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider mb-1">
            <Siren className="w-3.5 h-3.5" />
            <span>Emergency Operations Center (SIMULATED)</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            CAD Fleet Dispatch & Hospital Routing
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Autonomous multi-agency routing with traffic-calibrated hospital capacity matching and Green Corridor actuation.
          </p>
        </div>

        {/* Green Corridor Global Status Pill */}
        <div className="flex items-center space-x-3 bg-[#07090F] px-4 py-2 rounded-2xl border border-[var(--border)]">
          <Zap className={`w-4 h-4 ${greenCorridor ? 'text-[#2EE6A6] animate-pulse' : 'text-[#8A94A9]'}`} />
          <div>
            <div className="text-[10px] text-[#8A94A9]">Preemption Status</div>
            <div className={`font-mono-data font-bold text-xs ${greenCorridor ? 'text-[#2EE6A6]' : 'text-[#8A94A9]'}`}>
              {greenCorridor ? 'GREEN CORRIDOR ACTIVE' : 'Standard Dynamic Cycle'}
            </div>
          </div>
        </div>
      </div>

      {/* Honest Simulation Disclaimer Banner */}
      <div className="bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 p-4 rounded-xl flex items-start space-x-3 text-xs text-[#4F8CFF]">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">
            Strict Demonstration Disclosure
          </strong>
          <span>
            All emergency units, CAD states, hospital occupancy rates, and ambulance routes are 100% simulated digital twin entities. This application does NOT connect to real-world 112/911 PSAPs or public healthcare telemetry.
          </span>
        </div>
      </div>

      {!isEmergencyAuthed ? (
        /* EOC CAD Dispatch Authentication Gate */
        <div className="max-w-xl mx-auto glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-[var(--border-light)] bg-gradient-to-b from-[#0E1424] to-[#07090F] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF5C6C]/20 border border-[#FF5C6C]/40 flex items-center justify-center text-[#FF5C6C] shadow-lg shadow-[#FF5C6C]/20">
              <Siren className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#FF5C6C]/15 text-[#FF5C6C] text-[10px] font-mono-data font-bold border border-[#FF5C6C]/30 uppercase">
              Emergency CAD Clearance Level 4
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">
              EOC Dispatch Console Login
            </h2>
            <p className="text-xs text-[#8A94A9] max-w-md mx-auto">
              Medical triage dispatcher clearance required to assign ambulance/fire units, trigger dynamic Green Corridors, and manage trauma hospital routing.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/40 text-xs text-[#FF5C6C] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleEmergencyLogin} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                  Dispatcher Callsign / Unit ID
                </label>
                <div className="relative">
                  <Ambulance className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                  <input
                    type="text"
                    value={callsignInput}
                    onChange={(e) => setCallsignInput(e.target.value)}
                    placeholder="MEDIC-1"
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#FF5C6C] outline-none font-mono-data"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                  EOC CAD Passcode
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="medic2026 or 1234"
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#FF5C6C] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                Dispatch Terminal Station
              </label>
              <input
                type="text"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                placeholder="STATION-01-CENTRAL"
                className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#FF5C6C] outline-none font-mono-data"
              />
            </div>

            {/* Quick Demo Credentials */}
            <div className="p-3.5 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/20 text-[11px] text-[#FFB547] space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Exhibition Evaluator EOC Credentials</span>
              </div>
              <p className="text-[#8A94A9]">
                Callsign: <code className="text-white font-mono-data">MEDIC-1</code> • Passcode:{' '}
                <code className="text-white font-mono-data">medic2026</code> or{' '}
                <code className="text-white font-mono-data">1234</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#FF5C6C] hover:bg-[#e04857] text-white transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#FF5C6C]/20"
              >
                <Unlock className="w-4 h-4" />
                <span>Authenticate &amp; Open CAD Console</span>
              </button>

              <button
                type="button"
                onClick={handleQuickEmergencyAuth}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2EE6A6]/20 hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090F] border border-[#2EE6A6]/40 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ 1-Click EOC Auth</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated EOC Surface */
        <div className="space-y-8">
          {/* Active EOC Dispatch Session Ribbon */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF5C6C]/15 via-[#0E1424] to-[#2EE6A6]/15 border border-[#FF5C6C]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5C6C]/20 border border-[#FF5C6C]/40 flex items-center justify-center text-[#FF5C6C]">
                <Siren className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">
                    {currentUserSession?.displayName || 'Lead EOC Paramedic & Fire Dispatcher'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF5C6C]/20 text-[#FF5C6C] font-mono-data font-bold border border-[#FF5C6C]/30 text-[10px]">
                    CLEARANCE LVL 4 — EOC CAD
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[#8A94A9] text-[11px] mt-0.5">
                  <span>
                    Callsign: <strong className="text-white font-mono-data">{currentUserSession?.badgeOrCallsign || 'MEDIC-1 CAD'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Token: <strong className="text-white font-mono-data">{currentUserSession?.token || 'AUTH-EMS-101'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Terminal: <strong className="text-[#2EE6A6]">Central EOC Command Desk</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logoutUser}
              className="self-end sm:self-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FF5C6C]/15 hover:bg-[#FF5C6C] text-[#FF5C6C] hover:text-white border border-[#FF5C6C]/40 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Terminal / Sign Out</span>
            </button>
          </div>

          {/* Hospital Recommendation Section */}
          <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Hospital className="w-5 h-5 text-[#4F8CFF]" />
              <span>Simulated Metropolitan Hospital Telemetry</span>
            </h3>
            <p className="text-xs text-[#8A94A9]">
              Recommends the most appropriate hospital based on trauma capability and emergency load, not merely proximity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {hospitals.map((hosp) => {
            const isRecommended = hosp.recommendationScore >= 90;
            const isHighLoad = hosp.emergencyLoad >= 85;

            return (
              <div
                key={hosp.id}
                className={`p-5 rounded-2xl border transition-all text-xs space-y-3 relative overflow-hidden ${
                  isRecommended
                    ? 'glass-panel-elevated border-[#2EE6A6]/40 shadow-lg shadow-[#2EE6A6]/10'
                    : 'glass-panel border-[var(--border)]'
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-[#2EE6A6] text-[#07090F] font-mono-data font-bold text-[9px] px-2.5 py-0.5 rounded-bl-lg uppercase">
                    AI Recommended Destination
                  </div>
                )}

                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    {hosp.name}
                  </h4>
                  <span className="text-[#8A94A9] text-[11px] block mt-0.5">
                    {hosp.specialty}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#07090F] p-2 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">ER Load</span>
                    <div
                      className={`font-mono-data font-bold text-sm mt-0.5 ${
                        isHighLoad ? 'text-[#FF5C6C]' : 'text-[#2EE6A6]'
                      }`}
                    >
                      {hosp.emergencyLoad}%
                    </div>
                  </div>
                  <div className="bg-[#07090F] p-2 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">ICU Beds</span>
                    <div className="font-mono-data font-bold text-sm text-white mt-0.5">
                      {hosp.icuBedsAvailable} / {hosp.totalBeds}
                    </div>
                  </div>
                  <div className="bg-[#07090F] p-2 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] text-[#8A94A9]">Traffic ETA</span>
                    <div className="font-mono-data font-bold text-sm text-[#4F8CFF] mt-0.5">
                      {hosp.trafficAdjustedEtaMinutes.toFixed(1)}m
                    </div>
                  </div>
                </div>

                {/* One line explanation requirement */}
                <div className="p-2.5 rounded-xl bg-[#07090F] border border-[var(--border)] text-[11px] leading-relaxed">
                  <span className="text-[#E8ECF5] font-medium">{hosp.recommendationReason}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Units Fleet Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#2EE6A6]" />
            <span>Active Response Units Fleet ({emergencyUnits.length} Units)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {emergencyUnits.map((unit) => {
            const Icon = getUnitIcon(unit.type);
            const isBusy = unit.state !== 'Available';

            return (
              <div
                key={unit.id}
                className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: `${unit.color}20`, color: unit.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-white">
                          {unit.callSign}
                        </h4>
                        <span className="text-[10px] font-mono-data text-[#8A94A9]">
                          {unit.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${getStateBadge(
                        unit.state
                      )}`}
                    >
                      {unit.state}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#8A94A9]">
                    <div className="flex justify-between">
                      <span>Current Junction:</span>
                      <strong className="text-white font-mono-data">{unit.currentJunctionId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Home Station:</span>
                      <span className="text-white truncate max-w-[180px]">{unit.homeStation}</span>
                    </div>
                    {unit.assignedIncidentId && (
                      <div className="flex justify-between text-[#FFB547]">
                        <span>Assigned Incident:</span>
                        <strong className="font-mono-data">{unit.assignedIncidentId}</strong>
                      </div>
                    )}
                    {unit.assignedHospitalId && (
                      <div className="flex justify-between text-[#2EE6A6]">
                        <span>Target Facility:</span>
                        <strong className="font-mono-data">{unit.assignedHospitalId}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* State Progression Controls */}
                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {unit.state === 'Dispatched' && (
                      <button
                        onClick={() => {
                          updateUnitState(unit.id, 'En route');
                          if (unit.assignedIncidentId && unit.targetJunctionId) {
                            activateGreenCorridor(unit.id, unit.assignedIncidentId, unit.currentJunctionId, unit.targetJunctionId);
                          }
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#FFB547] text-[#07090F] font-bold hover:brightness-110 cursor-pointer"
                      >
                        En Route (Start Siren)
                      </button>
                    )}
                    {unit.state === 'En route' && (
                      <button
                        onClick={() => updateUnitState(unit.id, 'On scene')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#FF5C6C] text-white font-bold hover:brightness-110 cursor-pointer"
                      >
                        Mark On Scene
                      </button>
                    )}
                    {unit.state === 'On scene' && unit.type === 'AMBULANCE' && (
                      <button
                        onClick={() => updateUnitState(unit.id, 'Transporting/Resolving')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-purple-500 text-white font-bold hover:brightness-110 cursor-pointer"
                      >
                        Transport to Hospital
                      </button>
                    )}
                    {unit.state === 'Transporting/Resolving' && (
                      <button
                        onClick={() => updateUnitState(unit.id, 'At hospital')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 text-white font-bold hover:brightness-110 cursor-pointer"
                      >
                        Arrive At Hospital
                      </button>
                    )}
                    {(unit.state === 'On scene' || unit.state === 'At hospital') && (
                      <button
                        onClick={() => {
                          updateUnitState(unit.id, 'Available');
                          deactivateGreenCorridor('Unit Cleared Scene');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#151C2E] border border-[var(--border)] text-[#2EE6A6] font-bold hover:bg-[#1e2638] cursor-pointer"
                      >
                        Clear & Return Available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
