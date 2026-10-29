// Notification Routing & Notification Center Service for TrafficPulse
import { IncidentSeverity, SystemNotification, UserRole } from '../types';
import { APP_EVENTS, eventBus } from './eventBus';

const STORAGE_KEY_NOTIFS = 'trafficpulse_notifs_v2';

const SEED_NOTIFS: SystemNotification[] = [
  {
    id: 'NOTIF-01',
    simTime: 180,
    timestamp: '08:03 AM',
    severity: 'MEDIUM',
    targetRoles: ['admin', 'operator'],
    title: 'Adaptive Cycle Surge Detected',
    message: 'Phase A experiencing heavy morning volume; extra green dynamically raised to +16s.',
    read: false,
  },
  {
    id: 'NOTIF-02',
    simTime: 300,
    timestamp: '08:05 AM',
    severity: 'LOW',
    targetRoles: ['admin'],
    title: 'Routine Edge Health Diagnostic',
    message: 'All 4 junction controllers operating at 100% telemetry availability.',
    read: true,
  },
];

let notifications: SystemNotification[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Could not read notifications from storage:', e);
  }
  return SEED_NOTIFS;
})();

export function getNotifications(): SystemNotification[] {
  return [...notifications];
}

export function getNotificationsForRole(role: UserRole): SystemNotification[] {
  return notifications.filter((n) => n.targetRoles.includes(role));
}

export function routeNotificationBySeverity(
  severity: IncidentSeverity,
  title: string,
  message: string,
  incidentId?: string,
  unitId?: string,
  simTime: number = 0
): SystemNotification {
  let targetRoles: UserRole[] = ['admin'];

  if (severity === 'LOW') {
    targetRoles = ['admin'];
  } else if (severity === 'MEDIUM') {
    targetRoles = ['admin', 'operator'];
  } else if (severity === 'HIGH') {
    targetRoles = ['admin', 'police', 'citizen'];
  } else if (severity === 'CRITICAL') {
    targetRoles = ['admin', 'police', 'emergency', 'citizen', 'operator'];
  }

  const notif: SystemNotification = {
    id: `NOTIF-${Date.now().toString().slice(-5)}`,
    simTime,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity,
    targetRoles,
    title,
    message,
    incidentId,
    unitId,
    read: false,
  };

  notifications = [notif, ...notifications.slice(0, 99)];

  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  } catch (e) {}

  eventBus.emit(APP_EVENTS.NOTIFICATION_EMITTED, notif);
  return notif;
}

export function markNotificationAsRead(id: string): void {
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  } catch (e) {}
}

export function markAllNotificationsAsRead(role: UserRole): void {
  notifications = notifications.map((n) =>
    n.targetRoles.includes(role) ? { ...n, read: true } : n
  );
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  } catch (e) {}
}
