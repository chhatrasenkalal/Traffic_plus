// Audit Log Service for TrafficPulse Digital Twin
import { AuditLogEntry } from '../types';
import { APP_EVENTS, eventBus } from './eventBus';

const STORAGE_KEY_AUDIT = 'trafficpulse_audit_log_v2';

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    simTime: 120,
    timestamp: '08:02 AM',
    actor: 'Autonomous Controller Layer',
    action: 'Dynamic Green Extension',
    target: 'J1 Central Square (Phase A)',
    provenance: 'Authorized Controller Service Layer',
    result: 'Success',
    details: 'Extended Phase A green by +12s in response to 18-vehicle morning queue spike.',
  },
  {
    id: 'AUD-002',
    simTime: 240,
    timestamp: '08:04 AM',
    actor: 'System Operator (Demo)',
    action: 'Citizen Report Approved',
    target: 'Report #rep-01 (4th Ave merge)',
    provenance: 'Public Report Verification Pipeline',
    result: 'Success',
    details: 'Verified camera occupancy anomaly (86%) and approved into operator intelligence feed.',
  },
  {
    id: 'AUD-003',
    simTime: 360,
    timestamp: '08:06 AM',
    actor: 'Fail-Safe Monitor',
    action: 'Sensor Provenance Check',
    target: 'J2 North Grand Arterial',
    provenance: 'Edge Hardware Integrity Daemon',
    result: 'Success',
    details: 'All vision cameras and radar loop detectors verified operational at Tier 1 Fusion.',
  },
];

let auditLogs: AuditLogEntry[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Could not read audit log from localStorage:', e);
  }
  return SEED_AUDIT_LOGS;
})();

export function getAuditLogs(): AuditLogEntry[] {
  return [...auditLogs];
}

export function addAuditLog(
  actor: string,
  action: string,
  target: string,
  provenance: string,
  result: 'Success' | 'Overridden' | 'Fallback' | 'Rejected',
  details: string,
  simTime: number = 0
): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    id: `AUD-${Date.now().toString().slice(-5)}`,
    simTime,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    actor,
    action,
    target,
    provenance,
    result,
    details,
  };

  auditLogs = [newEntry, ...auditLogs.slice(0, 199)]; // cap at 200 items

  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
  } catch (e) {
    console.warn('Could not save audit log:', e);
  }

  eventBus.emit(APP_EVENTS.AUDIT_LOG_ADDED, newEntry);
  return newEntry;
}

export function clearAuditLogs(): void {
  auditLogs = [];
  try {
    localStorage.removeItem(STORAGE_KEY_AUDIT);
  } catch (e) {}
}
