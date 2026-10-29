// ScenarioStage: Animated SVG + Motion Intersection Canvas for Academic Exhibition
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Car,
  CheckCircle2,
  Eye,
  Radio,
  Shield,
  Siren,
  Truck,
  Users,
  Video,
} from 'lucide-react';
import { useScenario } from '../../scenarios/ScenarioContext';

export const ScenarioStage: React.FC = () => {
  const {
    state,
    triggerCollision,
    verifyIncident,
    dispatchPolice,
    dispatchAmbulance,
    activateGreenCorridor,
    startRescue,
    advanceClearanceStep,
    activateSafePedestrianRoute,
    restoreTrafficFlow,
    clearActionError,
    toggleSensorOutage,
  } = useScenario();

  // Animation ticker for moving vehicle positions
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const isCollisionActive =
    state.stage !== 'MONITORING' &&
    state.stage !== 'IDLE' &&
    state.stage !== 'RECOVERED' &&
    state.stage !== 'REPORT';

  const showPolice =
    state.policeDispatched ||
    state.stage === 'POLICE_DISPATCHED' ||
    state.stage === 'SITE_SECURED' ||
    state.stage === 'RESCUE';

  const showAmbulance =
    state.ambulanceDispatched ||
    state.stage === 'AMBULANCE_DISPATCHED' ||
    state.stage === 'CORRIDOR_ACTIVE' ||
    state.stage === 'RESCUE';

  const showTowTruck =
    state.clearanceStep >= 2 && state.clearanceStep <= 4;

  const showSweeper =
    state.clearanceStep >= 4 && state.clearanceStep <= 5;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[#07090F] shadow-2xl flex flex-col">
      {/* Top Telemetry & Scenario Quick Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0B0F19] border-b border-[var(--border)]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#151C2E] border border-[var(--border)] text-xs font-mono-data text-[#8A94A9]">
            <Video className="w-3.5 h-3.5 text-[#2EE6A6]" />
            <span>CAM-01: SOUTH-FACING OPTICAL (SIMULATED)</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono-data">
            <span className="text-[#8A94A9]">Junction:</span>
            <span className="font-bold text-white">J1 Central Square</span>
            <span className="text-[#8A94A9]">• Signals:</span>
            <span
              className={`font-bold ${
                state.signalPlan.phaseA === 'green'
                  ? 'text-[#2EE6A6]'
                  : state.signalPlan.phaseA === 'yellow'
                  ? 'text-[#FFB547]'
                  : 'text-[#FF5C6C]'
              }`}
            >
              Phase A {state.signalPlan.phaseA.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Button for Current Scenario */}
        <div className="flex items-center space-x-2">
          {state.activeScenarioId === 'collision' && !isCollisionActive && (
            <button
              onClick={triggerCollision}
              className="px-4 py-1.5 rounded-xl bg-[#FF5C6C] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 cursor-pointer shadow-md shadow-[#FF5C6C]/20"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Trigger Crash Simulation</span>
            </button>
          )}

          {state.activeScenarioId === 'ai_verification' && (
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1.5 text-xs text-[#8A94A9] cursor-pointer bg-[#151C2E] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                <input
                  type="checkbox"
                  checked={state.sensorOutageSimulated}
                  onChange={(e) => toggleSensorOutage(e.target.checked)}
                  className="rounded text-[#2EE6A6] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-mono-data">Simulate Sensor Outage</span>
              </label>

              <button
                onClick={verifyIncident}
                className="px-3.5 py-1.5 rounded-xl bg-[#4F8CFF] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Run AI Verification</span>
              </button>
            </div>
          )}

          {state.activeScenarioId === 'police_dispatch' && (
            <button
              onClick={dispatchPolice}
              disabled={state.policeDispatched}
              className={`px-4 py-1.5 rounded-xl font-heading font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer transition-all ${
                state.policeDispatched
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                  : 'bg-[#38BDF8] text-[#07090F] hover:brightness-110 active:scale-95 shadow-md shadow-[#38BDF8]/20'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {state.policeDispatched
                  ? 'Police Unit Dispatched (Simulation)'
                  : 'Simulate Police Dispatch'}
              </span>
            </button>
          )}

          {state.activeScenarioId === 'ambulance_hospital' && (
            <button
              onClick={dispatchAmbulance}
              disabled={state.ambulanceDispatched}
              className={`px-4 py-1.5 rounded-xl font-heading font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer transition-all ${
                state.ambulanceDispatched
                  ? 'bg-[#FF5C6C]/20 text-[#FF5C6C] border border-[#FF5C6C]/40'
                  : 'bg-[#FF5C6C] text-[#07090F] hover:brightness-110 active:scale-95 shadow-md shadow-[#FF5C6C]/20'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>
                {state.ambulanceDispatched
                  ? 'Ambulance Assigned & En Route (Simulation)'
                  : 'Simulate Ambulance Dispatch'}
              </span>
            </button>
          )}

          {state.activeScenarioId === 'green_corridor' && (
            <button
              onClick={activateGreenCorridor}
              disabled={state.greenCorridorActive}
              className={`px-4 py-1.5 rounded-xl font-heading font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer transition-all ${
                state.greenCorridorActive
                  ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'
                  : 'bg-[#A855F7] text-white hover:brightness-110 active:scale-95 shadow-md shadow-[#A855F7]/20'
              }`}
            >
              <Siren className="w-3.5 h-3.5" />
              <span>
                {state.greenCorridorActive
                  ? 'Green Corridor Active (Signals Preempted)'
                  : 'Activate Demo Green Corridor'}
              </span>
            </button>
          )}

          {state.activeScenarioId === 'rescue_safety' && (
            <button
              onClick={startRescue}
              className="px-4 py-1.5 rounded-xl bg-[#FFB547] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 cursor-pointer shadow-md shadow-[#FFB547]/20"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Start Rescue Simulation</span>
            </button>
          )}

          {state.activeScenarioId === 'road_clearance' && (
            <button
              onClick={() => advanceClearanceStep()}
              className="px-4 py-1.5 rounded-xl bg-[#F97316] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 cursor-pointer shadow-md shadow-[#F97316]/20"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>
                {state.clearanceStep < 6
                  ? `Clearance Step ${state.clearanceStep + 1}/6`
                  : 'Clearance Fully Authorized (6/6)'}
              </span>
            </button>
          )}

          {state.activeScenarioId === 'pedestrian_safety' && (
            <button
              onClick={activateSafePedestrianRoute}
              className="px-4 py-1.5 rounded-xl bg-[#06B6D4] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 cursor-pointer shadow-md shadow-[#06B6D4]/20"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Activate Safe Pedestrian Route</span>
            </button>
          )}

          {state.activeScenarioId === 'traffic_restoration' && (
            <button
              onClick={restoreTrafficFlow}
              className="px-4 py-1.5 rounded-xl bg-[#2EE6A6] text-[#07090F] font-heading font-extrabold text-xs flex items-center space-x-1.5 hover:brightness-110 active:scale-95 cursor-pointer shadow-md shadow-[#2EE6A6]/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Restore Traffic Flow</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Invariant Rejection Banner (if action was gated) */}
      <AnimatePresence>
        {state.actionError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2.5 bg-[#FF5C6C]/15 border-b border-[#FF5C6C]/40 text-xs text-[#FF5C6C] font-mono-data flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{state.actionError}</span>
            </div>
            <button
              onClick={clearActionError}
              className="text-[#FF5C6C] hover:text-white underline text-[11px] ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SVG Intersection Simulation Stage */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[460px] bg-[#0A0E17] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-contain select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Road Asphalt Texture */}
            <pattern id="asphaltPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#141A28" />
              <circle cx="10" cy="10" r="0.7" fill="#1A2234" />
              <circle cx="30" cy="25" r="0.8" fill="#1A2234" />
            </pattern>
            {/* Hazard Stripe Pattern for Safety Perimeter */}
            <pattern id="hazardStripe" width="20" height="20" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="10" height="20" fill="#FFB547" />
              <rect x="10" width="10" height="20" fill="#111827" />
            </pattern>
          </defs>

          {/* Grass / Ground Backdrop */}
          <rect width="1000" height="600" fill="#0A0D15" />

          {/* City Sidewalks & Curbs */}
          <rect x="0" y="0" width="380" height="180" fill="#1E273A" />
          <rect x="620" y="0" width="380" height="180" fill="#1E273A" />
          <rect x="0" y="420" width="380" height="180" fill="#1E273A" />
          <rect x="620" y="420" width="380" height="180" fill="#1E273A" />

          {/* Vertical Arterial Road (North-South, Phase A) */}
          <rect x="380" y="0" width="240" height="600" fill="url(#asphaltPattern)" />

          {/* Horizontal Arterial Road (East-West, Phase B) */}
          <rect x="0" y="180" width="1000" height="240" fill="url(#asphaltPattern)" />

          {/* Intersection Center Box */}
          <rect x="380" y="180" width="240" height="240" fill="#161D2E" />

          {/* Lane Divider Lines: Northbound / Southbound */}
          {/* North Road Div */}
          <line x1="500" y1="0" x2="500" y2="180" stroke="#FFB547" strokeWidth="3" strokeDasharray="12 12" />
          <line x1="440" y1="0" x2="440" y2="180" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />
          <line x1="560" y1="0" x2="560" y2="180" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />

          {/* South Road Div */}
          <line x1="500" y1="420" x2="500" y2="600" stroke="#FFB547" strokeWidth="3" strokeDasharray="12 12" />
          <line x1="440" y1="420" x2="440" y2="600" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />
          <line x1="560" y1="420" x2="560" y2="600" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />

          {/* East Road Div */}
          <line x1="620" y1="300" x2="1000" y2="300" stroke="#FFB547" strokeWidth="3" strokeDasharray="12 12" />
          <line x1="620" y1="240" x2="1000" y2="240" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />
          <line x1="620" y1="360" x2="1000" y2="360" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />

          {/* West Road Div */}
          <line x1="0" y1="300" x2="380" y2="300" stroke="#FFB547" strokeWidth="3" strokeDasharray="12 12" />
          <line x1="0" y1="240" x2="380" y2="240" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />
          <line x1="0" y1="360" x2="380" y2="360" stroke="#E8ECF5" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4" />

          {/* Zebra Crosswalks */}
          {/* North Crosswalk */}
          {[390, 415, 440, 465, 490, 515, 540, 565, 590].map((x) => (
            <rect key={`cw-n-${x}`} x={x} y="160" width="16" height="15" fill="#E8ECF5" opacity="0.7" />
          ))}
          {/* South Crosswalk */}
          {[390, 415, 440, 465, 490, 515, 540, 565, 590].map((x) => (
            <rect key={`cw-s-${x}`} x={x} y="425" width="16" height="15" fill="#E8ECF5" opacity="0.7" />
          ))}
          {/* West Crosswalk */}
          {[190, 215, 240, 265, 290, 315, 340, 365, 390].map((y) => (
            <rect key={`cw-w-${y}`} x="360" y={y} width="15" height="16" fill="#E8ECF5" opacity="0.7" />
          ))}
          {/* East Crosswalk */}
          {[190, 215, 240, 265, 290, 315, 340, 365, 390].map((y) => (
            <rect key={`cw-e-${y}`} x="625" y={y} width="15" height="16" fill="#E8ECF5" opacity="0.7" />
          ))}

          {/* Inductive Loop Sensor Footprints (Embedded in Pavement) */}
          <rect x="525" y="450" width="50" height="25" fill="none" stroke="#4F8CFF" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
          <text x="530" y="466" fill="#4F8CFF" fontSize="9" fontFamily="monospace" opacity="0.8">SEN-L12</text>

          <rect x="425" y="450" width="50" height="25" fill="none" stroke="#4F8CFF" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
          <text x="430" y="466" fill="#4F8CFF" fontSize="9" fontFamily="monospace" opacity="0.6">SEN-L11</text>

          {/* Traffic Signal Heads at 4 Corners */}
          {/* NW Signal (Controls Phase A Northbound) */}
          <g transform="translate(350, 140)">
            <rect x="0" y="0" width="22" height="48" rx="4" fill="#0C101A" stroke="#2B364E" strokeWidth="1.5" />
            <circle cx="11" cy="10" r="5" fill={state.signalPlan.phaseA === 'red' ? '#FF5C6C' : '#2A181C'} />
            <circle cx="11" cy="24" r="5" fill={state.signalPlan.phaseA === 'yellow' ? '#FFB547' : '#2A2415'} />
            <circle cx="11" cy="38" r="5" fill={state.signalPlan.phaseA === 'green' ? '#2EE6A6' : '#142A22'} />
          </g>

          {/* NE Signal (Controls Phase B Westbound) */}
          <g transform="translate(628, 140)">
            <rect x="0" y="0" width="22" height="48" rx="4" fill="#0C101A" stroke="#2B364E" strokeWidth="1.5" />
            <circle cx="11" cy="10" r="5" fill={state.signalPlan.phaseB === 'red' ? '#FF5C6C' : '#2A181C'} />
            <circle cx="11" cy="24" r="5" fill={state.signalPlan.phaseB === 'yellow' ? '#FFB547' : '#2A2415'} />
            <circle cx="11" cy="38" r="5" fill={state.signalPlan.phaseB === 'green' ? '#2EE6A6' : '#142A22'} />
          </g>

          {/* SE Signal (Controls Phase A Southbound) */}
          <g transform="translate(628, 412)">
            <rect x="0" y="0" width="22" height="48" rx="4" fill="#0C101A" stroke="#2B364E" strokeWidth="1.5" />
            <circle cx="11" cy="10" r="5" fill={state.signalPlan.phaseA === 'red' ? '#FF5C6C' : '#2A181C'} />
            <circle cx="11" cy="24" r="5" fill={state.signalPlan.phaseA === 'yellow' ? '#FFB547' : '#2A2415'} />
            <circle cx="11" cy="38" r="5" fill={state.signalPlan.phaseA === 'green' ? '#2EE6A6' : '#142A22'} />
          </g>

          {/* SW Signal (Controls Phase B Eastbound) */}
          <g transform="translate(350, 412)">
            <rect x="0" y="0" width="22" height="48" rx="4" fill="#0C101A" stroke="#2B364E" strokeWidth="1.5" />
            <circle cx="11" cy="10" r="5" fill={state.signalPlan.phaseB === 'red' ? '#FF5C6C' : '#2A181C'} />
            <circle cx="11" cy="24" r="5" fill={state.signalPlan.phaseB === 'yellow' ? '#FFB547' : '#2A2415'} />
            <circle cx="11" cy="38" r="5" fill={state.signalPlan.phaseB === 'green' ? '#2EE6A6' : '#142A22'} />
          </g>

          {/* Continuous Flow Civilian Vehicles in Unblocked Lanes */}
          {/* Southbound Lane 1 flowing */}
          <g transform={`translate(460, ${(tick * 3.5) % 650})`}>
            <rect x="-12" y="-22" width="24" height="44" rx="5" fill="#3B82F6" stroke="#60A5FA" strokeWidth="1" />
            <rect x="-9" y="-12" width="18" height="12" rx="2" fill="#1E293B" />
          </g>
          {/* Eastbound flowing if green */}
          <g transform={`translate(${(tick * 4) % 1050}, 330)`}>
            <rect x="-22" y="-12" width="44" height="24" rx="5" fill="#10B981" stroke="#34D399" strokeWidth="1" />
            <rect x="-12" y="-9" width="12" height="18" rx="2" fill="#1E293B" />
          </g>

          {/* SCENARIO 2-10: ACCIDENT INCIDENT IN LANE 2 (Northbound, x ~ 545, y ~ 260) */}
          {isCollisionActive && (
            <g id="accident-site-cluster">
              {/* Safety Perimeter Cones & Buffer Zone */}
              {state.safetyPerimeterActive && (
                <g id="safety-perimeter">
                  <rect
                    x="510"
                    y="210"
                    width="85"
                    height="125"
                    rx="8"
                    fill="none"
                    stroke="#FFB547"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Perimeter Cones */}
                  {[
                    [510, 210],
                    [552, 210],
                    [595, 210],
                    [595, 272],
                    [595, 335],
                    [552, 335],
                    [510, 335],
                    [510, 272],
                  ].map(([cx, cy], i) => (
                    <polygon
                      key={`cone-${i}`}
                      points={`${cx},${cy - 8} ${cx - 6},${cy + 4} ${cx + 6},${cy + 4}`}
                      fill="#FFB547"
                      stroke="#07090F"
                      strokeWidth="1"
                    />
                  ))}
                  <text x="515" y="202" fill="#FFB547" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    SAFETY PERIMETER
                  </text>
                </g>
              )}

              {/* Damaged Vehicles (Controlled Non-Graphic Presentation) */}
              {!state.vehiclesMoved ? (
                <g id="collided-vehicles">
                  {/* Sedan 1 (Blue) */}
                  <g transform="translate(545, 255) rotate(-12)">
                    <rect x="-13" y="-23" width="26" height="46" rx="5" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.5" />
                    <rect x="-10" y="-12" width="20" height="14" rx="2" fill="#0F172A" />
                    <circle cx="-9" cy="18" r="2.5" fill="#EF4444" />
                    <circle cx="9" cy="18" r="2.5" fill="#EF4444" />
                  </g>

                  {/* Sedan 2 (Silver) rear-ended */}
                  <g transform="translate(552, 298) rotate(8)">
                    <rect x="-13" y="-23" width="26" height="46" rx="5" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="1.5" />
                    <rect x="-10" y="-12" width="20" height="14" rx="2" fill="#0F172A" />
                    <circle cx="-9" cy="-18" r="2.5" fill="#FBBF24" />
                    <circle cx="9" cy="-18" r="2.5" fill="#FBBF24" />
                  </g>

                  {/* Non-Graphic Collision Warning Indicator */}
                  <g transform="translate(548, 275)">
                    <circle cx="0" cy="0" r="14" fill="#FF5C6C" fillOpacity="0.2" className="animate-ping" />
                    <circle cx="0" cy="0" r="9" fill="#FF5C6C" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">!</text>
                  </g>
                </g>
              ) : (
                /* Vehicles Towed to Shoulder */
                <g id="towed-shoulder" opacity="0.6">
                  <rect x="635" y="230" width="22" height="40" rx="4" fill="#2563EB" />
                  <rect x="635" y="278" width="22" height="40" rx="4" fill="#94A3B8" />
                  <text x="632" y="222" fill="#8A94A9" fontSize="8" fontFamily="monospace">SAFE SHOULDER</text>
                </g>
              )}

              {/* Computer Vision Detection Frame Overlay */}
              <g id="cv-detection-hud">
                <rect
                  x="518"
                  y="225"
                  width="65"
                  height="105"
                  fill="none"
                  stroke={state.sensorOutageSimulated ? '#FFB547' : '#2EE6A6'}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                {/* HUD Corners */}
                <path d="M 518 240 L 518 225 L 533 225" fill="none" stroke="#2EE6A6" strokeWidth="3" />
                <path d="M 568 225 L 583 225 L 583 240" fill="none" stroke="#2EE6A6" strokeWidth="3" />
                <path d="M 518 315 L 518 330 L 533 330" fill="none" stroke="#2EE6A6" strokeWidth="3" />
                <path d="M 568 330 L 583 330 L 583 315" fill="none" stroke="#2EE6A6" strokeWidth="3" />

                {/* HUD Metadata Tag */}
                <g transform="translate(520, 218)">
                  <rect x="0" y="-12" width="135" height="16" rx="3" fill="#0C101A" stroke="#2EE6A6" strokeWidth="1" />
                  <text x="5" y="-1" fill="#2EE6A6" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {state.sensorOutageSimulated
                      ? 'UNVERIFIED • LOOP OFFLINE'
                      : `FLAGGED: ${state.aiConfidence}% CONF`}
                  </text>
                </g>
              </g>

              {/* Debris Zone (Removed during step 4) */}
              {!state.debrisRemoved && (
                <g id="debris-fragments" opacity="0.8">
                  <polygon points="536,276 540,278 538,281" fill="#FFB547" />
                  <polygon points="562,284 565,286 564,289" fill="#94A3B8" />
                  <polygon points="548,312 552,310 550,315" fill="#EF4444" />
                </g>
              )}
            </g>
          )}

          {/* Emergency Responders On Scene */}
          {/* Police Cruiser */}
          {showPolice && (
            <g transform="translate(550, 360)">
              <rect x="-14" y="-24" width="28" height="48" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
              <rect x="-11" y="-14" width="22" height="15" rx="2" fill="#1E293B" />
              {/* Flashing Police Lightbar */}
              <rect x="-9" y="-4" width="8" height="4" fill="#38BDF8" className="animate-pulse" />
              <rect x="1" y="-4" width="8" height="4" fill="#EF4444" className="animate-pulse" />
              <text x="0" y="14" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">POLICE</text>
            </g>
          )}

          {/* Paramedic Ambulance & Protected Corridor Access */}
          {showAmbulance && (
            <g transform="translate(515, 375)">
              <rect x="-16" y="-26" width="32" height="52" rx="6" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <rect x="-12" y="-14" width="24" height="16" rx="2" fill="#334155" />
              {/* Red Cross */}
              <rect x="-2" y="4" width="4" height="12" fill="#EF4444" />
              <rect x="-6" y="8" width="12" height="4" fill="#EF4444" />
              {/* Flashing Siren */}
              <circle cx="0" cy="-20" r="4" fill="#EF4444" className="animate-ping" />
              <text x="0" y="24" textAnchor="middle" fill="#EF4444" fontSize="7" fontWeight="bold">EMS-14</text>
            </g>
          )}

          {/* Clearance Tow Truck */}
          {showTowTruck && (
            <g transform="translate(575, 275)">
              <rect x="-15" y="-28" width="30" height="56" rx="5" fill="#F97316" stroke="#FB923C" strokeWidth="2" />
              <rect x="-10" y="-18" width="20" height="14" rx="2" fill="#1E293B" />
              <rect x="-8" y="10" width="16" height="10" fill="#78350F" />
              <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">TOW</text>
            </g>
          )}

          {/* Mechanical Road Sweeper */}
          {showSweeper && (
            <g transform="translate(545, 280)">
              <rect x="-14" y="-22" width="28" height="44" rx="5" fill="#EAB308" stroke="#FDE047" strokeWidth="1.5" />
              <circle cx="-10" cy="12" r="5" fill="#475569" className="animate-spin" />
              <circle cx="10" cy="12" r="5" fill="#475569" className="animate-spin" />
              <text x="0" y="-3" textAnchor="middle" fill="#07090F" fontSize="7" fontWeight="bold">SWEEP</text>
            </g>
          )}

          {/* Green Corridor Wave Highlight Overlay */}
          {state.greenCorridorActive && (
            <g id="green-corridor-lane-glow">
              <rect x="502" y="180" width="36" height="240" fill="#2EE6A6" fillOpacity="0.15" />
              <rect x="502" y="420" width="36" height="180" fill="#2EE6A6" fillOpacity="0.2" className="animate-pulse" />
              <line x1="520" y1="600" x2="520" y2="180" stroke="#2EE6A6" strokeWidth="3" strokeDasharray="8 6" className="animate-pulse" />
              {/* Route Markers */}
              <text x="505" y="550" fill="#2EE6A6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                EMS GREEN WAVE
              </text>
            </g>
          )}

          {/* Pedestrian Protection Barriers & Safe Reroute (Scenario 9) */}
          {state.pedestrians.safeRouteActive && (
            <g id="pedestrian-safe-passage">
              {/* Physical Barricades on North Crosswalk */}
              <rect x="495" y="152" width="75" height="8" rx="2" fill="url(#hazardStripe)" stroke="#07090F" strokeWidth="1" />
              <text x="500" y="148" fill="#FFB547" fontSize="8" fontFamily="monospace" fontWeight="bold">CROSSWALK CLOSED</text>

              {/* Southern Protected Bypass Route Line */}
              <path
                d="M 330 450 L 330 520 L 670 520 L 670 450"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <circle cx="330" cy="520" r="6" fill="#06B6D4" />
              <circle cx="670" cy="520" r="6" fill="#06B6D4" />
              <text x="440" y="540" fill="#06B6D4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                PROTECTED PEDESTRIAN ROUTE
              </text>
            </g>
          )}

          {/* Normal Restored Flow Animation (Scenario 10) */}
          {state.trafficFlowRestored && (
            <g id="restored-flow-indicators">
              <g transform={`translate(550, ${((tick * 4) + 200) % 650})`}>
                <rect x="-12" y="-22" width="24" height="44" rx="5" fill="#E11D48" stroke="#FDA4AF" strokeWidth="1" />
                <rect x="-9" y="-12" width="18" height="12" rx="2" fill="#1E293B" />
              </g>
            </g>
          )}

          {/* Edge Camera HUD Corner Watermark */}
          <g transform="translate(20, 25)">
            <rect x="0" y="0" width="200" height="42" rx="6" fill="#0A0D15" fillOpacity="0.85" stroke="#2EE6A6" strokeWidth="1" />
            <circle cx="14" cy="14" r="4" fill="#2EE6A6" className="animate-ping" />
            <circle cx="14" cy="14" r="3" fill="#2EE6A6" />
            <text x="26" y="17" fill="#2EE6A6" fontSize="10" fontFamily="monospace" fontWeight="bold">
              AI EDGE VISION: ACTIVE
            </text>
            <text x="26" y="32" fill="#8A94A9" fontSize="9" fontFamily="monospace">
              Latency: 14.2ms • Res: 1080p60
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Stage Footnote / Disclaimer */}
      <div className="px-4 py-2 bg-[#090D18] border-t border-[var(--border)] flex flex-wrap items-center justify-between text-[11px] text-[#8A94A9]">
        <div className="flex items-center space-x-2">
          <Eye className="w-3.5 h-3.5 text-[#2EE6A6]" />
          <span>Non-graphic simulation representation conforming to academic B.Tech exhibition ethics.</span>
        </div>
        <div className="font-mono-data text-[10px] text-[#2EE6A6]">
          STAGE: {state.stage} • ELAPSED: {state.elapsedSeconds.toFixed(1)}s
        </div>
      </div>
    </div>
  );
};
