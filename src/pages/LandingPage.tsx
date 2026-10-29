import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Car,
  AlertOctagon,
  AlertTriangle,
  Radio,
  Siren,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Presentation,
  Play,
  Lightbulb,
  FileText,
  Download,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { PresentationGuideModal } from '../components/PresentationGuideModal';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { metrics } = useSimulation();
  const [presentationModalOpen, setPresentationModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#07090F] overflow-hidden text-[#E8ECF5]">
      {/* Background Animated City Grid & Drifting Light Trails */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#4F8CFF]/10 via-[#2EE6A6]/8 to-transparent rounded-full blur-[140px]" />
        
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Drifting traffic light trails (motion) */}
        <motion.div
          animate={{
            x: ['-10%', '110%'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-[28%] left-0 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#2EE6A6] to-transparent shadow-[0_0_12px_#2EE6A6]"
        />
        <motion.div
          animate={{
            x: ['110%', '-10%'],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
          className="absolute top-[35%] left-0 w-64 h-[2px] bg-gradient-to-r from-transparent via-[#4F8CFF] to-transparent shadow-[0_0_12px_#4F8CFF]"
        />
        <motion.div
          animate={{
            y: ['-10%', '110%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'linear',
            delay: 1,
          }}
          className="absolute left-[30%] top-0 h-44 w-[2px] bg-gradient-to-b from-transparent via-[#FFB547] to-transparent shadow-[0_0_12px_#FFB547]"
        />
        <motion.div
          animate={{
            y: ['110%', '-10%'],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: 'linear',
            delay: 4,
          }}
          className="absolute right-[25%] top-0 h-52 w-[2px] bg-gradient-to-b from-transparent via-[#2EE6A6] to-transparent shadow-[0_0_12px_#2EE6A6]"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        {/* Verification badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0E1320] border border-[var(--border-light)] text-xs text-[#8A94A9] mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#2EE6A6] animate-pulse" />
          <span className="font-mono-data text-white font-medium">Digital Twin Live Proof</span>
          <span className="text-[#8A94A9]">•</span>
          <span>Dual Parallel Controllers Active</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]"
        >
          Traffic that <span className="bg-gradient-to-r from-[#2EE6A6] via-[#4F8CFF] to-white bg-clip-text text-transparent">thinks.</span>
        </motion.h1>

        {/* Problem Statement as specified in Section 1 */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-[#8A94A9] leading-relaxed mb-10 font-normal"
        >
          To observe operational patterns in urban environments and demonstrate a system for improvement.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12"
        >
          <button
            onClick={() => navigate('#/city')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-heading font-semibold text-sm bg-gradient-to-r from-[#2EE6A6] to-[#4F8CFF] text-[#07090F] hover:brightness-110 shadow-lg shadow-[#2EE6A6]/20 transition-all cursor-pointer flex items-center justify-center space-x-2 group"
          >
            <span>Launch Live City</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('#/scenarios')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-semibold text-sm bg-gradient-to-r from-[#FF5C6C]/20 via-[#FFB547]/20 to-[#2EE6A6]/20 border border-[#2EE6A6] text-white hover:brightness-125 shadow-lg shadow-[#2EE6A6]/20 transition-all cursor-pointer flex items-center justify-center space-x-2 group"
          >
            <AlertOctagon className="w-4 h-4 text-[#2EE6A6] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[#2EE6A6]">Accident Scenario Center</span>
          </button>
          <button
            onClick={() => navigate('#/results')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-semibold text-sm bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border-light)] transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>See Results & Proof</span>
            <ChevronRight className="w-4 h-4 text-[#8A94A9]" />
          </button>
          <button
            onClick={() => setPresentationModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-semibold text-sm bg-gradient-to-r from-[#2EE6A6]/15 to-[#4F8CFF]/15 text-[#2EE6A6] hover:bg-[#2EE6A6]/25 border border-[#2EE6A6]/40 transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
          >
            <Presentation className="w-4 h-4 text-[#2EE6A6]" />
            <span>All Scenarios & Pitch Guide</span>
          </button>
          <a
            href="/api/download-pdf"
            download="trafficpulse-codebase.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-heading font-semibold text-sm bg-[#151C2E] hover:bg-[#1e2638] text-[#4F8CFF] border border-[#4F8CFF]/30 transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
            title="Download full project codebase as a 218-page vector PDF"
          >
            <FileText className="w-4 h-4 text-[#4F8CFF]" />
            <span>Codebase (.PDF)</span>
          </a>
        </motion.div>

        {/* 4-Step Quick Pitch Banner for Presenters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="max-w-4xl mx-auto mb-16 p-4 sm:p-5 rounded-2xl bg-[#0E1320]/80 border border-[var(--border)] text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[var(--border)] gap-2">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-[#FFB547]" />
              <span className="font-heading font-bold text-sm text-white">
                How to Present TrafficPulse & Test All Scenarios:
              </span>
            </div>
            <button
              onClick={() => setPresentationModalOpen(true)}
              className="text-xs text-[#2EE6A6] hover:underline font-mono-data font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>View all scenarios, script & lab tests</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#07090F]/60 border border-[var(--border)]">
              <span className="text-[#2EE6A6] font-mono-data font-bold block mb-1">1. The Hook (3D City)</span>
              <p className="text-[#8A94A9]">"Traditional lights run on dumb clocks. TrafficPulse is a smart digital twin that watches real traffic."</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#07090F]/60 border border-[var(--border)]">
              <span className="text-[#4F8CFF] font-mono-data font-bold block mb-1">2. The Proof (Sim Lab)</span>
              <p className="text-[#8A94A9]">"We test fixed timer vs adaptive AI on identical traffic: adaptive cuts waiting delay by ~35-43%."</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#07090F]/60 border border-[var(--border)]">
              <span className="text-[#FF5C6C] font-mono-data font-bold block mb-1">3. The Hero (Ambulance)</span>
              <p className="text-[#8A94A9]">"Green Corridor flips lights green ahead of an ambulance so it never brakes in traffic."</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#07090F]/60 border border-[var(--border)]">
              <span className="text-[#FFB547] font-mono-data font-bold block mb-1">4. The Impact (Results)</span>
              <p className="text-[#8A94A9]">"Less idling means cleaner air, less fuel burned, and happier commuters every single day."</p>
            </div>
          </div>
        </motion.div>

        {/* Live Parallel Teaser Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel-elevated rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto text-left shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2EE6A6]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono-data text-[#8A94A9] uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2EE6A6]" />
                <span>Simulated Urban Corridor Telemetry</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-white">
                Live Intersection Benchmark
              </h3>
            </div>
            <div className="flex items-center space-x-3 bg-[#07090F]/70 px-4 py-2 rounded-xl border border-[var(--border)]">
              <Clock className="w-4 h-4 text-[#4F8CFF]" />
              <span className="text-xs text-[#8A94A9]">Sim Time:</span>
              <span className="font-mono-data text-xs font-bold text-white">
                {metrics.timeOfDayString}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold bg-[#151C2E] text-[#2EE6A6]">
                {metrics.intensityCurrent}% Intensity
              </span>
            </div>
          </div>

          {/* Quick Metrics Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Fixed avg wait */}
            <div className="p-4 rounded-xl bg-[#07090F]/50 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8A94A9]">Fixed Timer Wait</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFB547]/15 text-[#FFB547] border border-[#FFB547]/30">
                  Flat 25s
                </span>
              </div>
              <div className="font-mono-data text-3xl font-bold text-[#FFB547]">
                {metrics.fixed.avgWait.toFixed(1)}s
              </div>
              <p className="text-xs text-[#8A94A9] mt-1">
                Max queue: {metrics.fixed.maxQueue} vehicles
              </p>
            </div>

            {/* Adaptive avg wait */}
            <div className="p-4 rounded-xl bg-[#07090F]/50 border border-[var(--border)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8A94A9]">Adaptive Controller</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2EE6A6]/15 text-[#2EE6A6] border border-[#2EE6A6]/30">
                  Dynamic Queue
                </span>
              </div>
              <div className="font-mono-data text-3xl font-bold text-[#2EE6A6]">
                {metrics.adaptive.avgWait.toFixed(1)}s
              </div>
              <p className="text-xs text-[#8A94A9] mt-1">
                Max queue: {metrics.adaptive.maxQueue} vehicles
              </p>
            </div>

            {/* Measured Improvement % */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#151C2E] to-[#0E1320] border border-[#2EE6A6]/30 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#E8ECF5] font-medium">Delay Reduction</span>
                <TrendingUp className="w-4 h-4 text-[#2EE6A6]" />
              </div>
              <div className="font-mono-data text-3xl font-bold text-[#2EE6A6]">
                +{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : '0.0'}%
              </div>
              <p className="text-xs text-[#8A94A9] mt-1">
                Throughput: {metrics.adaptive.totalProcessed} vehicles cleared
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 1: The Problem */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--border)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono-data text-[#FFB547] uppercase tracking-wider font-semibold">
            The Structural Dilemma
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
            Static Cycles Waste Millions of Commuter Hours
          </h2>
          <p className="text-[#8A94A9] text-base leading-relaxed">
            Conventional traffic infrastructure operates on pre-programmed fixed timers configured decades ago. When demand surges or incidents happen, static timers fail uniformly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl hover:translate-y-[-2px] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFB547]/10 flex items-center justify-center text-[#FFB547] mb-5 border border-[#FFB547]/20">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Empty-Phase Green Waste
            </h3>
            <p className="text-sm text-[#8A94A9] leading-relaxed">
              Fixed lights give 25 seconds of green to empty cross streets while dozens of vehicles idle on the primary arterial road, burning fuel and stacking queues.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:translate-y-[-2px] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FF5C6C]/10 flex items-center justify-center text-[#FF5C6C] mb-5 border border-[#FF5C6C]/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Spillback Blindness
            </h3>
            <p className="text-sm text-[#8A94A9] leading-relaxed">
              When a minor incident or sudden delivery truck blocks a lane, fixed controllers have zero awareness, causing gridlock that spills back into upstream junctions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:translate-y-[-2px] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#4F8CFF]/10 flex items-center justify-center text-[#4F8CFF] mb-5 border border-[#4F8CFF]/20">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Unbalanced Starvation
            </h3>
            <p className="text-sm text-[#8A94A9] leading-relaxed">
              Without algorithmic starvation caps, high-volume avenues perpetually congest, forcing cross-street drivers to wait through redundant, unresponsive intervals.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: How It Works (Observe → Decide → Improve) */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--border)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider font-semibold">
            Autonomous Pipeline
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
            How TrafficPulse Solves It
          </h2>
          <p className="text-[#8A94A9] text-base leading-relaxed">
            A real-time feedback loop continuously harmonizing signal green splits to match physical vehicular queue pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Card 1: Observe */}
          <div className="glass-panel p-7 rounded-2xl relative border-t-2 border-t-[#4F8CFF]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono-data text-xs text-[#4F8CFF] font-bold">01 / OBSERVE</span>
              <Radio className="w-5 h-5 text-[#4F8CFF]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white mb-3">
              Telemetry & Arrival Waves
            </h3>
            <p className="text-sm text-[#8A94A9] leading-relaxed mb-4">
              Continuous per-second vehicle detection on all four approaches, coupled with citizen incident signals and hourly commuter curve tracking.
            </p>
            <ul className="text-xs text-[#8A94A9] space-y-2 border-t border-[var(--border)] pt-4">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                <span>Poisson arrival density sampling</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                <span>Crowdsourced citizen alerts</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Decide */}
          <div className="glass-panel p-7 rounded-2xl relative border-t-2 border-t-[#2EE6A6]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono-data text-xs text-[#2EE6A6] font-bold">02 / DECIDE</span>
              <SlidersHorizontal className="w-5 h-5 text-[#2EE6A6]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white mb-3">
              Queue Ratio Optimization
            </h3>
            <p className="text-sm text-[#8A94A9] leading-relaxed mb-4">
              Dynamic green timing: 15s base green + up to 20s extra scaled by queue disparity. Hard 60s max wait starvation limit protects cross-traffic.
            </p>
            <ul className="text-xs text-[#8A94A9] space-y-2 border-t border-[var(--border)] pt-4">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2EE6A6]" />
                <span>Dynamic extra green proportional to queue</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2EE6A6]" />
                <span>Zero vehicle starvation threshold</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Improve */}
          <div className="glass-panel p-7 rounded-2xl relative border-t-2 border-t-[#FFB547]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono-data text-xs text-[#FFB547] font-bold">03 / IMPROVE</span>
              <TrendingUp className="w-5 h-5 text-[#FFB547]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white mb-3">
              Parallel Digital Twin Proof
            </h3>
            <p className="text-sm text-[#8A94A9] leading-relaxed mb-4">
              Both fixed and adaptive controllers run concurrently on the exact same randomized traffic seed, verifying 20% to 45% lower commuter delay in real time.
            </p>
            <ul className="text-xs text-[#8A94A9] space-y-2 border-t border-[var(--border)] pt-4">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB547]" />
                <span>Live comparison of queue depth</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB547]" />
                <span>Immediate emissions & idle reduction</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: Live Proof (Animated Counters) */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--border)] mb-12">
        <div className="glass-panel-elevated p-8 sm:p-12 rounded-3xl border border-[#2EE6A6]/20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-mono-data text-[#2EE6A6] uppercase tracking-wider font-semibold">
                Live Digital Twin Proof
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white mt-2 mb-4">
                Empirical Proof in Every Tick
              </h2>
              <p className="text-[#8A94A9] text-base leading-relaxed mb-8">
                Explore the live 3D junction or top-down simulation lab. Experience how dynamic signal actuation eliminates stagnant intersections during morning and evening rush hours.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('#/city')}
                  className="px-6 py-3 rounded-xl font-heading font-semibold text-sm bg-[#2EE6A6] text-[#07090F] hover:bg-[#25be89] transition-all cursor-pointer flex items-center space-x-2"
                >
                  <span>Enter 3D City View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('#/lab')}
                  className="px-6 py-3 rounded-xl font-heading font-semibold text-sm bg-[#151C2E] text-white hover:bg-[#1e2638] border border-[var(--border)] transition-all cursor-pointer flex items-center space-x-2"
                >
                  <span>Open 2D Simulation Lab</span>
                  <ChevronRight className="w-4 h-4 text-[#8A94A9]" />
                </button>
              </div>
            </div>

            {/* Live Proof Counters */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-[#07090F]/80 p-5 rounded-2xl border border-[var(--border)]">
                <span className="text-xs text-[#8A94A9] block">Measured Delay Improvement</span>
                <div className="font-mono-data text-4xl font-bold text-[#2EE6A6] mt-1">
                  +{metrics.improvementPercent > 0 ? metrics.improvementPercent.toFixed(1) : '0.0'}%
                </div>
                <p className="text-[11px] text-[#8A94A9] mt-1">
                  Average commute wait: {metrics.adaptive.avgWait.toFixed(1)}s (Adaptive) vs {metrics.fixed.avgWait.toFixed(1)}s (Fixed)
                </p>
              </div>

              <div className="bg-[#07090F]/80 p-5 rounded-2xl border border-[var(--border)]">
                <span className="text-xs text-[#8A94A9] block">Vehicles Cleared Concurrently</span>
                <div className="font-mono-data text-4xl font-bold text-white mt-1">
                  {metrics.adaptive.totalProcessed.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#8A94A9] mt-1">
                  Synchronous arrivals: {metrics.adaptive.totalArrivals.toLocaleString()} vehicles ingested
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pitch & Presenter Guide Modal */}
      <PresentationGuideModal
        isOpen={presentationModalOpen}
        onClose={() => setPresentationModalOpen(false)}
        navigate={navigate}
      />
    </div>
  );
};
