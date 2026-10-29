import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TrafficSimulator } from '../lib/simulator';
import {
  AdaptiveConfig,
  AdminUserSession,
  UserAuthSession,
  AuditLogEntry,
  CitizenReport,
  CitizenReportStatus,
  DataSourceStatus,
  EmergencyUnit,
  EmergencyUnitState,
  EmergencyUnitType,
  GreenCorridorState,
  Incident,
  IncidentSeverity,
  IncidentType,
  JunctionNode,
  PhaseId,
  SimulationMetrics,
  SystemNotification,
  ThemeMode,
  UserRole,
  WeatherState,
  WeatherType,
} from '../types';

// Services
import { addAuditLog, getAuditLogs } from '../services/auditLog';
import { getDataSources, toggleDataSource } from '../services/dataSource';
import {
  emergencyEngine,
  SIMULATED_HOSPITALS,
  SIMULATED_STATIONS,
} from '../services/emergency';
import { APP_EVENTS, eventBus } from '../services/eventBus';
import {
  activateGreenCorridor as triggerGreenCorridor,
  deactivateGreenCorridor as cancelGreenCorridor,
  getActiveGreenCorridor,
  tickGreenCorridor,
} from '../services/greenCorridor';
import { incidentEngine } from '../services/incidents';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  routeNotificationBySeverity,
} from '../services/notifications';
import { INITIAL_JUNCTIONS } from '../services/roadGraph';
import { userReportService } from '../services/userReports';
import { getCurrentWeather, setWeather as changeWeather } from '../services/weather';

interface SimulationContextType {
  metrics: SimulationMetrics;
  isPlaying: boolean;
  speed: 1 | 5 | 20;
  viewMode: 'adaptive' | 'fixed';
  dayNightRatio: number;
  theme: ThemeMode;
  adaptiveConfig: AdaptiveConfig;
  userRole: UserRole;
  weather: WeatherState;
  dataSources: DataSourceStatus;
  junctions: JunctionNode[];
  incidents: Incident[];
  activeIncidents: Incident[];
  reports: CitizenReport[];
  emergencyUnits: EmergencyUnit[];
  hospitals: typeof SIMULATED_HOSPITALS;
  stations: typeof SIMULATED_STATIONS;
  greenCorridor: GreenCorridorState | null;
  notifications: SystemNotification[];
  auditLogs: AuditLogEntry[];
  toast: SystemNotification | null;

