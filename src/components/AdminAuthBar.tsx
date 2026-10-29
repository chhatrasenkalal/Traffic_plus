import React from 'react';
import {
  Shield,
  ShieldAlert,
  Siren,
  Sliders,
  User,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  LogOut,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { UserRole } from '../types';

interface AdminAuthBarProps {
  pageName?: string;
  navigate?: (route: string) => void;
  compact?: boolean;
}

export const AdminAuthBar: React.FC<AdminAuthBarProps> = ({
  pageName = 'This Page',
  navigate,
  compact = false,
}) => {
  const {
    currentUserSession,
    isInterfaceAuthenticated,
    openAuthModalForRole,
    logoutUser,
  } = useSimulation();

  // Determine required role for the current page
  let requiredRole: UserRole = 'operator';
  let roleLabel = 'TMC Operations';
  let roleIcon = Sliders;
  let roleColor = '#2EE6A6';

  const lowerName = pageName.toLowerCase();
  if (lowerName.includes('police')) {
    requiredRole = 'police';
    roleLabel = 'Police Command';
    roleIcon = ShieldAlert;
    roleColor = '#4F8CFF';
  } else if (lowerName.includes('emergency')) {
    requiredRole = 'emergency';
    roleLabel = 'EOC Emergency Dispatch';
    roleIcon = Siren;
    roleColor = '#FF5C6C';
  } else if (lowerName.includes('admin')) {
    requiredRole = 'admin';
    roleLabel = 'City Administrator';
    roleIcon = Shield;
    roleColor = '#A78BFA';
  } else if (lowerName.includes('citizen') || lowerName.includes('commuter') || lowerName.includes('report submission')) {
    requiredRole = 'citizen';
    roleLabel = 'Public Commuter';
    roleIcon = User;
    roleColor = '#38BDF8';
  }

  const isAuthed = isInterfaceAuthenticated(requiredRole);
  const Icon = isAuthed ? CheckCircle2 : roleIcon;

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs">
        {isAuthed && currentUserSession ? (
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#2EE6A6]/10 border border-[#2EE6A6]/30 text-[#2EE6A6]">
            <span className="w-2 h-2 rounded-full bg-[#2EE6A6] animate-pulse" />
            <span className="font-semibold text-[11px]">{currentUserSession.displayName}</span>
            <button
              onClick={logoutUser}
              className="ml-1 text-[10px] text-[#8A94A9] hover:text-[#FF5C6C] underline cursor-pointer"
              title="Sign out of current interface"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModalForRole(requiredRole)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FFB547]/10 hover:bg-[#FFB547]/20 border border-[#FFB547]/30 text-[#FFB547] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>{roleLabel} Login</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full transition-all duration-200">
      <div
        className={`rounded-xl border transition-all ${
          isAuthed
            ? 'bg-gradient-to-r from-[#2EE6A6]/10 via-[#0E1424] to-[#4F8CFF]/10 border-[#2EE6A6]/30 shadow-lg shadow-[#2EE6A6]/5'
            : 'bg-gradient-to-r from-[#FFB547]/10 via-[#0B0F1C] to-[#07090F] border-[#FFB547]/25'
        } p-3 sm:px-4 text-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isAuthed
                  ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]'
                  : 'bg-[#FFB547]/20 text-[#FFB547]'
              }`}
            >
              {isAuthed ? <Shield className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>

            <div className="leading-tight">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-[12px]">
                  {isAuthed
                    ? `${roleLabel} Authentication Active`
                    : `${roleLabel} Interface Authentication`}
                </span>
                <span
                  className={`text-[10px] font-mono-data px-1.5 py-0.2 rounded font-semibold ${
                    isAuthed
                      ? 'bg-[#2EE6A6]/20 text-[#2EE6A6]'
                      : 'bg-[#FFB547]/20 text-[#FFB547]'
                  }`}
                >
                  {isAuthed
                    ? `LVL ${currentUserSession?.clearanceLevel || 3} CLEARANCE`
                    : 'UNAUTHENTICATED / GUEST'}
                </span>
              </div>
              <p className="text-[11px] text-[#8A94A9] mt-0.5">
                {isAuthed
                  ? `Authenticated as ${currentUserSession?.displayName || 'Authorized User'} (${currentUserSession?.badgeOrCallsign || 'Standard'}). Full interactive controls enabled for ${pageName}.`
                  : `Viewing ${pageName}. Enter credentials or use fast sign-in to unlock CAD dispatches & telemetry overrides.`}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            {isAuthed ? (
              <>
                <button
                  onClick={() => {
                    if (navigate) navigate('#/login');
                    else window.location.hash = '#/login';
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#4F8CFF]/15 hover:bg-[#4F8CFF] text-[#4F8CFF] hover:text-white border border-[#4F8CFF]/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1.5"
                  title="Switch interface or inspect multi-role credentials"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Portals</span>
                </button>
                <button
                  onClick={() => openAuthModalForRole(requiredRole)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#E8ECF5] text-[11px] font-medium border border-[var(--border)] transition-colors cursor-pointer"
                  title="Inspect session token & permissions"
                >
                  Session
                </button>
                <button
                  onClick={logoutUser}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FF5C6C]/15 hover:bg-[#FF5C6C] text-[#FF5C6C] hover:text-white border border-[#FF5C6C]/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                  title="Lock session"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (navigate) navigate('#/login');
                    else window.location.hash = '#/login';
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8A94A9] hover:text-white border border-[var(--border)] text-[11px] font-medium transition-colors cursor-pointer"
                >
                  All Portals
                </button>
                <button
                  onClick={() => openAuthModalForRole(requiredRole)}
                  className="px-3 py-1.5 rounded-lg bg-[#FFB547] hover:bg-[#FFA31A] text-[#07090F] font-bold text-[11px] shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Authenticate {roleLabel}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
