import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  Database,
  EyeOff,
  Flame,
  KeyRound,
  Lock,
  Radio,
  RotateCcw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Unlock,
  Users,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { IncidentType, PhaseId } from '../types';
import { INITIAL_ADAPTIVE_CONFIG } from '../lib/simulator';

export const AdminPage: React.FC = () => {
  const {
    metrics,
    adaptiveConfig,
    updateAdaptiveConfig,
    setRushMultiplier,
    injectIncident,
    resetSimulation,
    reports,
    updateReportStatus,
    dataSources,
    toggleDataSource,
    auditLogs,
    weather,
    setWeather,
    isAdminAuthenticated,
    adminUser,
    loginAdmin,
    logoutAdmin,
  } = useSimulation();

  // Local form state for in-page auth gate
  const [usernameInput, setUsernameInput] = useState<string>('admin');
  const [passcodeInput, setPasscodeInput] = useState<string>('pulse2026');
  const [mfaInput, setMfaInput] = useState<string>('982041');
  const [authError, setAuthError] = useState<string>('');

  // Comprehensive incident injector state (all 17 types)
  const [injectType, setInjectType] = useState<IncidentType>('crash');
  const [injectJunction, setInjectJunction] = useState<string>('J1_CENTRAL');
  const [injectPhase, setInjectPhase] = useState<PhaseId>('phaseA');
  const [injectDirection, setInjectDirection] = useState<'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound'>('Northbound');
  const [injectVehicles, setInjectVehicles] = useState<number>(2);
  const [injectLanes, setInjectLanes] = useState<number>(1);
  const [injectPeople, setInjectPeople] = useState<number>(2);
  const [injectFire, setInjectFire] = useState<boolean>(false);
  const [injectTitle, setInjectTitle] = useState<string>('Two-Car T-Bone Collision');

  // Audit log filter
  const [auditSearch, setAuditSearch] = useState<string>('');

  const INCIDENT_TYPE_OPTIONS: IncidentType[] = [
    'crash',
    'multi-vehicle collision',
    'road blockage',
    'breakdown',
    'wrong-way vehicle',
    'sudden jam',
    'signal failure',
    'construction',
    'lane closure',
    'flood',
    'fog/low visibility',
    'fire',
    'pedestrian crowd',
    'event traffic',
    'railway crossing',
    'power outage',
    'emergency request',
  ];

  const handleInPageUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = loginAdmin(usernameInput, passcodeInput, mfaInput);
    if (!res.success) {
      setAuthError(res.error || 'Invalid credentials. Try: admin / pulse2026');
    }
  };

  const handleQuickDemoUnlock = () => {
    setUsernameInput('admin');
    setPasscodeInput('pulse2026');
    setMfaInput('982041');
    setAuthError('');
    loginAdmin('admin', 'pulse2026', '982041');
  };

  const handleResetDefaults = () => {
    updateAdaptiveConfig(INITIAL_ADAPTIVE_CONFIG);
    setRushMultiplier(1.0);
  };

  const handleTriggerCustomIncident = (e: React.FormEvent) => {
    e.preventDefault();
    injectIncident({
      type: injectType,
      title: injectTitle || `${injectType.toUpperCase()} at ${injectJunction}`,
      junctionId: injectJunction,
      phase: injectPhase,
      direction: injectDirection,
      vehiclesInvolved: injectVehicles,
      blockedLanes: injectLanes,
      peopleInvolved: injectPeople,
      fireSmokePresent: injectFire,
      autoDispatch: true,
    });
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#E8ECF5]">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#FFB547] uppercase tracking-wider mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>System Operator & Fail-Safe Console</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white">
          Operator Administration & Audit Hub
        </h1>
        <p className="text-sm text-[#8A94A9] mt-1 max-w-2xl">
          Multi-type incident injection, edge data-source failure toggles, safety interlock audits, and adaptive cycle tuning.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-[#FFB547]/10 border border-[#FFB547]/30 p-4 rounded-xl flex items-start space-x-3 text-xs text-[#FFB547]">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">
            Simulation Environment Access
          </strong>
          <span>
            Demo console for multi-modal edge failure testing and automated incident lifecycle verification. Password gate unlocked for evaluation.
          </span>
        </div>
      </div>

      {!isAdminAuthenticated ? (
        /* Protected Admin Authentication Screen */
        <div className="max-w-xl mx-auto glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-[var(--border-light)] bg-gradient-to-b from-[#0E1424] to-[#07090F] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#4F8CFF] to-[#2EE6A6] p-[2px] shadow-lg shadow-[#4F8CFF]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center">
                <Lock className="w-7 h-7 text-[#4F8CFF]" />
              </div>
            </div>
            <h3 className="font-heading font-bold text-2xl text-white">
              Administrator Authentication
            </h3>
            <p className="text-xs text-[#8A94A9] max-w-md mx-auto">
              Level 5 clearance required to inject synthetic incidents, override traffic phase timings, toggle edge sensor fail-safes, and reinitialize the digital twin.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/40 text-xs text-[#FF5C6C] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleInPageUnlock} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                Administrator Username / Email
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                Operator Passcode
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="pulse2026 or admin"
                  className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5 flex items-center justify-between">
                <span>Simulated MFA / 2FA Passkey</span>
                <span className="text-[10px] text-[#8A94A9] font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={mfaInput}
                onChange={(e) => setMfaInput(e.target.value)}
                placeholder="982041"
                className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none font-mono-data"
              />
            </div>

            {/* Quick Credentials Info Box for Evaluators */}
            <div className="p-3.5 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/20 text-[11px] text-[#FFB547] space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Exhibition Evaluator Credentials</span>
              </div>
              <p className="text-[#8A94A9]">
                User: <code className="text-white font-mono-data">admin</code> • Passcode:{' '}
                <code className="text-white font-mono-data">pulse2026</code> or{' '}
                <code className="text-white font-mono-data">admin</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#4F8CFF] hover:bg-[#3D7AEE] text-white transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#4F8CFF]/20"
              >
                <Unlock className="w-4 h-4" />
                <span>Authenticate &amp; Unlock Console</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoUnlock}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2EE6A6]/20 hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090F] border border-[#2EE6A6]/40 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ 1-Click Demo Auth</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated Surface */
        <div className="space-y-8">
          {/* Active Administrator Session Ribbon */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2EE6A6]/15 via-[#0E1424] to-[#4F8CFF]/15 border border-[#2EE6A6]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2EE6A6]/20 border border-[#2EE6A6]/40 flex items-center justify-center text-[#2EE6A6]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">
                    {adminUser?.displayName || 'Lead Traffic Operations Administrator'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2EE6A6]/20 text-[#2EE6A6] font-mono-data font-bold border border-[#2EE6A6]/30 text-[10px]">
                    CLEARANCE LVL {adminUser?.clearanceLevel || 5}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[#8A94A9] text-[11px] mt-0.5">
                  <span>
                    Token: <strong className="text-white font-mono-data">{adminUser?.token || 'AUTH-SEC-891024'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Logged in: <strong className="text-white">{adminUser?.loginTime || 'Active'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              className="self-end sm:self-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FF5C6C]/15 hover:bg-[#FF5C6C] text-[#FF5C6C] hover:text-white border border-[#FF5C6C]/40 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Console / Sign Out</span>
            </button>
          </div>
          {/* Section 1: Complete 17-Type Incident Injector */}
          <div className="glass-panel-elevated p-6 rounded-2xl border border-[var(--border-light)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-[#FF5C6C]" />
                  <span>Comprehensive Multi-Type Incident Injector</span>
                </h3>
                <p className="text-xs text-[#8A94A9]">
                  Injects an incident through the full 5-stage pipeline with immediate emergency CAD dispatch and Green Corridor priority.
                </p>
              </div>
            </div>

            <form onSubmit={handleTriggerCustomIncident} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                    Incident Type (17 Types)
                  </label>
                  <select
                    value={injectType}
                    onChange={(e) => setInjectType(e.target.value as IncidentType)}
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl p-2.5 text-xs text-white outline-none capitalize"
                  >
                    {INCIDENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                    Target Junction Node
                  </label>
                  <select
                    value={injectJunction}
                    onChange={(e) => setInjectJunction(e.target.value)}
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="J1_CENTRAL">J1 Central Square (Main Intersection)</option>
                    <option value="J2_NORTH">J2 North Grand Arterial</option>
                    <option value="J3_WEST">J3 West Commercial Boulevard</option>
                    <option value="J4_EAST">J4 East Metro Highway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                    Approach Direction
                  </label>
                  <select
                    value={injectDirection}
                    onChange={(e) => {
                      const dir = e.target.value as any;
                      setInjectDirection(dir);
                      setInjectPhase(dir === 'Northbound' || dir === 'Southbound' ? 'phaseA' : 'phaseB');
                    }}
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="Northbound">Northbound (Phase A)</option>
                    <option value="Southbound">Southbound (Phase A)</option>
                    <option value="Eastbound">Eastbound (Phase B)</option>
                    <option value="Westbound">Westbound (Phase B)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1">
                    Vehicles Involved: {injectVehicles}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={injectVehicles}
                    onChange={(e) => setInjectVehicles(parseInt(e.target.value))}
                    className="w-full accent-[#FF5C6C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1">
                    Blocked Lanes: {injectLanes}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={injectLanes}
                    onChange={(e) => setInjectLanes(parseInt(e.target.value))}
                    className="w-full accent-[#FF5C6C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1">
                    People Involved: {injectPeople}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={injectPeople}
                    onChange={(e) => setInjectPeople(parseInt(e.target.value))}
                    className="w-full accent-[#FF5C6C]"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="inject-fire"
                    checked={injectFire}
                    onChange={(e) => setInjectFire(e.target.checked)}
                    className="accent-[#FF5C6C] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="inject-fire" className="text-xs text-white font-semibold cursor-pointer">
                    Fire / Smoke Present
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-heading font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-[#FF5C6C] to-[#FFB547] text-white hover:brightness-110 shadow-lg shadow-[#FF5C6C]/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Flame className="w-4 h-4" />
                <span>Inject Scenario & Trigger End-To-End Response</span>
              </button>
            </form>
          </div>

          {/* Section 2: Fail-Safe Data Source Drops & Provenance */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-[#4F8CFF]" />
                  <span>Fail-Safe Telemetry Controls (Data Source Drop Simulation)</span>
                </h3>
                <p className="text-xs text-[#8A94A9]">
                  Toggle data feeds offline to test fallback hierarchy (Camera Vision → Loop Sensors → Rule-Based Fallback).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono-data font-bold bg-[#151C2E] border border-[var(--border)] text-[#2EE6A6]">
                {dataSources.fallbackTier}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <strong className="text-white block">Camera Vision Feeds</strong>
                  <span className="text-[11px] text-[#8A94A9]">High-FPS Optical Detection</span>
                </div>
                <button
                  onClick={() => toggleDataSource('cameraVision', !dataSources.cameraVision)}
                  className={`p-1.5 rounded-lg text-xs font-mono-data font-bold cursor-pointer transition-colors ${
                    dataSources.cameraVision ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]' : 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                  }`}
                >
                  {dataSources.cameraVision ? 'ONLINE' : 'DROPPED'}
                </button>
              </div>

              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <strong className="text-white block">Inductive Loop Sensors</strong>
                  <span className="text-[11px] text-[#8A94A9]">In-Pavement Magnetic Loops</span>
                </div>
                <button
                  onClick={() => toggleDataSource('inductiveSensors', !dataSources.inductiveSensors)}
                  className={`p-1.5 rounded-lg text-xs font-mono-data font-bold cursor-pointer transition-colors ${
                    dataSources.inductiveSensors ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]' : 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                  }`}
                >
                  {dataSources.inductiveSensors ? 'ONLINE' : 'DROPPED'}
                </button>
              </div>

              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <strong className="text-white block">Citizen Stream Ingest</strong>
                  <span className="text-[11px] text-[#8A94A9]">Mobile Public Gateway</span>
                </div>
                <button
                  onClick={() => toggleDataSource('citizenStream', !dataSources.citizenStream)}
                  className={`p-1.5 rounded-lg text-xs font-mono-data font-bold cursor-pointer transition-colors ${
                    dataSources.citizenStream ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]' : 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                  }`}
                >
                  {dataSources.citizenStream ? 'ONLINE' : 'DROPPED'}
                </button>
              </div>

              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <strong className="text-white block">V2X Connected Vehicles</strong>
                  <span className="text-[11px] text-[#8A94A9]">DSRC / C-V2X Telemetry</span>
                </div>
                <button
                  onClick={() => toggleDataSource('v2xConnectedVehicles', !dataSources.v2xConnectedVehicles)}
                  className={`p-1.5 rounded-lg text-xs font-mono-data font-bold cursor-pointer transition-colors ${
                    dataSources.v2xConnectedVehicles ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]' : 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                  }`}
                >
                  {dataSources.v2xConnectedVehicles ? 'ONLINE' : 'DROPPED'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Adaptive Algorithm Constants */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Adaptive Cycle Constants
                </h3>
                <p className="text-xs text-[#8A94A9]">
                  Live adjustments route through the Authorized Controller service layer.
                </p>
              </div>
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#151C2E] text-[#8A94A9] hover:text-white border border-[var(--border)] flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A94A9]">Base Green Time</span>
                  <span className="font-mono-data font-bold text-[#2EE6A6]">{adaptiveConfig.baseGreen}s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={adaptiveConfig.baseGreen}
                  onChange={(e) => updateAdaptiveConfig({ baseGreen: parseInt(e.target.value) })}
                  className="w-full accent-[#2EE6A6]"
                />
              </div>

              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A94A9]">Max Extra Green</span>
                  <span className="font-mono-data font-bold text-[#4F8CFF]">+{adaptiveConfig.maxExtraGreen}s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={adaptiveConfig.maxExtraGreen}
                  onChange={(e) => updateAdaptiveConfig({ maxExtraGreen: parseInt(e.target.value) })}
                  className="w-full accent-[#4F8CFF]"
                />
              </div>

              <div className="bg-[#07090F] p-4 rounded-xl border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A94A9]">Starvation Cap</span>
                  <span className="font-mono-data font-bold text-[#FFB547]">{adaptiveConfig.maxWaitCap}s</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  value={adaptiveConfig.maxWaitCap}
                  onChange={(e) => updateAdaptiveConfig({ maxWaitCap: parseInt(e.target.value) })}
                  className="w-full accent-[#FFB547]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Live Searchable Audit Log Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#2EE6A6]" />
                  <span>Authorized Controller Audit Log ({auditLogs.length} Entries)</span>
                </h3>
                <p className="text-xs text-[#8A94A9]">
                  Immutable log recording who, what, when, and provenance result for every operational command.
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#8A94A9] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter audit log..."
                  className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8A94A9]/50 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[#8A94A9] font-mono-data text-[11px]">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Provenance Layer</th>
                    <th className="py-2.5 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono-data text-[11px]">
                  {filteredLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-[#8A94A9]">{log.timestamp}</td>
                      <td className="py-2.5 px-3 text-white font-medium">{log.actor}</td>
                      <td className="py-2.5 px-3 text-[#4F8CFF]">{log.action}</td>
                      <td className="py-2.5 px-3 text-white truncate max-w-[150px]">{log.target}</td>
                      <td className="py-2.5 px-3 text-[#8A94A9] truncate max-w-[150px]">{log.provenance}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.result === 'Success'
                              ? 'text-[#2EE6A6] bg-[#2EE6A6]/10'
                              : log.result === 'Fallback'
                              ? 'text-[#FFB547] bg-[#FFB547]/10'
                              : 'text-[#FF5C6C] bg-[#FF5C6C]/10'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reset Simulation */}
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-t-2 border-t-[#FF5C6C]">
            <div>
              <h3 className="font-heading font-bold text-base text-white">Reinitialize Digital Twin</h3>
              <p className="text-xs text-[#8A94A9]">Resets time to 08:00 AM baseline and clears queue accumulators.</p>
            </div>
            <button
              onClick={resetSimulation}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FF5C6C]/20 text-[#FF5C6C] hover:bg-[#FF5C6C] hover:text-white border border-[#FF5C6C]/40 transition-colors cursor-pointer flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Simulation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