  // Actions
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: 1 | 5 | 20) => void;
  setViewMode: (mode: 'adaptive' | 'fixed') => void;
  setDayNightRatio: (ratio: number) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setUserRole: (role: UserRole) => void;
  setWeather: (type: WeatherType) => void;
  setRushMultiplier: (multiplier: number) => void;
  updateAdaptiveConfig: (cfg: Partial<AdaptiveConfig>) => void;
  resetSimulation: () => void;
  toggleDataSource: (key: keyof Omit<DataSourceStatus, 'fallbackTier'>, enabled: boolean) => void;

  // Incident & Report Actions
  injectIncident: (
    paramsOrPhase:
      | PhaseId
      | {
          type: IncidentType;
          title: string;
          junctionId?: string;
          phase?: PhaseId;
          direction?: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound';
          vehiclesInvolved?: number;
          blockedLanes?: number;
          peopleInvolved?: number;
          fireSmokePresent?: boolean;
          autoDispatch?: boolean;
        },
    duration?: number
  ) => Incident;
  resolveIncident: (id: string) => void;
  addReport: (report: Parameters<typeof userReportService.submitReport>[0]) => void;
  updateReportStatus: (id: string, status: CitizenReportStatus) => void;

  // Emergency & Corridor Actions
  dispatchUnit: (unitId: string, incidentId: string, targetJunctionId: string) => void;
  updateUnitState: (unitId: string, state: EmergencyUnitState) => void;
  activateGreenCorridor: (unitId: string, incidentId: string, startJunctionId: string, targetJunctionId: string, phase?: PhaseId) => void;
  deactivateGreenCorridor: (reason?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissToast: () => void;

  // Authentication & RBAC (Multi-Interface)
  currentUserSession: UserAuthSession | null;
  isInterfaceAuthenticated: (interfaceRole: UserRole) => boolean;
  loginInterface: (
    role: UserRole,
    username: string,
    passcode: string,
    extra?: { badge?: string; agency?: string; mfaCode?: string }
  ) => { success: boolean; error?: string };
  logoutUser: () => void;
  authModalTargetRole: UserRole | null;
  openAuthModalForRole: (role?: UserRole) => void;

  // Admin Authentication (Backwards Compatibility)
  isAdminAuthenticated: boolean;
  adminUser: AdminUserSession | null;
  isAdminAuthModalOpen: boolean;
  openAdminAuthModal: () => void;
  closeAdminAuthModal: () => void;
  loginAdmin: (username: string, passcode: string, mfaCode?: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

const STORAGE_KEY_CONFIG = 'trafficpulse_adaptive_cfg_v1';
const STORAGE_KEY_ROLE = 'trafficpulse_user_role_v2';
const STORAGE_KEY_THEME = 'trafficpulse_theme_mode_v1';

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const simRef = useRef<TrafficSimulator>(new TrafficSimulator());
  const [metrics, setMetrics] = useState<SimulationMetrics>(() => simRef.current.getSnapshot());
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<1 | 5 | 20>(1);
  const [viewMode, setViewMode] = useState<'adaptive' | 'fixed'>('adaptive');
  const [dayNightRatio, setDayNightRatio] = useState<number>(0.85);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'dark';
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    } catch (e) {}
    // If switching to light mode and dayNightRatio is dark (>0.5), sync dayNightRatio to day (0.15)
    // If switching to dark mode and dayNightRatio is bright (<0.5), sync dayNightRatio to night (0.85)
    if (newTheme === 'light') {
      setDayNightRatio((prev) => (prev > 0.5 ? 0.15 : prev));
    } else {
      setDayNightRatio((prev) => (prev < 0.5 ? 0.85 : prev));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Synchronize data-theme on documentElement for CSS styling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved) return saved as UserRole;
    } catch (e) {}
    return 'operator';
  });

  const [weather, setWeatherState] = useState<WeatherState>(() => getCurrentWeather());
  const [dataSources, setDataSourcesState] = useState<DataSourceStatus>(() => getDataSources());
  const [junctions, setJunctions] = useState<JunctionNode[]>(INITIAL_JUNCTIONS);
  const [incidents, setIncidents] = useState<Incident[]>(() => incidentEngine.getAllIncidents());
  const [reports, setReports] = useState<CitizenReport[]>(() => userReportService.getAllReports());
  const [emergencyUnits, setEmergencyUnits] = useState<EmergencyUnit[]>(() => emergencyEngine.getAllUnits());
  const [greenCorridor, setGreenCorridor] = useState<GreenCorridorState | null>(() => getActiveGreenCorridor());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [toast, setToast] = useState<SystemNotification | null>(null);

  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return simRef.current.getAdaptiveConfig();
  });

  const STORAGE_KEY_USER_SESSION = 'trafficpulse_user_auth_session_v2';
  const STORAGE_KEY_ADMIN_AUTH = 'trafficpulse_admin_auth_session_v1';

  const [currentUserSession, setCurrentUserSession] = useState<UserAuthSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_USER_SESSION) || localStorage.getItem(STORAGE_KEY_USER_SESSION);
      if (saved) return JSON.parse(saved);
      const adminSaved = sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) || localStorage.getItem(STORAGE_KEY_ADMIN_AUTH);
      if (adminSaved) {
        const parsed = JSON.parse(adminSaved);
        return {
          id: parsed.id || 'ADM-01',
          username: parsed.username || 'admin',
          displayName: parsed.displayName || 'Lead Traffic Operations Administrator',
          role: 'admin',
          agency: 'City Department of Transportation (CDOT)',
          badgeOrCallsign: 'CLEARANCE-DIR-01',
          clearanceLevel: parsed.clearanceLevel || 5,
          loginTime: parsed.loginTime || 'Active',
          token: parsed.token || 'AUTH-ADMIN-891024',
        };
      }
    } catch (e) {}
    return null;
  });

  const [authModalTargetRole, setAuthModalTargetRole] = useState<UserRole | null>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  const openAuthModalForRole = useCallback((role?: UserRole) => {
    if (role) setAuthModalTargetRole(role);
    setIsAdminAuthModalOpen(true);
  }, []);

  const openAdminAuthModal = useCallback(() => {
    setAuthModalTargetRole('admin');
    setIsAdminAuthModalOpen(true);
  }, []);

  const closeAdminAuthModal = useCallback(() => {
    setIsAdminAuthModalOpen(false);
  }, []);

  const adminUser: AdminUserSession | null =
    currentUserSession && (currentUserSession.role.toLowerCase() === 'admin')
      ? {
          id: currentUserSession.id,
          username: currentUserSession.username,
          displayName: currentUserSession.displayName,
          role: currentUserSession.role,
          clearanceLevel: currentUserSession.clearanceLevel,
          loginTime: currentUserSession.loginTime,
          token: currentUserSession.token,
        }
      : null;

  const isAdminAuthenticated = !!adminUser;

  const isInterfaceAuthenticated = useCallback(
    (interfaceRole: UserRole): boolean => {
      if (!currentUserSession) return false;
      const curr = currentUserSession.role.toLowerCase();
      const target = interfaceRole.toLowerCase();
      if (curr === 'admin') return true; // Root administrator access
      if (target === 'citizen' || target === 'user') return true;
      return curr === target;
    },
    [currentUserSession]
  );

  const loginInterface = useCallback(
    (
      role: UserRole,
      username: string,
      passcode: string,
      extra?: { badge?: string; agency?: string; mfaCode?: string }
    ): { success: boolean; error?: string } => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = passcode.trim();
      const normRole = role.toLowerCase() as 'admin' | 'police' | 'emergency' | 'operator' | 'citizen' | 'user';

      // Credential validation rules per role
      let valid = false;
      let sessionData: Partial<UserAuthSession> = {};

      if (normRole === 'admin') {
        const validUsers = ['admin', 'sysadmin', 'root', 'cityadmin', 'admin@trafficpulse.city'];
        const validPasses = ['admin', 'pulse2026', 'admin123', '1234', 'trafficpulse', 'admin@2026'];
        const uOk = validUsers.includes(cleanUser) || cleanUser === 'admin';
        const pOk = validPasses.includes(cleanPass) || cleanPass === 'admin';
        if (!uOk && !pOk) return { success: false, error: 'Invalid admin credentials. Try: admin / pulse2026' };
        if (!pOk) return { success: false, error: 'Incorrect passcode. Try: pulse2026 or admin' };
        valid = true;
        sessionData = {
          id: 'ADM-01',
          displayName: 'Lead Traffic Operations Administrator',
          agency: 'City Department of Transportation (CDOT) & Municipal Ops',
          badgeOrCallsign: extra?.badge || 'CLEARANCE-DIR-01',
          clearanceLevel: 5,
          token: `AUTH-ADMIN-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      } else if (normRole === 'police') {
        const validPasses = ['police2026', 'police', '1234', 'mpd2026', 'admin', 'pulse2026'];
        if (!validPasses.includes(cleanPass) && cleanPass !== '') {
          return { success: false, error: 'Invalid police badge PIN. Try: police2026 or 1234' };
        }
        valid = true;
        sessionData = {
          id: 'POL-704',
          displayName: 'Metro Police Traffic Commander',
          agency: 'Metro Police Department (MPD) Traffic Division',
          badgeOrCallsign: extra?.badge || 'BADGE #704 (Precinct 4)',
          clearanceLevel: 4,
          token: `AUTH-POLICE-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      } else if (normRole === 'emergency') {
        const validPasses = ['medic2026', 'emergency', '1234', 'eoc2026', 'admin', 'pulse2026'];
        if (!validPasses.includes(cleanPass) && cleanPass !== '') {
          return { success: false, error: 'Invalid EOC dispatch passcode. Try: medic2026 or 1234' };
        }
        valid = true;
        sessionData = {
          id: 'EOC-101',
          displayName: 'Lead EOC Paramedic & Fire Dispatcher',
          agency: 'Emergency Operations Center & Paramedic EMS Command',
          badgeOrCallsign: extra?.badge || 'CALLSIGN MEDIC-1 CAD',
          clearanceLevel: 4,
          token: `AUTH-EMS-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      } else if (normRole === 'operator') {
        const validPasses = ['tmc2026', 'operator', '1234', 'pulse2026', 'admin'];
        if (!validPasses.includes(cleanPass) && cleanPass !== '') {
          return { success: false, error: 'Invalid TMC operator PIN. Try: tmc2026 or 1234' };
        }
        valid = true;
        sessionData = {
          id: 'TMC-42',
          displayName: 'TMC Traffic Signal Controller',
          agency: 'Traffic Management Center Operations (TMC)',
          badgeOrCallsign: extra?.badge || 'CONSOLE-A (Shift 1)',
          clearanceLevel: 3,
          token: `AUTH-TMC-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      } else {
        // Citizen / Commuter
        valid = true;
        sessionData = {
          id: 'CIT-8820',
          displayName: 'Verified Citizen Commuter',
          agency: 'Metropolitan Public Commuter Portal',
          badgeOrCallsign: extra?.badge || 'CIVIC-ID-8820',
          clearanceLevel: 1,
          token: `AUTH-CITIZEN-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      }

      const session: UserAuthSession = {
        id: sessionData.id || 'USR-01',
        username: cleanUser || normRole,
        displayName: sessionData.displayName || 'Authorized Municipal User',
        role: normRole === 'user' ? 'citizen' : normRole,
        agency: sessionData.agency || 'TrafficPulse Municipal Grid',
        badgeOrCallsign: sessionData.badgeOrCallsign,
        clearanceLevel: sessionData.clearanceLevel || 1,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        token: sessionData.token || `AUTH-TOKEN-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setCurrentUserSession(session);
      setUserRoleState(session.role);
      setIsAdminAuthModalOpen(false);

      try {
        sessionStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(session));
        localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(session));
        localStorage.setItem(STORAGE_KEY_ROLE, session.role);
        if (normRole === 'admin') {
          sessionStorage.setItem(STORAGE_KEY_ADMIN_AUTH, JSON.stringify(session));
          localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, JSON.stringify(session));
        }
      } catch (e) {}

      addAuditLog(
        session.agency,
        `${session.displayName} Session Authenticated`,
        `User ID: ${session.id} (${session.username})`,
        'RBAC Authentication Gateway',
        'Success',
        `Granted Level ${session.clearanceLevel} clearance (${session.badgeOrCallsign || 'Standard'}). Token ${session.token}.`,
        simRef.current.getSnapshot().simTime
      );

      return { success: true };
    },
    []
  );

  const loginAdmin = useCallback(
    (username: string, passcode: string, mfaCode?: string): { success: boolean; error?: string } => {
      return loginInterface('admin', username, passcode, { mfaCode });
    },
    [loginInterface]
  );

  const logoutUser = useCallback(() => {
    setCurrentUserSession(null);
    setUserRoleState('operator');
    try {
      sessionStorage.removeItem(STORAGE_KEY_USER_SESSION);
      localStorage.removeItem(STORAGE_KEY_USER_SESSION);
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      localStorage.setItem(STORAGE_KEY_ROLE, 'operator');
    } catch (e) {}

    addAuditLog(
      'Security Access Manager',
      'Municipal Session Terminated',
      'Access Gateway',
      'RBAC Authentication Gateway',
      'Success',
      'Session locked and cryptographic credentials revoked.',
      simRef.current.getSnapshot().simTime
    );
  }, []);

  const logoutAdmin = useCallback(() => {
    logoutUser();
  }, [logoutUser]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch (e) {}
  };

  const setWeather = (type: WeatherType) => {
    const w = changeWeather(type);
    setWeatherState(w);
    addAuditLog(
      'Atmospheric Simulation Engine',
      `Weather Altered: ${w.label}`,
      'Citywide Network',
      'Weather Preset Controller',
      'Success',
      `Friction factor: ${w.frictionCoefficient}, Incident risk multiplier: ${w.incidentRiskMultiplier}x`,
      simRef.current.getSimTime()
    );
  };

  // Sync eventBus subscriptions
  useEffect(() => {
    const unsubIncident = eventBus.on(APP_EVENTS.INCIDENT_DETECTED, () => {
      setIncidents(incidentEngine.getAllIncidents());
    });
    const unsubIncidentUp = eventBus.on(APP_EVENTS.INCIDENT_UPDATED, () => {
      setIncidents(incidentEngine.getAllIncidents());
    });
    const unsubIncidentRes = eventBus.on(APP_EVENTS.INCIDENT_RESOLVED, () => {
      setIncidents(incidentEngine.getAllIncidents());
    });
    const unsubReport = eventBus.on(APP_EVENTS.REPORT_SUBMITTED, () => {
      setReports(userReportService.getAllReports());
    });
    const unsubReportVal = eventBus.on(APP_EVENTS.REPORT_VALIDATED, () => {
      setReports(userReportService.getAllReports());
    });
    const unsubUnit = eventBus.on(APP_EVENTS.UNIT_DISPATCHED, () => {
      setEmergencyUnits(emergencyEngine.getAllUnits());
    });
    const unsubUnitState = eventBus.on(APP_EVENTS.UNIT_STATE_CHANGED, () => {
      setEmergencyUnits(emergencyEngine.getAllUnits());
    });
    const unsubGCAct = eventBus.on(APP_EVENTS.GREEN_CORRIDOR_ACTIVATED, (gc) => {
      setGreenCorridor(gc);
      // Synchronize Junction states
      setJunctions((prev) =>
        prev.map((j) =>
          gc.pathJunctionIds.includes(j.id)
            ? {
                ...j,
                isGreenCorridor: true,
                signalA: gc.phaseGranted === 'phaseA' ? 'green' : 'red',
                signalB: gc.phaseGranted === 'phaseB' ? 'green' : 'red',
              }
            : j
        )
      );
    });
    const unsubGCDeact = eventBus.on(APP_EVENTS.GREEN_CORRIDOR_DEACTIVATED, () => {
      setGreenCorridor(null);
      setJunctions((prev) => prev.map((j) => ({ ...j, isGreenCorridor: false })));
    });
    const unsubNotif = eventBus.on(APP_EVENTS.NOTIFICATION_EMITTED, (notif: SystemNotification) => {
      setNotifications(getNotifications());
      setToast(notif);
    });
    const unsubAudit = eventBus.on(APP_EVENTS.AUDIT_LOG_ADDED, () => {
      setAuditLogs(getAuditLogs());
    });
    const unsubDS = eventBus.on(APP_EVENTS.DATA_SOURCE_TOGGLED, (ds) => {
      setDataSourcesState(ds);
    });

    return () => {
      unsubIncident();
      unsubIncidentUp();
      unsubIncidentRes();
      unsubReport();
      unsubReportVal();
      unsubUnit();
      unsubUnitState();
      unsubGCAct();
      unsubGCDeact();
      unsubNotif();
      unsubAudit();
      unsubDS();
    };
  }, []);

  // Simulator Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(30, Math.floor(1000 / speed));

    const interval = setInterval(() => {
      if (document.hidden) return;

      simRef.current.tick();
      const currentSimTime = simRef.current.getSimTime();
      setMetrics(simRef.current.getSnapshot());

      // Progress Green Corridor clearance countdown
      const gc = tickGreenCorridor(currentSimTime);
      if (gc) {
        setGreenCorridor(gc);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const setRushMultiplier = useCallback((multiplier: number) => {
    simRef.current.setRushMultiplier(multiplier);
    setMetrics(simRef.current.getSnapshot());
  }, []);

  const updateAdaptiveConfig = useCallback((cfg: Partial<AdaptiveConfig>) => {
    simRef.current.updateAdaptiveConfig(cfg);
    const updated = simRef.current.getAdaptiveConfig();
    setAdaptiveConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch (e) {}
    setMetrics(simRef.current.getSnapshot());
  }, []);

  const resetSimulation = useCallback(() => {
    simRef.current.reset();
    setMetrics(simRef.current.getSnapshot());
    addAuditLog(
      'System Admin',
      'Simulation Reinitialized',
      'Full Metro Grid',
      'Autonomous Controller Layer',
      'Success',
      'Simulation reset to baseline state at 08:00 AM.',
      0
    );
  }, []);

  const handleToggleDataSource = useCallback((key: keyof Omit<DataSourceStatus, 'fallbackTier'>, enabled: boolean) => {
    toggleDataSource(key, enabled, simRef.current.getSimTime());
  }, []);

  // Comprehensive incident injection with end-to-end emergency routing
  const injectIncident = useCallback(
    (
      paramsOrPhase:
        | PhaseId
        | {
            type: IncidentType;
            title: string;
            junctionId?: string;
            phase?: PhaseId;
            direction?: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound';
            vehiclesInvolved?: number;
            blockedLanes?: number;
            peopleInvolved?: number;
            fireSmokePresent?: boolean;
            autoDispatch?: boolean;
          },
      durationSec?: number
    ) => {
      const isQuick = typeof paramsOrPhase === 'string';
      const phase: PhaseId = isQuick ? paramsOrPhase : paramsOrPhase.phase || 'phaseA';
      const duration = durationSec || 40;
      const junctionId = !isQuick && paramsOrPhase.junctionId ? paramsOrPhase.junctionId : 'J1_CENTRAL';
      const direction = !isQuick && paramsOrPhase.direction ? paramsOrPhase.direction : 'Northbound';
      const title =
        !isQuick && paramsOrPhase.title
          ? paramsOrPhase.title
          : `Artificial ${phase === 'phaseA' ? 'North-South' : 'East-West'} Queue Surge`;
      const type: IncidentType = !isQuick ? paramsOrPhase.type : 'sudden jam';
      const simTime = simRef.current.getSimTime();

      // 1. Inject into Incident Engine
      const inc = incidentEngine.injectIncident({
        type,
        title,
        junctionId,
        phase,
        direction,
        locationDesc: `${junctionId} corridor (${direction})`,
        vehiclesInvolved: !isQuick ? (paramsOrPhase.vehiclesInvolved ?? 2) : 3,
        blockedLanes: !isQuick ? (paramsOrPhase.blockedLanes ?? 1) : 1,
        peopleInvolved: !isQuick ? (paramsOrPhase.peopleInvolved ?? 2) : 2,
        fireSmokePresent: !isQuick ? (paramsOrPhase.fireSmokePresent ?? false) : false,
        simTime,
      });

      // 2. Also inject traffic queue surge into simulation
      simRef.current.injectIncident(phase, duration);
      setMetrics(simRef.current.getSnapshot());

      // 3. End-to-end: If critical/high or autoDispatch requested, auto-dispatch nearest unit and trigger Green Corridor
      const autoDispatch = !isQuick ? paramsOrPhase.autoDispatch !== false : true;
      if (autoDispatch) {
        const unitType: EmergencyUnitType =
          type === 'fire' ? 'FIRE' : inc.severity === 'CRITICAL' ? 'AMBULANCE' : 'POLICE';
        const unit = emergencyEngine.findNearestAvailableUnit(unitType, junctionId);

        if (unit) {
          emergencyEngine.dispatchUnit(unit.id, inc.id, junctionId, simTime);
          emergencyEngine.updateUnitState(unit.id, 'En route', simTime);

          // Trigger Green Corridor
          triggerGreenCorridor({
            unitId: unit.id,
            incidentId: inc.id,
            startJunctionId: unit.currentJunctionId,
            targetJunctionId: junctionId,
            targetPhase: phase,
            simTime,
          });
        }
      }

      return inc;
    },
    []
  );

  const resolveIncident = useCallback((id: string) => {
    incidentEngine.resolveIncident(id, 'Incident Operator Console', simRef.current.getSimTime());
  }, []);

  const addReport = useCallback((reportData: Parameters<typeof userReportService.submitReport>[0]) => {
    userReportService.submitReport({
      ...reportData,
      simTime: simRef.current.getSimTime(),
    });
  }, []);

  const updateReportStatus = useCallback((id: string, status: CitizenReportStatus) => {
    userReportService.updateReportStatus(id, status === 'Dismissed' ? 'Dismissed' : 'Approved', simRef.current.getSimTime());
  }, []);

  const dispatchUnit = useCallback((unitId: string, incidentId: string, targetJunctionId: string) => {
    emergencyEngine.dispatchUnit(unitId, incidentId, targetJunctionId, simRef.current.getSimTime());
  }, []);

  const updateUnitState = useCallback((unitId: string, state: EmergencyUnitState) => {
    emergencyEngine.updateUnitState(unitId, state, simRef.current.getSimTime());
  }, []);

  const handleActivateGreenCorridor = useCallback(
    (unitId: string, incidentId: string, startJunctionId: string, targetJunctionId: string, phase?: PhaseId) => {
      triggerGreenCorridor({
        unitId,
        incidentId,
        startJunctionId,
        targetJunctionId,
        targetPhase: phase,
        simTime: simRef.current.getSimTime(),
      });
    },
    []
  );

  const handleDeactivateGreenCorridor = useCallback((reason?: string) => {
    cancelGreenCorridor(simRef.current.getSimTime(), reason);
  }, []);

  const handleMarkNotificationRead = useCallback((id: string) => {
    markNotificationAsRead(id);
    setNotifications(getNotifications());
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    markAllNotificationsAsRead(userRole);
    setNotifications(getNotifications());
  }, [userRole]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        metrics,
        isPlaying,
        speed,
        viewMode,
        dayNightRatio,
        adaptiveConfig,
        userRole,
        weather,
        dataSources,
        junctions,
        incidents,
        activeIncidents: incidents.filter((i) => i.stage !== 'Resolved'),
        reports,
        emergencyUnits,
        hospitals: SIMULATED_HOSPITALS,
        stations: SIMULATED_STATIONS,
        greenCorridor,
        notifications,
        auditLogs,
        toast,
        theme,
        setIsPlaying,
        setSpeed,
        setViewMode,
        setDayNightRatio,
        setTheme,
        toggleTheme,
        setUserRole,
        setWeather,
        setRushMultiplier,
        updateAdaptiveConfig,
        resetSimulation,
        toggleDataSource: handleToggleDataSource,
        injectIncident,
        resolveIncident,
        addReport,
        updateReportStatus,
        dispatchUnit,
        updateUnitState,
        activateGreenCorridor: handleActivateGreenCorridor,
        deactivateGreenCorridor: handleDeactivateGreenCorridor,
        markNotificationAsRead: handleMarkNotificationRead,
        markAllNotificationsAsRead: handleMarkAllNotificationsRead,
        dismissToast,
        currentUserSession,
        isInterfaceAuthenticated,
        loginInterface,
        logoutUser,
        authModalTargetRole,
        openAuthModalForRole,
        isAdminAuthenticated,
        adminUser,
        isAdminAuthModalOpen,
        openAdminAuthModal,
        closeAdminAuthModal,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return ctx;
};
