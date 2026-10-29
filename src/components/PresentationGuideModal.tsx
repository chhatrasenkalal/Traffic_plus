import React, { useState } from 'react';
import {
  Presentation,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Car,
  Download,
  Siren,
  ShieldCheck,
  Zap,
  Play,
  Sun,
  Moon,
  HelpCircle,
  BookOpen,
  Volume2,
  Sliders,
  ChevronRight,
  Lightbulb,
  Layers,
  Flame,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Compass,
  Database,
  Activity,
  FileCheck,
  FileText,
  CloudRain,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface PresentationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'script' | 'analogies' | 'qa' | 'scenarios'>('walkthrough');
  const [currentStep, setCurrentStep] = useState(0);

  const {
    toggleTheme,
    theme,
    injectIncident,
    dispatchUnit,
    emergencyUnits,
    setSpeed,
    speed,
  } = useSimulation();

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'The Hook: The Big Problem & 3D City Twin',
      route: '#/city',
      badge: 'Start Here',
      badgeColor: '#4F8CFF',
      whatToShow: '3D City Simulation (`#/city`)',
      whatToSay:
        '"Have you ever sat at a red light for two minutes late at night when there wasn\'t a single car crossing? Traditional traffic lights run on dumb fixed clocks. TrafficPulse is a smart Digital Twin that watches traffic in real time and changes the lights dynamically to end pointless waiting."',
      actions: [
        {
          label: 'Open 3D City',
          onClick: () => {
            navigate('#/city');
          },
        },
        {
          label: theme === 'light' ? 'Switch to Night Mode' : 'Switch to Day Mode',
          onClick: () => toggleTheme(),
        },
      ],
      proTip: 'Show them how you can toggle Day/Night lighting and pan around the 4 major intersections (Downtown Core, Harbor, Tech Park, West Bypass).',
    },
    {
      step: 2,
      title: 'The Proof: Fixed vs. Adaptive Side-by-Side',
      route: '#/lab',
      badge: 'The Smoking Gun',
      badgeColor: '#2EE6A6',
      whatToShow: 'Sim Lab (`#/lab`)',
      whatToSay:
        '"Here is the scientific proof. We run two identical copies of the exact same traffic stream side-by-side. On the left is the standard fixed timer (like lights today). On the right is our Adaptive Controller. As you can see right here in real time, the adaptive system cuts wait times by over 35%."',
      actions: [
        {
          label: 'Open Sim Lab',
          onClick: () => {
            navigate('#/lab');
          },
        },
        {
          label: 'Speed Up Sim to 5x',
          onClick: () => setSpeed(5),
        },
      ],
      proTip: 'Drag the traffic intensity slider to 90% (Rush Hour). Point to the queue length: the fixed timer gridlocks, while the adaptive controller smoothly clears the bottleneck.',
    },
    {
      step: 3,
      title: 'The "Hero" Moment: Emergency Green Corridor',
      route: '#/emergency',
      badge: 'Saves Lives',
      badgeColor: '#FF5C6C',
      whatToShow: 'Emergency Response Hub (`#/emergency`)',
      whatToSay:
        '"When an ambulance or fire truck is dispatched, every second counts. With traditional lights, ambulances get stuck in gridlock. TrafficPulse creates an automatic Green Corridor—preempting the signals so every light turns green right before the ambulance arrives, cutting hospital ETA by 40%."',
      actions: [
        {
          label: 'Open Emergency Hub',
          onClick: () => {
            navigate('#/emergency');
          },
        },
        {
          label: 'Dispatch Ambulance Now',
          onClick: () => {
            const idle = emergencyUnits.find((u) => u.state === 'Available');
            if (idle) {
              dispatchUnit(idle.id, 'INC-DEMO-001', 'J1_CENTRAL');
            }
          },
        },
      ],
      proTip: 'Click "Dispatch Ambulance" and watch the live telemetry route turn green on the map with countdown ETA.',
    },
    {
      step: 4,
      title: 'Real People: Commuters, Police & Operators',
      route: '#/user',
      badge: '5 Personas',
      badgeColor: '#A78BFA',
      whatToShow: 'Citizen Driver View (`#/user`) or Role Switcher',
      whatToSay:
        '"TrafficPulse isn\'t just for computers—it gives custom tools to everyone. Everyday drivers see live congestion heat and detour advice on their phones. Police chiefs can trigger road closures. And city administrators have full oversight and audit logs."',
      actions: [
        {
          label: 'Open Citizen App',
          onClick: () => {
            navigate('#/user');
          },
        },
        {
          label: 'Open Police Command',
          onClick: () => {
            navigate('#/police');
          },
        },
      ],
      proTip: 'Use the Role Switcher at the top right of the screen (Admin, Operator, Police, Emergency, Citizen) to show how each stakeholder sees only what they care about.',
    },
    {
      step: 5,
      title: 'The Bottom Line: Environmental & Economic Impact',
      route: '#/results',
      badge: 'Final Pitch',
      badgeColor: '#FFB547',
      whatToShow: 'Results & Proof (`#/results`)',
      whatToSay:
        '"Stopping cars from idling doesn\'t just save time—it saves our environment. In our city-wide benchmark, TrafficPulse saves 43% in average commute delay, cuts fuel consumption by 18%, and stops metric tons of CO2 emissions from entering the air every month."',
      actions: [
        {
          label: 'Open Results & Proof',
          onClick: () => {
            navigate('#/results');
          },
        },
        {
          label: 'Back to Overview',
          onClick: () => {
            navigate('#/');
          },
        },
      ],
      proTip: 'Conclude with: "TrafficPulse turns dumb concrete roads into an intelligent, breathing city infrastructure."',
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--surface)] border border-[var(--border-light)] shadow-2xl overflow-hidden text-[var(--text)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[#07090F]/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] shadow-md shadow-[#2EE6A6]/20">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-lg text-white">
                  Presenter & Pitch Guide
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#151C2E] text-[#2EE6A6] border border-[#2EE6A6]/30">
                  Layperson Ready
                </span>
              </div>
              <p className="text-xs text-[#8A94A9]">
                Everything you need to showcase TrafficPulse to someone with zero technical background.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A94A9] hover:text-white hover:bg-[var(--elevated)] transition-colors cursor-pointer"
            aria-label="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center border-b border-[var(--border)] bg-[var(--surface)] px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'walkthrough', label: '3-Minute Walkthrough', icon: Play },
            { id: 'scenarios', label: 'All Scenarios & Lab Tests', icon: Layers },
            { id: 'script', label: 'Verbatim Pitch Script', icon: Volume2 },
            { id: 'analogies', label: 'Everyday Analogies', icon: Lightbulb },
            { id: 'qa', label: 'Audience Q&A & FAQs', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#2EE6A6] text-white bg-[#151C2E]'
                    : 'border-transparent text-[#8A94A9] hover:text-white hover:bg-[#151C2E]/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2EE6A6]' : 'text-[#8A94A9]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 3-MINUTE WALKTHROUGH */}
          {activeTab === 'walkthrough' && (
            <div>
              {/* Step indicator bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1">
                  {steps.map((s, idx) => (
                    <button
                      key={s.step}
                      onClick={() => setCurrentStep(idx)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-data font-bold cursor-pointer transition-all ${
                        currentStep === idx
                          ? 'bg-[#2EE6A6] text-[#07090F] shadow-sm'
                          : 'bg-[#151C2E] text-[#8A94A9] hover:text-white'
                      }`}
                    >
                      <span>0{s.step}</span>
                      <span className="hidden sm:inline font-sans font-medium text-[11px]">
                        {s.title.split(':')[0]}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono-data text-[#8A94A9] shrink-0">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>

              {/* Step Card */}
              <div className="p-6 rounded-2xl bg-[#0E1320] border border-[var(--border-light)] shadow-lg space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border)]">
                  <div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold uppercase tracking-wider text-white inline-block mb-2"
                      style={{ backgroundColor: current.badgeColor }}
                    >
                      {current.badge}
                    </span>
                    <h4 className="font-heading font-bold text-xl text-white">
                      {current.title}
                    </h4>
                  </div>
                  <div className="text-xs font-mono-data text-[#8A94A9] bg-[#151C2E] px-3 py-1 rounded-lg border border-[var(--border)] self-start sm:self-auto">
                    Screen: {current.whatToShow}
                  </div>
                </div>

                {/* What to say */}
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider mb-2">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>What to say out loud:</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#07090F] border border-[var(--border)] text-sm sm:text-base leading-relaxed text-[#E8ECF5] italic font-serif">
                    {current.whatToSay}
                  </div>
                </div>

                {/* Actions & Live Buttons */}
                <div>
                  <div className="text-xs font-mono-data text-[#8A94A9] uppercase tracking-wider mb-2">
                    1-Click Presenter Actions:
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {current.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          act.onClick();
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#151C2E] hover:bg-[#2EE6A6] text-white hover:text-[#07090F] border border-[var(--border-light)] transition-all cursor-pointer flex items-center space-x-2 group shadow-sm"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#2EE6A6] group-hover:text-[#07090F] transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pro tip */}
                <div className="p-3.5 rounded-xl bg-[#151C2E]/60 border border-[var(--border)] text-xs text-[#8A94A9] flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-[#FFB547] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Presenter Pro-Tip: </strong>
                    {current.proTip}
                  </div>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-4">
                <button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#151C2E] text-[#8A94A9] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
                <button
                  disabled={currentStep === steps.length - 1}
                  onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VERBATIM PITCH SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0E1320] border border-[var(--border-light)]">
                <h4 className="font-heading font-bold text-base text-white mb-2 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2EE6A6]" />
                  <span>The 60-Second "Elevator" Pitch</span>
                </h4>
                <p className="text-sm text-[#8A94A9] leading-relaxed italic font-serif bg-[#07090F] p-3.5 rounded-xl border border-[var(--border)]">
                  "Cities lose billions of dollars and millions of hours every year to traffic. But here is the crazy part: almost all traffic signals are still controlled by dumb, pre-set kitchen timers that switch lights every 45 seconds even when nobody is waiting. TrafficPulse replaces that with an intelligent digital twin that watches real vehicles and flips lights dynamically. In our tests, it cuts commuter delays by 43%, clears emergency vehicles with automatic green corridors, and saves thousands of gallons of wasted fuel."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E1320] border border-[var(--border-light)] space-y-3">
                <h4 className="font-heading font-bold text-base text-white">
                  Step-by-Step Talking Script (Reading Order)
                </h4>
                
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-[#07090F] border border-[var(--border)]">
                    <span className="text-[#2EE6A6] font-bold font-mono-data mr-2">1. HOOK:</span>
                    <span className="text-[#E8ECF5]">
                      "Look at this live 3D city. You see cars approaching intersections. In normal cities, if 20 cars arrive from the North and 0 cars from the East, the North cars are forced to stop. Why? Because the timer is fixed."
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07090F] border border-[var(--border)]">
                    <span className="text-[#4F8CFF] font-bold font-mono-data mr-2">2. THE DEMO:</span>
                    <span className="text-[#E8ECF5]">
                      "Now I click 'Sim Lab'. Notice how we run both algorithms simultaneously on the exact same flow of cars. Notice how the green adaptive queue shrinks almost immediately, while the yellow fixed queue piles up."
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07090F] border border-[var(--border)]">
                    <span className="text-[#FF5C6C] font-bold font-mono-data mr-2">3. THE HERO:</span>
                    <span className="text-[#E8ECF5]">
                      "Now imagine an ambulance is carrying a critical patient. I click 'Dispatch Ambulance'. Notice how the lights along its path turn green in advance. The ambulance doesn't brake once. It arrives 40% faster."
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07090F] border border-[var(--border)]">
                    <span className="text-[#FFB547] font-bold font-mono-data mr-2">4. THE CLOSE:</span>
                    <span className="text-[#E8ECF5]">
                      "And because this is a Digital Twin testbed, cities can stress-test accidents, rainstorms, and stadium events safely before spending millions on real street hardware."
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMPLE ANALOGIES */}
          {activeTab === 'analogies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0E1320] border border-[var(--border)] space-y-2">
                <div className="flex items-center space-x-2 text-[#2EE6A6]">
                  <Lightbulb className="w-4 h-4" />
                  <h5 className="font-heading font-bold text-sm text-white">The Toaster Analogy</h5>
                </div>
                <p className="text-xs text-[#8A94A9] leading-relaxed">
                  <strong className="text-white">Fixed Timer: </strong>
                  Like a toaster set to 3 minutes every time, even if you put in a thin croissant that only needs 30 seconds.
                </p>
                <p className="text-xs text-[#8A94A9] leading-relaxed">
                  <strong className="text-[#2EE6A6]">TrafficPulse: </strong>
                  Like a smart sensor oven that checks when the bread is browned and pops it out instantly.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0E1320] border border-[var(--border)] space-y-2">
                <div className="flex items-center space-x-2 text-[#4F8CFF]">
                  <Car className="w-4 h-4" />
                  <h5 className="font-heading font-bold text-sm text-white">The Airport Runway Analogy</h5>
                </div>
                <p className="text-xs text-[#8A94A9] leading-relaxed">
                  Imagine an airport air traffic controller that gave runway access to an empty runway while 10 planes circled in the air waiting. That would be insane. Yet that is exactly what traditional traffic lights do every single minute.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0E1320] border border-[var(--border)] space-y-2">
                <div className="flex items-center space-x-2 text-[#FF5C6C]">
                  <Siren className="w-4 h-4" />
                  <h5 className="font-heading font-bold text-sm text-white">The VIP Police Escort</h5>
                </div>
                <p className="text-xs text-[#8A94A9] leading-relaxed">
                  Normally, only presidents get police escorts that open up traffic lights. TrafficPulse gives that VIP "Green Corridor" automatically to every single ambulance and fire truck responding to an emergency.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0E1320] border border-[var(--border)] space-y-2">
                <div className="flex items-center space-x-2 text-[#A78BFA]">
                  <Zap className="w-4 h-4" />
                  <h5 className="font-heading font-bold text-sm text-white">The "Flight Simulator" for Cities</h5>
                </div>
                <p className="text-xs text-[#8A94A9] leading-relaxed">
                  Pilots train on flight simulators before flying a real Boeing 747. TrafficPulse is a Flight Simulator for City Engineers—they can test what happens during a blizzard or a major crash without risking real human lives.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIENCE Q&A & FAQS */}
          {activeTab === 'qa' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Is this real traffic or computer simulation?',
                  a: 'It is a high-fidelity Digital Twin simulation. Every car follows realistic physical rules, Poisson arrival rates, and deceleration models. This lets us mathematically benchmark and prove the benefits safely.',
                },
                {
                  q: 'Do cities have to replace all their traffic light poles?',
                  a: 'No! Modern traffic controllers use standard NTCIP protocols. TrafficPulse connects to existing signal hardware and cameras via edge microcontrollers and software without tearing up the road.',
                },
                {
                  q: 'What happens if a sensor breaks or gets blinded by rain?',
                  a: 'TrafficPulse includes built-in Fail-Safe fallback rules! If a camera goes offline, the junction automatically falls back to safe fixed timings so traffic never halts dangerously.',
                },
                {
                  q: 'Can ordinary drivers use this on their phones?',
                  a: 'Yes! The Citizen View (`#/user`) provides real-time congestion alerts, detour recommendations, and an easy one-touch way to report roadside hazards.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0E1320] border border-[var(--border)] space-y-1.5">
                  <h5 className="font-heading font-bold text-xs sm:text-sm text-white flex items-center space-x-2">
                    <span className="text-[#2EE6A6] font-mono-data">Q:</span>
                    <span>{item.q}</span>
                  </h5>
                  <p className="text-xs text-[#8A94A9] leading-relaxed pl-5">
                    <strong className="text-[#4F8CFF] font-mono-data mr-1">Answer:</strong>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: ALL SCENARIOS & LAB TESTS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#0E1320] border border-[var(--border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-heading font-bold text-base text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#2EE6A6]" />
                    <span>Complete Simulation Scenarios Catalog</span>
                  </h4>
                  <p className="text-xs text-[#8A94A9] mt-0.5">
                    Every scenario built into TrafficPulse with direct 1-click test triggers and navigation.
                  </p>
                </div>
                <div className="text-[11px] font-mono-data bg-[#151C2E] px-3 py-1.5 rounded-xl border border-[var(--border)] text-[#2EE6A6]">
                  10 Core Scenarios + 17 Custom Incident Types
                </div>
              </div>

              {/* FEATURED: Interactive Accident Scenario Center */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF5C6C]/15 via-[#FFB547]/15 to-[#2EE6A6]/15 border-2 border-[#2EE6A6] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#2EE6A6] text-[#07090F]">
                      PRIMARY EXHIBITION SUITE
                    </span>
                    <span className="text-[11px] font-mono-data text-[#2EE6A6]">11 Connected Scenarios</span>
                  </div>
                  <h4 className="font-heading font-extrabold text-base text-white flex items-center space-x-2">
                    <AlertOctagon className="w-5 h-5 text-[#2EE6A6]" />
                    <span>Accident Scenario Control Center (Live Projector Mode)</span>
                  </h4>
                  <p className="text-xs text-[#8A94A9] max-w-xl">
                    Dedicated interactive simulation center with independent 1-click execution for all 10 operational accident phases (Detection, Verification, CAD Dispatch, Hospital Triage, Green Corridor Preemption, Rescue, Clearance, Pedestrian Detours, and Traffic Restoration) plus Full Automated Demonstration.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate('#/scenarios');
                    onClose();
                  }}
                  className="px-5 py-3 rounded-xl font-heading font-bold text-xs bg-[#2EE6A6] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#2EE6A6]/20 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <span>Launch Accident Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scenario 1: Adaptive vs Fixed Timer Benchmark */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#2EE6A6]/20 text-[#2EE6A6] border border-[#2EE6A6]/30">
                        SIM LAB • CORE BENCHMARK
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/lab</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-[#2EE6A6]" />
                      <span>1. Fixed vs. Adaptive AI Control</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Runs two parallel copies of identical vehicle queues side-by-side. The fixed controller cycles flat 25s, causing green light starvation. The adaptive controller senses queue pressure and cuts average wait times by 35%–43%.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/lab');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#2EE6A6] text-[#07090F] hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Open Sim Lab Benchmark</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSpeed(5)}
                      className="py-2 px-3 rounded-xl text-xs font-mono-data font-bold bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)] cursor-pointer"
                      title="Set Speed to 5x"
                    >
                      5x Speed
                    </button>
                  </div>
                </div>

                {/* Scenario 2: Rush-Hour Morning/Evening Surge */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/30">
                        SIM LAB • PEAK TRAFFIC
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Multipliers: 0.5x – 2.0x</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-[#FFB547]" />
                      <span>2. Rush-Hour Influx & Gridlock Stress Test</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Tests controller performance during extreme commuter rush (up to 2.0x normal arrival rate). Demonstrates dynamic green-extension preventing queue spillback into adjacent city blocks.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/lab');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#151C2E] hover:bg-[#FFB547] text-white hover:text-[#07090F] border border-[var(--border)] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Adjust Rush Multiplier in Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scenario 3: 30-Second Sudden Lane Blockage */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#FF5C6C]/20 text-[#FF5C6C] border border-[#FF5C6C]/30">
                        SIM LAB • RAPID STALL
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Phase A Blocked</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Flame className="w-4 h-4 text-[#FF5C6C]" />
                      <span>3. 30-Second Phase A Incident Blockage</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Artificially blocks North-South traffic for 30 seconds to simulate a sudden stall or breakdown. Shows queue ballooning and highlights how the adaptive algorithm clears the backlog twice as fast as fixed timers.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        injectIncident('phaseA', 30);
                        navigate('#/lab');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#FF5C6C] text-white hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Inject 30s Incident & Open Lab</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 4: Emergency Ambulance Green Corridor */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#2EE6A6]/20 text-[#2EE6A6] border border-[#2EE6A6]/30">
                        EMERGENCY CAD • LIFE-SAVING
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/emergency</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Siren className="w-4 h-4 text-[#2EE6A6]" />
                      <span>4. Code-Red Ambulance Green Corridor</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Preempts traffic lights along the route to Harbor Memorial Hospital. Turns signals green right as the ambulance approaches, forcing civilian traffic to yield safely and cutting hospital transit time by 40%.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const idle = emergencyUnits.find((u) => u.state === 'Available');
                        if (idle) {
                          dispatchUnit(idle.id, 'INC-DEMO-001', 'J1_CENTRAL');
                        }
                        navigate('#/emergency');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Siren className="w-3.5 h-3.5" />
                      <span>Dispatch Ambulance & Open Hub</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 5: Multi-Vehicle Pileup with Fire & Smoke */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#FF5C6C]/20 text-[#FF5C6C] border border-[#FF5C6C]/30">
                        INCIDENT HUB • 5-STAGE AI
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/incidents</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#FF5C6C]" />
                      <span>5. Critical Pileup with Fire/Smoke</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Simulates a major accident at J2 North Arterial with multiple vehicles and smoke. Tests the full 5-stage AI pipeline: Potential Detection → AI Confidence → Edge Verification → Severity Escalation → Confirmed Dispatch.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/incidents');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#151C2E] hover:bg-[#FF5C6C] text-white border border-[var(--border)] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Incidents & Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scenario 6: Reckless / Wrong-Way Driver Event */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/30">
                        POLICE TACTICAL • SAFETY
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/police</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-[#4F8CFF]" />
                      <span>6. Wrong-Way Vehicle on East Highway</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Simulates an errant vehicle traveling in the wrong direction at J4 East. Tests police chief cruiser dispatch, arterial lockdown, and live tactical broadcasting to oncoming drivers.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/police');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#4F8CFF] text-white hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Open Police Tactical Command</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 7: Full 17-Type Incident Injector */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30">
                        ADMIN • 17 INCIDENT TYPES
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/admin</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-[#A78BFA]" />
                      <span>7. Custom Incident Injector (17 Types)</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Customise any scenario: Car Crash, Breakdown, Sudden Jam, Signal Outage, Flooding, Fog, Pedestrian Crowd, Railway Crossing, Power Outage, and more. Choose junction node, direction, vehicles, lanes, and casualties.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/admin');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#A78BFA] text-[#07090F] hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Open Master Admin Injector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scenario 8: Fail-Safe Sensor Drop & Fallback */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/30">
                        FAIL-SAFE • RESILIENCE
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Hardware Faults</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Database className="w-4 h-4 text-[#4F8CFF]" />
                      <span>8. Sensor Outage & Fallback Hierarchy</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Simulate loss of Optical Camera Vision feeds or In-Pavement Inductive Loop Sensors. Tests graceful degradation down to deterministic timed fail-safe cycles so traffic never deadlocks.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/admin');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#151C2E] hover:bg-[#4F8CFF] text-white border border-[var(--border)] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Test Fail-Safe Telemetry Controls</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scenario 9: Citizen Road Hazard & Multi-Sensor Verification */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
                        CITIZEN & TMC • TRIANGULATION
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/reports</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <FileCheck className="w-4 h-4 text-[#38BDF8]" />
                      <span>9. Citizen Report & AI Verification Hub</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Drivers submit hazard reports from their mobile phones. The TMC Validation Hub cross-references edge cameras and inductive loop occupancy to prevent spam and verify real incidents.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/reports');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#38BDF8] text-[#07090F] hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Open Validation Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        navigate('#/user');
                        onClose();
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)] cursor-pointer"
                    >
                      Citizen App
                    </button>
                  </div>
                </div>

                {/* Scenario 10: 3D Digital Twin Day/Night & Weather */}
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-[#2EE6A6]/20 text-[#2EE6A6] border border-[#2EE6A6]/30">
                        3D CITY • DIGITAL TWIN
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8A94A9]">Route: #/city</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white flex items-center space-x-1.5">
                      <Compass className="w-4 h-4 text-[#2EE6A6]" />
                      <span>10. 3D Twin Network, Day/Night & Weather</span>
                    </h5>
                    <p className="text-xs text-[#8A94A9] leading-relaxed">
                      Inspect 4 connected junction nodes (Downtown Core, Tech Park, Harbor Crossing, West Bypass) with real-time Three.js vehicle movement, dynamic shadows, streetlight glow, and weather physics.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('#/city');
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Open 3D City Twin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleTheme()}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)] cursor-pointer"
                    >
                      {theme === 'light' ? 'Night' : 'Day'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[#07090F]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-[#8A94A9]">
            <CheckCircle2 className="w-4 h-4 text-[#2EE6A6]" />
            <span>Ready to present? Click any button to begin your live walkthrough.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/download-pdf"
              download="trafficpulse-codebase.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#151C2E] hover:bg-[#4F8CFF] text-[#4F8CFF] hover:text-white border border-[#4F8CFF]/40 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Download full project codebase as a 218-page vector PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Code (.PDF)</span>
            </a>

            <a
              href="/api/download-zip"
              download="trafficpulse.zip"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#151C2E] hover:bg-[#2EE6A6] text-[#2EE6A6] hover:text-[#07090F] border border-[#2EE6A6]/40 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Download project ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Code (.ZIP)</span>
            </a>
            <button
              onClick={() => {
                navigate('#/city');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 shadow-sm cursor-pointer"
            >
              Start at 3D City Twin
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#151C2E] text-white hover:bg-[#1e2638] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
