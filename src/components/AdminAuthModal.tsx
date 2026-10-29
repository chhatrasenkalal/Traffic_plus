import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  Siren,
  Sliders,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  User,
  Fingerprint,
  Clock,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { UserRole } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate?: (route: string) => void;
}

interface RoleTabConfig {
  role: UserRole;
  label: string;
  tagline: string;
  agency: string;
  route: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  badgeLabel: string;
  defaultUser: string;
  defaultPass: string;
  defaultBadge: string;
  clearanceLevel: number;
}

const ROLE_TABS: RoleTabConfig[] = [
  {
    role: 'admin',
    label: 'City Admin',
    tagline: 'Fail-Safe Control & Audit Console',
    agency: 'City Department of Transportation (CDOT)',
    route: '#/admin',
    icon: Shield,
    color: '#A78BFA',
    badgeLabel: 'Clearance ID',
    defaultUser: 'admin',
    defaultPass: 'pulse2026',
    defaultBadge: 'DIR-01',
    clearanceLevel: 5,
  },
  {
    role: 'police',
    label: 'Police CAD',
    tagline: 'Arterial Safety & Patrol Fleet CAD',
    agency: 'Metro Police Department (MPD)',
    route: '#/police',
    icon: ShieldAlert,
    color: '#4F8CFF',
    badgeLabel: 'Badge Number',
    defaultUser: 'police',
    defaultPass: 'police2026',
    defaultBadge: 'BADGE #704',
    clearanceLevel: 4,
  },
  {
    role: 'emergency',
    label: 'Emergency EOC',
    tagline: 'Ambulance CAD & Green Corridor',
    agency: 'Emergency Operations Center & Paramedic EMS',
    route: '#/emergency',
    icon: Siren,
    color: '#FF5C6C',
    badgeLabel: 'Callsign ID',
    defaultUser: 'emergency',
    defaultPass: 'medic2026',
    defaultBadge: 'MEDIC-1 CAD',
    clearanceLevel: 4,
  },
  {
    role: 'operator',
    label: 'TMC Operator',
    tagline: 'Signal Tuning & Multi-Sensor Fusion',
    agency: 'Traffic Management Center (TMC)',
    route: '#/intelligence',
    icon: Sliders,
    color: '#2EE6A6',
    badgeLabel: 'Console Shift ID',
    defaultUser: 'operator',
    defaultPass: 'tmc2026',
    defaultBadge: 'CONSOLE-A',
    clearanceLevel: 3,
  },
  {
    role: 'citizen',
    label: 'Citizen Portal',
    tagline: 'Live Commuter Transit Advisory',
    agency: 'Metropolitan Public Commuter Portal',
    route: '#/user',
    icon: User,
    color: '#38BDF8',
    badgeLabel: 'Civic ID',
    defaultUser: 'citizen',
    defaultPass: 'citizen2026',
    defaultBadge: 'CIVIC-ID-8820',
    clearanceLevel: 1,
  },
];

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  const {
    currentUserSession,
    loginInterface,
    logoutUser,
    authModalTargetRole,
  } = useSimulation();

  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('admin');
  const [passcode, setPasscode] = useState('pulse2026');
  const [badgeVal, setBadgeVal] = useState('DIR-01');
  const [mfaCode, setMfaCode] = useState('982041');
  const [error, setError] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Sync active role with authModalTargetRole when opened
  useEffect(() => {
    if (authModalTargetRole) {
      const match = ROLE_TABS.find((t) => t.role === authModalTargetRole);
      if (match) {
        setActiveRole(match.role);
        setUsername(match.defaultUser);
        setPasscode(match.defaultPass);
        setBadgeVal(match.defaultBadge);
      }
    }
  }, [authModalTargetRole, isOpen]);

  if (!isOpen) return null;

  const currentTabConfig = ROLE_TABS.find((t) => t.role === activeRole) || ROLE_TABS[0];

  const handleSwitchTab = (tab: RoleTabConfig) => {
    setActiveRole(tab.role);
    setUsername(tab.defaultUser);
    setPasscode(tab.defaultPass);
    setBadgeVal(tab.defaultBadge);
    setError('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const res = loginInterface(activeRole, username, passcode, {
      badge: badgeVal,
      mfaCode,
    });
    if (!res.success) {
      setError(res.error || `Invalid credentials for ${currentTabConfig.label}.`);
    } else {
      onClose();
    }
  };

  const handleQuickDemoLogin = () => {
    setError('');
    loginInterface(activeRole, currentTabConfig.defaultUser, currentTabConfig.defaultPass, {
      badge: currentTabConfig.defaultBadge,
      mfaCode: '982041',
    });
    onClose();
  };

  const handleCopyToken = () => {
    if (currentUserSession?.token) {
      navigator.clipboard.writeText(currentUserSession.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleGoToPage = (route: string) => {
    onClose();
    if (navigate) {
      navigate(route);
    } else {
      window.location.hash = route;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl glass-panel-elevated rounded-2xl border border-[var(--border-light)] bg-gradient-to-b from-[#0E1424] to-[#07090F] shadow-2xl overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div className="relative px-6 pt-6 pb-4 border-b border-[var(--border)] bg-gradient-to-r from-[#4F8CFF]/10 via-transparent to-[#2EE6A6]/10 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center p-[1.5px] shadow-lg shadow-[#4F8CFF]/20"
                style={{ backgroundColor: `${currentTabConfig.color}20` }}
              >
                <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
                  <currentTabConfig.icon className="w-5 h-5" style={{ color: currentTabConfig.color }} />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono-data tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/30 font-bold">
                    Municipal Gateway
                  </span>
                  <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded-full bg-[#FFB547]/15 text-[#FFB547] border border-[#FFB547]/30">
                    SIMULATED
                  </span>
                </div>
                <h2 className="font-heading text-lg font-bold text-white mt-1">
                  TrafficPulse Role &amp; Interface Authentication
                </h2>
                <p className="text-xs text-[#8A94A9]">
                  Select an interface below to authenticate credentials
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A94A9] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close authentication modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Tabs Selector */}
          <div className="px-6 pt-4 pb-2 border-b border-[var(--border)] bg-[#07090F]/70">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ROLE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeRole === tab.role;
                return (
                  <button
                    key={tab.role}
                    onClick={() => handleSwitchTab(tab)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#151C2E] text-white border border-[var(--border-light)] shadow-sm'
                        : 'text-[#8A94A9] hover:text-white hover:bg-[#0E1320]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Authenticated State */}
            {currentUserSession ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[#2EE6A6]/10 border border-[#2EE6A6]/30 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2EE6A6] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Active Session: {currentUserSession.displayName}
                    </h4>
                    <p className="text-xs text-[#8A94A9] mt-0.5">
                      Authenticated under <strong className="text-white">{currentUserSession.agency}</strong>.
                      Clearance Level {currentUserSession.clearanceLevel}.
                    </p>
                  </div>
                </div>

                {/* Session Details Card */}
                <div className="p-4 rounded-xl bg-[#07090F] border border-[var(--border)] space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <span className="text-[#8A94A9] font-medium">Clearance Level</span>
                    <span className="px-2 py-0.5 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] font-mono-data font-bold border border-[#4F8CFF]/40">
                      LEVEL {currentUserSession.clearanceLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <span className="text-[#8A94A9] font-medium">Callsign / Badge</span>
                    <span className="font-mono-data text-white">{currentUserSession.badgeOrCallsign || 'Standard'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <span className="text-[#8A94A9] font-medium">Session Token</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-data text-white">{currentUserSession.token}</span>
                      <button
                        onClick={handleCopyToken}
                        className="p-1 rounded hover:bg-white/10 text-[#8A94A9] hover:text-white transition-colors"
                        title="Copy session token"
                      >
                        {copiedToken ? (
                          <Check className="w-3.5 h-3.5 text-[#2EE6A6]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A94A9] font-medium">Authenticated At</span>
                    <span className="font-mono-data text-white flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#FFB547]" />
                      <span>{currentUserSession.loginTime}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const match = ROLE_TABS.find((t) => t.role === currentUserSession.role) || ROLE_TABS[0];
                      handleGoToPage(match.route);
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#4F8CFF] hover:bg-[#3D7AEE] text-white transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#4F8CFF]/20"
                  >
                    <span>Launch Dedicated Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={logoutUser}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#FF5C6C]/15 hover:bg-[#FF5C6C] text-[#FF5C6C] hover:text-white border border-[#FF5C6C]/30 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Unauthenticated Login Form */
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Notice */}
                <div className="p-3 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/25 text-xs text-[#E8ECF5] flex items-start space-x-2.5">
                  <Lock className="w-4 h-4 text-[#4F8CFF] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {currentTabConfig.label} Authentication Gateway
                    </span>
                    <p className="text-[#8A94A9] mt-0.5">
                      {currentTabConfig.tagline}. Level {currentTabConfig.clearanceLevel} clearance.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/40 text-xs text-[#FF5C6C] flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1">
                      Username / Officer ID
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-[#8A94A9]" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={currentTabConfig.defaultUser}
                        className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
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
                        placeholder={currentTabConfig.defaultPass}
                        className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8A94A9] uppercase mb-1">
                      {currentTabConfig.badgeLabel}
                    </label>
                    <input
                      type="text"
                      value={badgeVal}
                      onChange={(e) => setBadgeVal(e.target.value)}
                      placeholder={currentTabConfig.defaultBadge}
                      className="w-full bg-[#07090F] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8A94A9]/50 focus:border-[#4F8CFF] outline-none font-mono-data"
                    />
                  </div>
                </div>

                {/* Quick Hint / Demo Credentials Box */}
                <div className="p-3 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/20 text-[11px] text-[#FFB547] space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Demo Credentials for {currentTabConfig.label}</span>
                  </div>
                  <p className="text-[#8A94A9]">
                    Username: <code className="text-white font-mono-data">{currentTabConfig.defaultUser}</code> • Passcode:{' '}
                    <code className="text-white font-mono-data">{currentTabConfig.defaultPass}</code>
                  </p>
                </div>

                {/* Submit & Quick Demo Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#4F8CFF] hover:bg-[#3D7AEE] text-white transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-[#4F8CFF]/20"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Authenticate &amp; Launch</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2EE6A6]/20 hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090F] border border-[#2EE6A6]/40 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>⚡ 1-Click Fast Auth</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
