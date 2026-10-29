// In-browser Typed Event Bus for TrafficPulse
// Provides decoupled, reactive event streaming across services and UI components

type EventCallback<T = any> = (data: T) => void;

class TypedEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit<T = any>(event: string, data: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for "${event}":`, err);
        }
      });
    }
  }

  public publish<T = any>(event: string, data: T): void {
    this.emit(event, data);
  }

  public getEventCount(): number {
    return this.listeners.size;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new TypedEventBus();

// Standard Event Constants
export const APP_EVENTS = {
  INCIDENT_DETECTED: 'incident:detected',
  INCIDENT_UPDATED: 'incident:updated',
  INCIDENT_RESOLVED: 'incident:resolved',
  REPORT_SUBMITTED: 'report:submitted',
  REPORT_VALIDATED: 'report:validated',
  UNIT_DISPATCHED: 'unit:dispatched',
  UNIT_STATE_CHANGED: 'unit:state_changed',
  GREEN_CORRIDOR_ACTIVATED: 'green_corridor:activated',
  GREEN_CORRIDOR_DEACTIVATED: 'green_corridor:deactivated',
  NOTIFICATION_EMITTED: 'notification:emitted',
  AUDIT_LOG_ADDED: 'audit:log_added',
  WEATHER_CHANGED: 'weather:changed',
  DATA_SOURCE_TOGGLED: 'datasource:toggled',
};
