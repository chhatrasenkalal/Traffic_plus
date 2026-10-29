import {
  Activity,
  Box,
  Compass,
  FileText,
  Radio,
  Settings,
} from 'lucide-react';
import { UserRole } from '../types';

export interface RouteConfig {
  path: string; // e.g. "#/"
  label: string;
  icon: any;
  allowedRoles: UserRole[];
  description: string;
}

export const APP_ROUTES: RouteConfig[] = [
  {
    path: '#/',
    label: 'Command Overview',
    icon: Compass,
    allowedRoles: ['ADMIN', 'POLICE', 'OPERATOR', 'EMERGENCY', 'USER'],
    description: 'Citywide sense, metrics, loop and macro proof',
  },
  {
    path: '#/live',
    label: 'Live Operations',
    icon: Radio,
    allowedRoles: ['ADMIN', 'POLICE', 'OPERATOR', 'EMERGENCY', 'USER'],
    description: 'Per-junction signal countdowns, lane queues and multi-sensor fusion',
  },
  {
    path: '#/3d',
    label: '3D Digital Twin',
    icon: Box,
    allowedRoles: ['ADMIN', 'POLICE', 'OPERATOR', 'EMERGENCY', 'USER'],
    description: 'Interactive low-poly 4-junction city grid with live vehicles and signals',
  },
  {
    path: '#/simulation',
    label: 'Simulation Lab',
    icon: Activity,
    allowedRoles: ['ADMIN', 'OPERATOR', 'POLICE'],
    description: 'Side-by-side fixed vs adaptive top-down benchmark with weather control',
  },
  {
    path: '#/results',
    label: 'Proof & Results',
    icon: FileText,
    allowedRoles: ['ADMIN', 'POLICE', 'OPERATOR', 'EMERGENCY', 'USER'],
    description: 'Printable comparative performance report and delay reduction audit',
  },
  {
    path: '#/settings',
    label: 'Settings',
    icon: Settings,
    allowedRoles: ['ADMIN'],
    description: 'Telemetry mode selector, pseudo-random seed and controller constants',
  },
];
