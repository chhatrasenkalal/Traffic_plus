import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  Siren,
  Sliders,
  User,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Building2,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
  Fingerprint,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { UserRole } from '../types';

interface LoginPageProps {
  navigate: (route: string) => void;
}

interface InterfaceProfile {
  id: UserRole;
  label: string;
  tagline: string;
  agency: string;
  clearance: string;
  clearanceLevel: number;
  route: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  badgeField: string;
  defaultUser: string;
  defaultPasscode: string;
  defaultBadge: string;
  description: string;
  privileges: string[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const {
    currentUserSession,
    loginInterface,
    logoutUser,
    isInterfaceAuthenticated,
  } = useSimulation();

  const INTERFACES: InterfaceProfile[] = [
    {
      id: 'admin',
      label: 'City Administrator',
      tagline: 'Fail-Safe Control & Audit Console',
      agency: 'City Department of Transportation (CDOT) & Municipal Ops',
      clearance: 'Level 5 (Root TMC)',
      clearanceLevel: 5,
      route: '#/admin',
      icon: Shield,
      color: '#A78BFA',
      badgeField: 'Director Clearance ID',
      defaultUser: 'admin',
      defaultPasscode: 'pulse2026',
      defaultBadge: 'DIR-01',
      description: 'Root access to inject synthetic incidents, tune adaptive timing, override phase durations, and reinitialize digital twin.',
      privileges: [
        '17-Type Synthetic Incident Injector',
        'Adaptive Timing Cycle Modifiers',
        'Edge Sensor Failure Simulators',
        'Root Cryptographic Audit Logs',
      ],
    },
    {
      id: 'police',
      label: 'Police Commander',
      tagline: 'Arterial Safety & Cruiser CAD',
      agency: 'Metro Police Department (MPD) Traffic Division',
      clearance: 'Level 4 (Law Enforcement CAD)',
      clearanceLevel: 4,
      route: '#/police',
      icon: ShieldAlert,
      color: '#4F8CFF',
      badgeField: 'Officer Badge Number',
      defaultUser: 'police',
      defaultPasscode: 'police2026',
      defaultBadge: 'BADGE #704 (Precinct 4)',
      description: 'Patrol cruiser CAD fleet dispatching, roadway closure enforcement, emergency roadblock actuation, and public safety advisories.',
      privileges: [
        'Cruiser CAD Fleet Dispatching',
        'Emergency Roadblock Directives',
        'Priority Arterial Preemption',
        'Citywide Police Broadcast Advisories',
      ],
    },
    {
      id: 'emergency',
      label: 'Emergency Dispatcher',
      tagline: 'EOC CAD & Hospital Coordination',
      agency: 'Emergency Operations Center & Paramedic EMS Command',
      clearance: 'Level 4 (Emergency Medical & Fire CAD)',
      clearanceLevel: 4,
      route: '#/emergency',
      icon: Siren,
      color: '#FF5C6C',
      badgeField: 'CAD Terminal Callsign',
      defaultUser: 'emergency',
      defaultPasscode: 'medic2026',
      defaultBadge: 'CALLSIGN MEDIC-1 CAD',
      description: 'Multi-agency ambulance and fire engine dispatch, hospital triage capacity matching, and dynamic Green Corridor preemption.',
      privileges: [
        'Ambulance & Fire CAD Dispatch',
        'Dynamic Green Corridor Actuation',
        'Traffic-Calibrated Hospital Matching',
        'Triage Unit State Tracking',
      ],
    },
    {
      id: 'operator',
      label: 'TMC Traffic Operator',
      tagline: 'Signal Control & Telemetrics',
      agency: 'Traffic Management Center Operations (TMC)',
      clearance: 'Level 3 (Signal Actuation & Telemetry)',
      clearanceLevel: 3,
      route: '#/intelligence',
      icon: Sliders,
      color: '#2EE6A6',
      badgeField: 'Console Station ID',
      defaultUser: 'operator',
      defaultPasscode: 'tmc2026',
      defaultBadge: 'CONSOLE-A (Shift 1)',
      description: 'Real-time junction queue monitoring, multi-sensor telemetry fusion, adaptive vs fixed benchmark lab, and AI diagnostic insights.',
      privileges: [
        'Signal Timing Actuation Console',
        'Multi-Sensor Fusion Engine',
        'Simulation Lab Benchmarking',
        'AI Diagnostic Insights Generation',
      ],
    },
    {
      id: 'citizen',
      label: 'Commuter / Citizen',
      tagline: 'Live Map & Incident Reports',
      agency: 'Metropolitan Public Commuter Portal',
      clearance: 'Level 1 (Public Access & Reports)',
      clearanceLevel: 1,
      route: '#/user',
      icon: User,
      color: '#38BDF8',
      badgeField: 'Civic Commuter ID',
      defaultUser: 'citizen',
      defaultPasscode: 'citizen2026',
      defaultBadge: 'CIVIC-ID-8820',
      description: 'Metropolitan commuter traffic map, arterial delay advisories, weather warnings, detour routes, and citizen hazard reporting.',
      privileges: [
        'Real-Time Arterial Congestion View',
        'Weather & Detour Route Advisories',
        'Citizen Incident Field Reporting',
        'Transparent Audit & Results Access',
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState<UserRole>('admin');
  const [username, setUsername] = useState<string>('admin');
  const [passcode, setPasscode] = useState<string>('pulse2026');
  const [badgeId, setBadgeId] = useState<string>('DIR-01');
  const [mfaCode, setMfaCode] = useState<string>('982041');
  const [authError, setAuthError] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);

  const currentProfile = INTERFACES.find((i) => i.id === activeTab) || INTERFACES[0];

  const handleSelectInterface = (profile: InterfaceProfile) => {
    setActiveTab(profile.id);
    setUsername(profile.defaultUser);
    setPasscode(profile.defaultPasscode);
    setBadgeId(profile.defaultBadge);
    setAuthError('');
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = loginInterface(activeTab, username, passcode, {
      badge: badgeId,
      mfaCode,
    });

    if (res.success) {
      navigate(currentProfile.route);
    } else {
      setAuthError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemoSign = (profile: InterfaceProfile) => {
    setActiveTab(profile.id);
    setUsername(profile.defaultUser);
    setPasscode(profile.defaultPasscode);
    setBadgeId(profile.defaultBadge);
    setAuthError('');
    loginInterface(profile.id, profile.defaultUser, profile.defaultPasscode, {
      badge: profile.defaultBadge,
      mfaCode: '982041',
    });
    navigate(profile.route);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#E8ECF5]">
      {/* Page Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[var(--border)]">
        <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#4F8CFF] uppercase tracking-wider px-3 py-1 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/25 font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Unified Municipal Access Gateway</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Role &amp; Interface Authentication Center
        </h1>
        <p className="text-sm text-[#8A94A9] max-w-2xl mx-auto">
          Authenticate credentials for each dedicated municipal interface: City Administrator, Police Command, EOC Emergency Dispatch, TMC Operations, or Public Commuter.
        </p>

        {/* Simulation Notice */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#FFB547]/10 border border-[#FFB547]/30 text-xs text-[#FFB547]">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Simulated RBAC Authentication Console — Evaluator demo passwords enabled.</span>
        </div>
      </div>

      {/* Active Session Ribbon (if authenticated) */}
      {currentUserSession && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2EE6A6]/15 via-[#0E1424] to-[#4F8CFF]/15 border border-[#2EE6A6]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#2EE6A6]/20 border border-[#2EE6A6]/40 flex items-center justify-center text-[#2EE6A6] flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">
                  {currentUserSession.displayName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#2EE6A6]/20 text-[#2EE6A6] font-mono-data font-bold border border-[#2EE6A6]/30 text-[10px]">
                  LVL {currentUserSession.clearanceLevel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-[#8A94A9] mt-0.5">
                <span>
                  Agency: <strong className="text-white">{currentUserSession.agency}</strong>
                </span>
                <span>•</span>
                <span>
                  Callsign: <strong className="text-[#4F8CFF] font-mono-data">{currentUserSession.badgeOrCallsign || 'Authorized'}</strong>
                </span>
                <span>•</span>
                <span>
                  Token: <strong className="text-white font-mono-data">{currentUserSession.token}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-center">
            <button
              onClick={() => {
                const target = INTERFACES.find((i) => i.id === currentUserSession.role) || INTERFACES[0];
                navigate(target.route);
              }}
              className="py-2 px-3.5 rounded-xl bg-[#4F8CFF] hover:bg-[#3D7AEE] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-[#4F8CFF]/20"
            >
              <span>Launch Active Interface</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logoutUser}
              className="py-2 px-3.5 rounded-xl bg-[#FF5C6C]/15 hover:bg-[#FF5C6C] text-[#FF5C6C] hover:text-white border border-[#FF5C6C]/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Multi-Interface Selector & Login Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 5 Interface Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <span className="text-xs font-mono-data text-[#8A94A9] uppercase font-bold tracking-wider">
              Select Municipal Interface (5 Roles)
            </span>
            <span className="text-[11px] text-[#4F8CFF]">Click to switch</span>
          </div>

          <div className="space-y-2.5">
            {INTERFACES.map((profile) => {
              const Icon = profile.icon;
              const isSelected = activeTab === profile.id;
              const isAuthed = isInterfaceAuthenticated(profile.id);

              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectInterface(profile)}
                  className={`w-full p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0E1424] to-[#151C2E] border-[#4F8CFF] shadow-lg shadow-[#4F8CFF]/10'
                      : 'bg-[#080B14] border-[var(--border)] hover:border-[var(--border-light)] hover:bg-[#0E1320]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${profile.color}20`, color: profile.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-heading font-bold text-sm text-white">
                            {profile.label}
                          </span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-mono-data font-bold uppercase"
                            style={{ backgroundColor: `${profile.color}25`, color: profile.color }}
                          >
                            LVL {profile.clearanceLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A94A9] mt-0.5 line-clamp-1">
                          {profile.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      {isAuthed ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#2EE6A6]/20 text-[#2EE6A6] text-[10px] font-mono-data font-bold border border-[#2EE6A6]/30">
                          AUTHENTICATED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#8A94A9] text-[10px] font-mono-data border border-[var(--border)]">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Fast Auth Button inside card */}
                  <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                    <span className="text-[#8A94A9] text-[10px] truncate max-w-[180px]">
                      Route: <code className="text-white font-mono-data">{profile.route}</code>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDemoSign(profile);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#2EE6A6] hover:text-[#07090F] bg-[#2EE6A6]/10 hover:bg-[#2EE6A6] border border-[#2EE6A6]/30 transition-colors cursor-pointer flex items-center space-x-1"
                      title={`Fast 1-click login and redirect to ${profile.label}`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>⚡ 1-Click Login</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Interface Authentication Gate */}
        <div className="lg:col-span-7">
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-[var(--border-light)] bg-gradient-to-b from-[#0E1424] to-[#07090F] shadow-2xl space-y-6">
            {/* Header of Active Form */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center space-x-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${currentProfile.color}25`, color: currentProfile.color }}
                >
                  <currentProfile.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded-full bg-[#4F8CFF]/15 text-[#4F8CFF] font-bold border border-[#4F8CFF]/30">
                      {currentProfile.clearance}
                    </span>
                    <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded-full bg-[#2EE6A6]/15 text-[#2EE6A6] font-semibold border border-[#2EE6A6]/30">
                      TARGET: {currentProfile.route}
                    </span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-white mt-1">
                    {currentProfile.label} Authentication
                  </h2>
                  <p className="text-xs text-[#8A94A9]">
                    {currentProfile.agency}
                  </p>
                </div>
              </div>
            </div>

            {/* Privileges Brief */}
            <div className="p-3.5 rounded-xl bg-[#080B14] border border-[var(--border)] space-y-1.5 text-xs">
              <span className="text-[10px] font-mono-data text-[#8A94A9] uppercase font-bold block">
                Privileges Unlocked on {currentProfile.label} Interface:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#E8ECF5]">
                {currentProfile.privileges.map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2EE6A6] flex-shrink-0" />
                    <span className="truncate">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/40 text-xs text-[#FF5C6C] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleAuthenticate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                    Operator / Officer ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={currentProfile.defaultUser}
                      className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase">
                      Passcode / PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-[10px] text-[#4F8CFF] hover:underline"
                    >
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder={currentProfile.defaultPasscode}
                      className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5">
                    {currentProfile.badgeField}
                  </label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder={currentProfile.defaultBadge}
                    className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none font-mono-data"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1.5 flex items-center justify-between">
                    <span>2FA Security Token</span>
                    <span className="text-[10px] text-[#8A94A9] font-normal">Optional</span>
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="982041"
                      className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none font-mono-data"
                    />
                  </div>
                </div>
              </div>

              {/* Demo Credentials Info Box for Evaluators */}
              <div className="p-3.5 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/20 text-[11px] text-[#FFB547] space-y-1">
                <div className="font-semibold flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Demo Evaluation Credentials for {currentProfile.label}</span>
                </div>
                <p className="text-[#8A94A9]">
                  Username: <code className="text-white font-mono-data">{currentProfile.defaultUser}</code> • Passcode:{' '}
                  <code className="text-white font-mono-data">{currentProfile.defaultPasscode}</code>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-[#4F8CFF] hover:bg-[#3D7AEE] text-white transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#4F8CFF]/20"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Authenticate &amp; Open {currentProfile.label}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSign(currentProfile)}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-[#2EE6A6]/20 hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090F] border border-[#2EE6A6]/40 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ 1-Click Fast Auth</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
