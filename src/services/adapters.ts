import { CameraStats, SensorReading } from '../types';
import { eventBus } from './eventBus';

export interface DataAdapter {
  id: string;
  connect(): void;
  disconnect(): void;
  publish(topic: string, payload: any): void;
}

export class SimulatedSensorAdapter implements DataAdapter {
  public id: string = 'sensor-adapter-sim';
  private connected: boolean = false;

  public connect(): void {
    this.connected = true;
    eventBus.publish('device/health', {
      deviceId: this.id,
      type: 'SENSOR_GATEWAY',
      status: 'ONLINE',
      timestamp: Date.now(),
    });
  }

  public disconnect(): void {
    this.connected = false;
    eventBus.publish('device/health', {
      deviceId: this.id,
      type: 'SENSOR_GATEWAY',
      status: 'OFFLINE',
      timestamp: Date.now(),
    });
  }

  public publish(topic: string, payload: SensorReading): void {
    if (!this.connected) return;
    eventBus.publish(topic, payload);
  }
}

export class SimulatedCameraAdapter implements DataAdapter {
  public id: string = 'camera-adapter-sim';
  private connected: boolean = false;

  public connect(): void {
    this.connected = true;
    eventBus.publish('device/health', {
      deviceId: this.id,
      type: 'CAMERA_GATEWAY',
      status: 'ONLINE',
      timestamp: Date.now(),
    });
  }

  public disconnect(): void {
    this.connected = false;
    eventBus.publish('device/health', {
      deviceId: this.id,
      type: 'CAMERA_GATEWAY',
      status: 'OFFLINE',
      timestamp: Date.now(),
    });
  }

  public publish(topic: string, payload: CameraStats): void {
    if (!this.connected) return;
    eventBus.publish(topic, payload);
  }
}

export const sensorAdapter = new SimulatedSensorAdapter();
export const cameraAdapter = new SimulatedCameraAdapter();
