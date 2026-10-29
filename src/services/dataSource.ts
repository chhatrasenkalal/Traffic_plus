// Data Sources & Fail-Safe Provenance Engine for TrafficPulse
import { DataSourceStatus } from '../types';
import { addAuditLog } from './auditLog';
import { APP_EVENTS, eventBus } from './eventBus';

let dataSources: DataSourceStatus = {
  cameraVision: true,
  inductiveSensors: true,
  citizenStream: true,
  v2xConnectedVehicles: true,
  fallbackTier: 'Tier 1 (Camera + Sensor Fusion)',
};

function recalculateFallbackTier(): void {
  if (dataSources.cameraVision && dataSources.inductiveSensors) {
    dataSources.fallbackTier = 'Tier 1 (Camera + Sensor Fusion)';
  } else if (dataSources.inductiveSensors) {
    dataSources.fallbackTier = 'Tier 2 (Sensors Only)';
  } else {
    dataSources.fallbackTier = 'Tier 3 (Rule-Based Fallback - DATA UNAVAILABLE)';
  }
}

export function getDataSources(): DataSourceStatus {
  return { ...dataSources };
}

export function toggleDataSource(
  sourceKey: keyof Omit<DataSourceStatus, 'fallbackTier'>,
  enabled: boolean,
  simTime: number = 0
): DataSourceStatus {
  dataSources[sourceKey] = enabled;
  recalculateFallbackTier();

  addAuditLog(
    'Admin Hardware Console',
    `Data Source ${enabled ? 'Restored' : 'Simulated Drop'}`,
    String(sourceKey),
    'Edge Fail-Safe Monitor',
    enabled ? 'Success' : 'Fallback',
    `Data source ${String(sourceKey)} set to ${enabled ? 'ONLINE' : 'OFFLINE'}. Active tier is now ${dataSources.fallbackTier}.`,
    simTime
  );

  eventBus.emit(APP_EVENTS.DATA_SOURCE_TOGGLED, { ...dataSources });
  return { ...dataSources };
}
