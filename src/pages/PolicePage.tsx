import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  BadgeAlert,
  CheckCircle2,
  ChevronRight,
  Flame,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  Siren,
  Users,
  Zap,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Building2,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { Incident } from '../types';

export const PolicePage: React.FC = () => {
  const {
    incidents,
    activeIncidents,
    emergencyUnits,
    resolveIncident,
    dispatchUnit,
    updateUnitState,
    activateGreenCorridor,
    deactivateGreenCorridor,
    injectIncident,
    isInterfaceAuthenticated,
    loginInterface,
    logoutUser,
    currentUserSession,
  } = useSimulation();

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Police CAD In-Page Auth State
  const [badgeInput, setBadgeInput] = useState('704');
  const [pinInput, setPinInput] = useState('police2026');
  const [cruiserCallsign, setCruiserCallsign] = useState('CRUISER-04');
  const [authError, setAuthError] = useState('');

  const isPoliceAuthed = isInterfaceAuthenticated('police');

  const handlePoliceLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = loginInterface('police', badgeInput, pinInput, {
      badge: `BADGE #${badgeInput} (Precinct 4 - ${cruiserCallsign})`,
    });
    if (!res.success) {
      setAuthError(res.error || 'Invalid police PIN. Try: police2026 or 1234');
    }
  };

  const handleQuickPoliceAuth = () => {
    setBadgeInput('704');
    setPinInput('police2026');
    setCruiserCallsign('CRUISER-04');
    setAuthError('');
    loginInterface('police', '704', 'police2026', {
      badge: 'BADGE #704 (Precinct 4 - CRUISER-04)',
    });
  };

  const policeUnits = emergencyUnits.filter((u) => u.type === 'POLICE');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#E8ECF5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-data text-[#4F8CFF] uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Metro Police Department Traffic Division (SIMULATED)</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Police Command & Arterial Safety
          </h1>
          <p className="text-sm text-[#8A94A9] mt-1">
            Incident acceptance, cruiser CAD dispatching, lane blockage enforcement, and public safety advisories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              injectIncident({
                type: 'wrong-way vehicle',
                title: 'Wrong-Way Vehicle Reported on East Concourse',
                junctionId: 'J4_EAST',
                phase: 'phaseB',
                direction: 'Westbound',
                vehiclesInvolved: 1,
                blockedLanes: 1,
                peopleInvolved: 1,
              });
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#4F8CFF] text-white hover:bg-[#3d7ae8] shadow-lg shadow-[#4F8CFF]/20 transition-all cursor-pointer flex items-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Simulate Reckless Vehicle Event</span>
          </button>
        </div>
      </div>

      {!isPoliceAuthed ? (
        /* Police CAD Authentication Gate Screen */
        <div className="max-w-xl mx-auto glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-[var(--border-light)] bg-gradient-to-b from-[#0E1424] to-[#07090F] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 flex items-center justify-center text-[#4F8CFF] shadow-lg shadow-[#4F8CFF]/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#4F8CFF]/15 text-[#4F8CFF] text-[10px] font-mono-data font-bold border border-[#4F8CFF]/30 uppercase">
              Law Enforcement CAD Clearance Level 4
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">
              Police CAD Dispatch Login
            </h2>
            <p className="text-xs text-[#8A94A9] max-w-md mx-auto">
              Authorized credentials required to dispatch metro police cruisers, enact arterial roadblock orders, and transmit citywide emergency safety advisories.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/40 text-xs text-[#FF5C6C] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handlePoliceLogin} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                  Officer Badge Number
                </label>
                <div className="relative">
                  <BadgeAlert className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                  <input
                    type="text"
                    value={badgeInput}
                    onChange={(e) => setBadgeInput(e.target.value)}
                    placeholder="704"
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none font-mono-data"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                  Precinct CAD PIN
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="police2026 or 1234"
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                Assigned Cruiser Callsign
              </label>
              <input
                type="text"
                value={cruiserCallsign}
                onChange={(e) => setCruiserCallsign(e.target.value)}
                placeholder="CRUISER-04"
                className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none font-mono-data"
              />
            </div>

            {/* Quick Demo Credentials for Evaluators */}
            <div className="p-3.5 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/20 text-[11px] text-[#FFB547] space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Exhibition Evaluator Police Credentials</span>
              </div>
              <p className="text-[#8A94A9]">
                Badge: <code className="text-white font-mono-data">704</code> • PIN:{' '}
                <code className="text-white font-mono-data">police2026</code> or{' '}
                <code className="text-white font-mono-data">1234</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#4F8CFF] hover:bg-[#3D7AEE] text-white transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#4F8CFF]/20"
              >
                <Unlock className="w-4 h-4" />
                <span>Authenticate &amp; Open CAD</span>
              </button>

              <button
                type="button"
                onClick={handleQuickPoliceAuth}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2EE6A6]/20 hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090F] border border-[#2EE6A6]/40 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ 1-Click Police Auth</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated Police Surface */
        <div className="space-y-8">
          {/* Active Police Officer Session Ribbon */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4F8CFF]/15 via-[#0E1424] to-[#2EE6A6]/15 border border-[#4F8CFF]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 flex items-center justify-center text-[#4F8CFF]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">
                    {currentUserSession?.displayName || 'Metro Police Traffic Commander'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#4F8CFF]/20 text-[#4F8CFF] font-mono-data font-bold border border-[#4F8CFF]/30 text-[10px]">
                    CLEARANCE LVL 4 — POLICE CAD
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[#8A94A9] text-[11px] mt-0.5">
                  <span>
                    Callsign: <strong className="text-white font-mono-data">{currentUserSession?.badgeOrCallsign || 'BADGE #704'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Token: <strong className="text-white font-mono-data">{currentUserSession?.token || 'AUTH-POLICE-704'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Station: <strong className="text-[#2EE6A6]">Precinct 4 Traffic Desk</strong>
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

          {/* Police Unit Roster */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#4F8CFF]" />
              <span>Active Patrol Cruisers</span>
            </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policeUnits.map((cruiser) => (
            <div
              key={cruiser.id}
              className="glass-panel p-4 rounded-xl border border-[var(--border)] flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#4F8CFF]/20 text-[#4F8CFF]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">
                    {cruiser.callSign}
                  </h4>
                  <span className="text-xs text-[#8A94A9]">
                    Stationed at {cruiser.currentJunctionId} • {cruiser.homeStation}
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono-data font-bold border ${
                  cruiser.state === 'Available'
                    ? 'bg-[#2EE6A6]/20 text-[#2EE6A6] border-[#2EE6A6]/30'
                    : 'bg-[#FFB547]/20 text-[#FFB547] border-[#FFB547]/30'
                }`}
              >
                {cruiser.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Police Action Matrix on Incidents: ACCEPT / DISPATCH / EN ROUTE / ON SCENE / RESOLVE */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-[#FFB547]" />
          <span>Active Incident CAD Queue ({activeIncidents.length} Pending)</span>
        </h3>

        <div className="space-y-4">
          {activeIncidents.map((inc) => (
            <div
              key={inc.id}
              className="glass-panel-elevated p-5 rounded-2xl border border-[var(--border-light)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#FF5C6C]/20 text-[#FF5C6C] border border-[#FF5C6C]/30">
                    {inc.severity}
                  </span>
                  <h4 className="font-heading font-bold text-base text-white">
                    {inc.title}
                  </h4>
                </div>
                <span className="text-xs font-mono-data text-[#8A94A9]">
                  {inc.junctionId} • {inc.direction} • {inc.blockedLanes} Lane(s) Blocked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#07090F] p-2.5 rounded-xl border border-[var(--border)]">
                  <span className="text-[10px] text-[#8A94A9]">Vehicles Involved</span>
                  <div className="font-mono-data font-bold text-sm text-white mt-0.5">{inc.vehiclesInvolved}</div>
                </div>
                <div className="bg-[#07090F] p-2.5 rounded-xl border border-[var(--border)]">
                  <span className="text-[10px] text-[#8A94A9]">People Involved</span>
                  <div className="font-mono-data font-bold text-sm text-white mt-0.5">{inc.peopleInvolved}</div>
                </div>
                <div className="bg-[#07090F] p-2.5 rounded-xl border border-[var(--border)]">
                  <span className="text-[10px] text-[#8A94A9]">Traffic Delay</span>
                  <div className="font-mono-data font-bold text-sm text-[#FFB547] mt-0.5">{inc.trafficImpactScore}%</div>
                </div>
                <div className="bg-[#07090F] p-2.5 rounded-xl border border-[var(--border)]">
                  <span className="text-[10px] text-[#8A94A9]">Assigned CAD Unit</span>
                  <div className="font-mono-data font-bold text-sm text-[#4F8CFF] mt-0.5">
                    {inc.assignedUnitId || 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Required Actions: ACCEPT / DISPATCH / EN ROUTE / ON SCENE / RESOLVE */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => {
                    const freeCruiser = policeUnits.find((u) => u.state === 'Available');
                    if (freeCruiser) {
                      dispatchUnit(freeCruiser.id, inc.id, inc.junctionId);
                      activateGreenCorridor(freeCruiser.id, inc.id, freeCruiser.currentJunctionId, inc.junctionId, inc.phase);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#4F8CFF] text-white font-semibold hover:bg-[#3d7ae8] cursor-pointer flex items-center space-x-1.5"
                >
                  <Siren className="w-3.5 h-3.5" />
                  <span>DISPATCH CRUISER</span>
                </button>

                <button
                  onClick={() => {
                    const assignedCruiser = policeUnits.find((u) => u.assignedIncidentId === inc.id);
                    if (assignedCruiser) {
                      updateUnitState(assignedCruiser.id, 'En route');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#151C2E] text-[#FFB547] border border-[var(--border)] font-semibold hover:bg-[#1e2638] cursor-pointer"
                >
                  SET EN ROUTE
                </button>

                <button
                  onClick={() => {
                    const assignedCruiser = policeUnits.find((u) => u.assignedIncidentId === inc.id);
                    if (assignedCruiser) {
                      updateUnitState(assignedCruiser.id, 'On scene');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#151C2E] text-[#2EE6A6] border border-[var(--border)] font-semibold hover:bg-[#1e2638] cursor-pointer"
                >
                  SET ON SCENE
                </button>

                <button
                  onClick={() => {
                    resolveIncident(inc.id);
                    const assignedCruiser = policeUnits.find((u) => u.assignedIncidentId === inc.id);
                    if (assignedCruiser) {
                      updateUnitState(assignedCruiser.id, 'Available');
                      deactivateGreenCorridor('Incident Cleared by Police');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#2EE6A6] text-[#07090F] font-semibold hover:bg-[#25be89] cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>RESOLVE & CLEAR ROAD</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Public Safety Warning Card */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-4">
        <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2">
          <BadgeAlert className="w-5 h-5 text-[#FFB547]" />
          <span>Broadcast Public Road Safety Warning (V2X & Citizen Feed)</span>
        </h3>
        <p className="text-xs text-[#8A94A9]">
          Issue emergency arterial detour warnings or speed limit advisories directly to the Citizen / Driver Companion companion screen.
        </p>

        <form onSubmit={handleBroadcast} className="flex gap-3">
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="e.g. Extreme caution at J1 Central approach: emergency responders on scene, reduce speed to 25 km/h..."
            className="flex-1 bg-[#07090F] border border-[var(--border)] focus:border-[#4F8CFF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8A94A9]/50 outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#4F8CFF] text-white hover:bg-[#3d7ae8] cursor-pointer flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast</span>
          </button>
        </form>

        {broadcastSent && (
          <div className="p-3 rounded-xl bg-[#2EE6A6]/20 border border-[#2EE6A6] text-xs text-[#2EE6A6] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Safety advisory broadcasted to all connected citizen units.</span>
          </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
};
