// Weather Engine for TrafficPulse Simulation Twin
import { WeatherState, WeatherType } from '../types';
import { APP_EVENTS, eventBus } from './eventBus';

export const WEATHER_PRESETS: Record<WeatherType, WeatherState> = {
  clear: {
    type: 'clear',
    label: 'Optimal Clear Sky',
    visibilityKm: 10.0,
    frictionCoefficient: 1.0,
    incidentRiskMultiplier: 1.0,
    speedReductionFactor: 1.0,
  },
  fog: {
    type: 'fog',
    label: 'Dense Coastal Fog (Low Visibility)',
    visibilityKm: 0.8,
    frictionCoefficient: 0.88,
    incidentRiskMultiplier: 1.6,
    speedReductionFactor: 0.75,
  },
  rain: {
    type: 'rain',
    label: 'Steady Rain (Slick Asphalt)',
    visibilityKm: 3.5,
    frictionCoefficient: 0.72,
    incidentRiskMultiplier: 2.1,
    speedReductionFactor: 0.7,
  },
  storm: {
    type: 'storm',
    label: 'Severe Thunderstorm & Standing Water',
    visibilityKm: 1.2,
    frictionCoefficient: 0.55,
    incidentRiskMultiplier: 3.4,
    speedReductionFactor: 0.55,
  },
  'heavy rain': {
    type: 'heavy rain',
    label: 'Heavy Downpour',
    visibilityKm: 2.0,
    frictionCoefficient: 0.65,
    incidentRiskMultiplier: 2.5,
    speedReductionFactor: 0.65,
  },
  flood: {
    type: 'flood',
    label: 'Flash Flooding & Road Inundation',
    visibilityKm: 1.0,
    frictionCoefficient: 0.40,
    incidentRiskMultiplier: 4.0,
    speedReductionFactor: 0.35,
  },
  normal: {
    type: 'normal',
    label: 'Normal Ambient Conditions',
    visibilityKm: 10.0,
    frictionCoefficient: 1.0,
    incidentRiskMultiplier: 1.0,
    speedReductionFactor: 1.0,
  },
};

let currentWeather: WeatherState = { ...WEATHER_PRESETS.clear };

export function getCurrentWeather(): WeatherState {
  return { ...currentWeather };
}

export function setWeather(type: WeatherType): WeatherState {
  currentWeather = { ...WEATHER_PRESETS[type] };
  eventBus.emit(APP_EVENTS.WEATHER_CHANGED, currentWeather);
  return currentWeather;
}
