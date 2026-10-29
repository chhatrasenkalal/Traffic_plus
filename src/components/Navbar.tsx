import React, { useRef, useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  BarChart3,
  Bell,
  Box,
  Check,
  ChevronDown,
  Compass,
  FileCheck,
  Flame,
  Layers,
  Lock,
  KeyRound,
  Menu,
  Moon,
  Pause,
  Play,
  Presentation,
  RotateCcw,
  Shield,
  ShieldAlert,
  Siren,
  Sliders,
  Sun,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { UserRole } from '../types';
import { PresentationGuideModal } from './PresentationGuideModal';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

interface NavItemConfig {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const {
    metrics,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    resetSimulation,
    userRole,
    setUserRole,
    activeIncidents,
    emergencyUnits,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    theme,
    toggleTheme,
    dayNightRatio,
    setDayNightRatio,
    isAdminAuthenticated,
    adminUser,
    currentUserSession,
    logoutUser,
    openAdminAuthModal,
    openAuthModalForRole,
    logoutAdmin,
  } = useSimulation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [allPagesOpen, setAllPagesOpen] = useState(false);
  const [presentationModalOpen, setPresentationModalOpen] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setAllPagesOpen(false);
  };

  const roleNotifications = notifications.filter((n) => n.targetRoles.includes(userRole));
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const rolesList: { role: UserRole; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { role: 'operator', label: 'TMC Operator', desc: 'Signal control & telemetry', icon: Sliders, color: '#2EE6A6' },
    { role: 'admin', label: 'City Admin', desc: 'Fail-safe & audit control', icon: Shield, color: '#A78BFA' },
    { role: 'police', label: 'Police Chief', desc: 'Corridor & unit command', icon: ShieldAlert, color: '#4F8CFF' },
    { role: 'emergency', label: 'EOC Dispatch', desc: 'Ambulance, Fire & Hospital', icon: Siren, color: '#FF5C6C' },
    { role: 'citizen', label: 'Driver / Citizen', desc: 'Live map & field reports', icon: User, color: '#38BDF8' },
  ];

  const currentRoleConfig = rolesList.find((r) => r.role === userRole) || rolesList[0];

  const enRouteCount = emergencyUnits.filter((u) => u.state === 'En route').length;

  // Primary top links visible in standard desktop navigation
  const primaryNavItems: NavItemConfig[] = [
    { path: '#/', label: 'Overview', icon: Compass },
    { path: '#/city', label: '3D City', icon: Box },
    { path: '#/lab', label: 'Sim Lab', icon: Activity },
    {
      path: '#/scenarios',
      label: 'Accident Sim',
      icon: AlertOctagon,
      badge: '11 SCENARIOS',
      badgeColor: '#2EE6A6',
    },
    {
      path: '#/incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: activeIncidents.length > 0 ? String(activeIncidents.length) : undefined,
      badgeColor: '#FF5C6C',
    },
    {
      path: '#/emergency',
      label: 'Emergency',
      icon: Ambulance,
      badge: enRouteCount > 0 ? `${enRouteCount} EN ROUTE` : undefined,
      badgeColor: '#2EE6A6',
    },
    { path: '#/police', label: 'Police', icon: ShieldAlert },
    { path: '#/user', label: 'Citizen', icon: User },
  ];

  // Secondary/Deep links under "More" dropdown
  const secondaryNavItems: NavItemConfig[] = [
    { path: '#/login', label: 'Login & Portals', icon: KeyRound },
    { path: '#/reports', label: 'Validation Hub', icon: FileCheck },
    { path: '#/report', label: 'Submit Report', icon: FileCheck },
    { path: '#/intelligence', label: 'TMC Intelligence', icon: BarChart3 },
    { path: '#/results', label: 'Results & Proof', icon: Shield },
    { path: '#/admin', label: 'System Admin', icon: Sliders },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[var(--border)] bg-[#07090F]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => handleNav('#/')}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#2EE6A6] p-[1.5px] shadow-lg shadow-[#4F8CFF]/20">
            <div className="w-full h-full bg-[#07090F] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#2EE6A6]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-bold text-base tracking-tight text-white">
                Traffic<span className="text-[#2EE6A6]">Pulse</span>
              </span>
              <span className="px-1 py-0.2 text-[9px] uppercase font-mono-data font-bold rounded bg-[#151C2E] text-[#8A94A9] border border-[var(--border)]">
                SIM
              </span>
            </div>
            <p className="text-[10px] text-[#8A94A9] hidden md:block">
              Adaptive Digital Twin
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1" aria-label="Main Navigation">
          {primaryNavItems.map((item) => {
            const isActive = currentRoute === item.path || (item.path === '#/' && currentRoute === '');
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'text-white bg-[#151C2E] border border-[var(--border-light)] shadow-sm'
                    : 'text-[#8A94A9] hover:text-white hover:bg-[#0E1320]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2EE6A6]' : 'text-[#8A94A9]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[9px] font-mono-data font-bold text-white uppercase"
                    style={{ backgroundColor: item.badgeColor || '#FF5C6C' }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#2EE6A6] rounded-full shadow-[0_0_8px_#2EE6A6]" />
                )}
              </button>
            );
          })}

          {/* More Views Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAllPagesOpen(!allPagesOpen)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8A94A9] hover:text-white hover:bg-[#0E1320] flex items-center space-x-1 cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {allPagesOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0E1320] border border-[var(--border-light)] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                {secondaryNavItems.map((item) => {
                  const isActive = currentRoute === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#151C2E] text-white font-semibold'
                          : 'text-[#8A94A9] hover:text-white hover:bg-[#151C2E]/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#2EE6A6]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Tools: Role Switcher + Notification Bell + Simulation Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Direct Accident Simulation Center Launcher */}
          <button
            onClick={() => handleNav('#/scenarios')}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5C6C]/15 via-[#FFB547]/15 to-[#2EE6A6]/15 border border-[#FF5C6C]/40 hover:border-[#2EE6A6] text-xs text-white hover:text-[#2EE6A6] transition-all cursor-pointer shadow-sm group"
            title="Open Accident Scenario Center (11 Visual Scenarios & Full Demo)"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-[#FF5C6C] group-hover:scale-110 transition-transform" />
            <span className="font-heading font-semibold text-xs hidden md:inline">Accident Center</span>
          </button>

          {/* Pitch & Scenarios Guide Modal Launcher */}
          <button
            onClick={() => setPresentationModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2EE6A6]/15 via-[#4F8CFF]/15 to-[#2EE6A6]/10 border border-[#2EE6A6]/40 hover:border-[#2EE6A6] text-xs text-[#2EE6A6] hover:text-white transition-all cursor-pointer shadow-sm group"
            title="Open Scenarios & Presenter Guide (All Scenarios, Tests & Verbatim Pitch)"
          >
            <Layers className="w-3.5 h-3.5 text-[#2EE6A6] group-hover:scale-110 transition-transform" />
            <span className="font-heading font-semibold text-xs hidden lg:inline">Scenarios & Guide</span>
          </button>

          {/* Day/Night / Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] text-xs text-[var(--text)] transition-all cursor-pointer shadow-sm"
            title={`Current: ${theme === 'light' ? 'Light Mode (Day)' : 'Dark Mode (Night)'} - Click to switch`}
            aria-label="Toggle Light and Dark Mode"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#FFB547]" />
                <span className="font-semibold text-xs hidden md:inline text-[var(--text)]">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#4F8CFF]" />
                <span className="font-semibold text-xs hidden md:inline text-[var(--text)]">Night</span>
              </>
            )}
          </button>

          {/* Municipal Multi-Interface Login & Authentication Hub Launcher */}
          <button
            onClick={() => handleNav('#/login')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm group ${
              currentUserSession
                ? 'bg-gradient-to-r from-[#2EE6A6]/20 via-[#4F8CFF]/15 to-[#2EE6A6]/20 border-[#2EE6A6]/50 text-[#2EE6A6] hover:border-[#2EE6A6]'
                : 'bg-[#FFB547]/10 hover:bg-[#FFB547]/20 border-[#FFB547]/30 text-[#FFB547]'
            }`}
            title={
              currentUserSession
                ? `Authenticated: ${currentUserSession.displayName} (Lvl ${currentUserSession.clearanceLevel}) - Click to open Portals Hub`
                : 'Open Multi-Interface Login & Authentication Hub'
            }
          >
            {currentUserSession ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#2EE6A6] animate-pulse" />
                <Shield className="w-3.5 h-3.5 text-[#2EE6A6]" />
                <span className="font-heading font-semibold text-xs hidden sm:inline">
                  {currentUserSession.role.toUpperCase()} (Lvl {currentUserSession.clearanceLevel})
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#FFB547]" />
                <span className="font-heading font-semibold text-xs hidden sm:inline">
                  Login Hub
                </span>
              </>
            )}
          </button>

          {/* DEMO ROLE SWITCHER */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E1320] border border-[var(--border)] hover:border-[var(--border-light)] text-xs text-white transition-all cursor-pointer"
              title="Switch simulated role persona"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentRoleConfig.color }}
              />
              <span className="text-[10px] uppercase font-mono-data text-[#8A94A9] hidden md:inline">
                Role:
              </span>
              <span className="font-semibold text-xs text-[#E8ECF5]">{currentRoleConfig.label}</span>
              <ChevronDown className="w-3 h-3 text-[#8A94A9]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0E1320] border border-[var(--border-light)] shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 border-b border-[var(--border)] mb-1">
                  <span className="text-[10px] font-mono-data text-[#8A94A9] uppercase block font-bold">
                    Demo Role Switcher (Simulated)
                  </span>
                  <p className="text-[10px] text-[#8A94A9]">
                    Filters notifications &amp; operational views
                  </p>
                </div>
                {rolesList.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.role === userRole;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        setUserRole(r.role);
                        setRoleDropdownOpen(false);
                        if (r.role === 'admin' && !isAdminAuthenticated) {
                          openAdminAuthModal();
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#151C2E] border border-[var(--border-light)]'
                          : 'hover:bg-[#151C2E]/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="p-1.5 rounded-lg bg-black/40"
                          style={{ color: r.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{r.label}</div>
                          <div className="text-[10px] text-[#8A94A9]">{r.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2EE6A6]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* NOTIFICATION CENTER */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-xl bg-[#0E1320] border border-[var(--border)] text-[#8A94A9] hover:text-white transition-colors cursor-pointer"
              aria-label="Notification Center"
              title="Notification Center (Role Filtered)"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5C6C] text-white font-mono-data text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0E1320] border border-[var(--border-light)] shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#4F8CFF]" />
                    <span className="font-heading font-bold text-xs text-white">
                      Notifications ({currentRoleConfig.label})
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] text-[#2EE6A6] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {roleNotifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8A94A9]">
                      No notifications for {currentRoleConfig.label}
                    </div>
                  ) : (
                    roleNotifications.slice(0, 8).map((n) => {
                      const isCritical = n.severity === 'CRITICAL';
                      const isHigh = n.severity === 'HIGH';
                      return (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            !n.read ? 'bg-[#151C2E]' : 'bg-[#07090F]'
                          } ${
                            isCritical
                              ? 'border-[#FF5C6C]/40 text-white'
                              : isHigh
                              ? 'border-[#FFB547]/40 text-white'
                              : 'border-[var(--border)] text-[#E8ECF5]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[9px] font-mono-data font-bold px-1.5 py-0.2 rounded uppercase ${
                                isCritical
                                  ? 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                                  : isHigh
                                  ? 'bg-[#FFB547]/20 text-[#FFB547]'
                                  : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                              }`}
                            >
                              {n.severity}
                            </span>
                            <span className="text-[10px] font-mono-data text-[#8A94A9]">
                              {n.timestamp}
                            </span>
                          </div>
                          <h5 className="font-semibold text-xs text-white">{n.title}</h5>
                          <p className="text-[11px] text-[#8A94A9] mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Sim Pill (Clock + Speed + Play/Pause) */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#0E1320] border border-[var(--border)] text-xs">
            <span className="relative flex h-2 w-2">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EE6A6] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isPlaying ? 'bg-[#2EE6A6]' : 'bg-[#FFB547]'
                }`}
              />
            </span>
            <span className="font-mono-data text-xs text-[#E8ECF5] font-medium">
              {metrics.timeOfDayString}
            </span>

            {/* Speed toggle pills */}
            <div className="flex items-center bg-[#151C2E] rounded-md p-0.5 border border-[var(--border)]">
              {([1, 5, 20] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono-data font-semibold rounded cursor-pointer transition-colors ${
                    speed === s ? 'bg-[#4F8CFF] text-white' : 'text-[#8A94A9] hover:text-[#E8ECF5]'
                  }`}
                  title={`${s}x speed`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
              className="p-1 text-[#8A94A9] hover:text-white rounded hover:bg-[#151C2E] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#2EE6A6]" />}
            </button>

            {/* Reset */}
            <button
              onClick={resetSimulation}
              aria-label="Reset Simulation"
              title="Reset Simulation"
              className="p-1 text-[#8A94A9] hover:text-white rounded hover:bg-[#151C2E] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center xl:hidden space-x-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label="Toggle Play"
              className="p-2 rounded-lg bg-[#0E1320] border border-[var(--border)] text-[#8A94A9] hover:text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#2EE6A6]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg bg-[#0E1320] border border-[var(--border)] text-[#8A94A9] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-4 pt-2 pb-5 space-y-1 bg-[#0E1320] border-b border-[var(--border)] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#2EE6A6]" />
              <span className="text-xs font-mono-data text-[#E8ECF5]">{metrics.timeOfDayString}</span>
              <span className="text-xs text-[#8A94A9]">({speed}x)</span>
            </div>
            <div className="flex items-center space-x-1">
              {([1, 5, 20] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs font-mono-data rounded ${
                    speed === s ? 'bg-[#4F8CFF] text-white' : 'bg-[#151C2E] text-[#8A94A9]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Admin Authentication Quick Launch in Mobile */}
          <div className="pb-3 mb-2 border-b border-[var(--border)]">
            <button
              onClick={() => {
                openAdminAuthModal();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-heading font-bold cursor-pointer transition-all ${
                isAdminAuthenticated
                  ? 'bg-gradient-to-r from-[#2EE6A6]/20 to-[#4F8CFF]/20 border-[#2EE6A6]/50 text-[#2EE6A6]'
                  : 'bg-[#FFB547]/15 border-[#FFB547]/40 text-[#FFB547]'
              }`}
            >
              {isAdminAuthenticated ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#2EE6A6] animate-pulse" />
                  <Shield className="w-4 h-4 text-[#2EE6A6]" />
                  <span>Admin Session Active (Lvl 5) — Manage / Sign Out</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#FFB547]" />
                  <span>Admin Authentication (Passcode / Credentials)</span>
                </>
              )}
            </button>
          </div>

          {/* Pitch Guide Quick Launch in Mobile */}
          <div className="pb-3 mb-2 border-b border-[var(--border)]">
            <button
              onClick={() => {
                setPresentationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2EE6A6]/20 to-[#4F8CFF]/20 border border-[#2EE6A6]/40 text-xs font-heading font-bold text-[#2EE6A6] cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#2EE6A6]" />
              <span>All Scenarios &amp; Presenter Guide</span>
            </button>
          </div>

          {/* Quick role tabs in mobile */}
          <div className="pb-3 mb-2 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-data text-[#8A94A9] uppercase font-bold">
                Simulation Mode
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[var(--elevated)] border border-[var(--border)] text-xs text-[var(--text)] font-semibold cursor-pointer"
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#FFB547]" />
                    <span>Day Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#4F8CFF]" />
                    <span>Night Mode</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[10px] font-mono-data text-[#8A94A9] uppercase block mb-1">
              Active Role Persona
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => setUserRole(r.role)}
                  className={`p-1.5 rounded-lg text-xs font-medium text-left truncate cursor-pointer ${
                    userRole === r.role
                      ? 'bg-[#151C2E] text-white border border-[var(--border-light)]'
                      : 'bg-[#07090F] text-[#8A94A9]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="grid grid-cols-2 gap-1">
            {allNavItems.map((item) => {
              const isActive = currentRoute === item.path || (item.path === '#/' && currentRoute === '');
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#151C2E] text-white border border-[var(--border-light)] font-semibold'
                      : 'text-[#8A94A9] hover:text-white hover:bg-[#151C2E]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2EE6A6]' : 'text-[#8A94A9]'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className="px-1 py-0.2 rounded text-[8px] font-mono-data font-bold text-white uppercase ml-auto"
                      style={{ backgroundColor: item.badgeColor || '#FF5C6C' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Pitch & Presenter Guide Modal */}
      <PresentationGuideModal
        isOpen={presentationModalOpen}
        onClose={() => setPresentationModalOpen(false)}
        navigate={navigate}
      />
    </header>
  );
};
