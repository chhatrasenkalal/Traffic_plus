import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const ToastNotification: React.FC = () => {
  const { toast, dismissToast, userRole } = useSimulation();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [toast, dismissToast]);

  if (!toast || !toast.targetRoles.includes(userRole)) return null;

  const isCritical = toast.severity === 'CRITICAL';
  const isHigh = toast.severity === 'HIGH';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 right-4 z-50 max-w-sm w-full pointer-events-auto"
      >
        <div
          className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start space-x-3 text-xs ${
            isCritical
              ? 'bg-[#FF5C6C]/15 border-[#FF5C6C] text-[#E8ECF5]'
              : isHigh
              ? 'bg-[#FFB547]/15 border-[#FFB547] text-[#E8ECF5]'
              : 'bg-[#151C2E]/95 border-[var(--border-light)] text-[#E8ECF5]'
          }`}
        >
          <div
            className={`p-2 rounded-xl flex-shrink-0 ${
              isCritical
                ? 'bg-[#FF5C6C]/20 text-[#FF5C6C]'
                : isHigh
                ? 'bg-[#FFB547]/20 text-[#FFB547]'
                : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            ) : isHigh ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-heading font-bold text-white text-xs truncate">
                {toast.title}
              </span>
              <span className="text-[10px] font-mono-data text-[#8A94A9]">
                {toast.timestamp}
              </span>
            </div>
            <p className="text-[11px] text-[#8A94A9] leading-relaxed line-clamp-2">
              {toast.message}
            </p>
          </div>

          <button
            onClick={dismissToast}
            className="p-1 rounded-lg text-[#8A94A9] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
