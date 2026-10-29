import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Shield,
  Siren,
  Sliders,
  User,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { UserRole } from '../types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLES: { id: UserRole; label: string; desc: string; icon: any; color: string }[] = [
  {
    id: 'ADMIN',
    label: 'City Admin',
    desc: 'Full system tuning, controller constants, and settings access',
    icon: Sliders,
    color: '#4F8CFF',
  },
  {
    id: 'OPERATOR',
    label: 'TMC Operator',
    desc: 'Traffic management console, junction telemetrics, and lab controls',
    icon: Wrench,
    color: '#2EE6A6',
  },
  {
    id: 'POLICE',
    label: 'Traffic Police',
    desc: 'Corridor surveillance, priority signals, and incident dispatch view',
    icon: Shield,
    color: '#38BDF8',
  },
  {
    id: 'EMERGENCY',
    label: 'Emergency Response',
    desc: 'Ambulance corridor preemption and flood/storm hazard overview',
    icon: Siren,
    color: '#FF5C6C',
  },
  {
    id: 'USER',
    label: 'Citizen / Public',
    desc: 'Public commuter overview, 3D live junction and transparent proof',
    icon: User,
    color: '#E8ECF5',
  },
];

import { useSimulation } from '../context/SimulationContext';

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const { isAdminAuthenticated, openAdminAuthModal } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeDef = ROLES.find((r) => r.id === currentRole) || ROLES[0];
  const Icon = activeDef.icon;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#0E1320] border border-[var(--border)] hover:border-[var(--border-light)] text-xs transition-all cursor-pointer"
        title="Switch simulated role persona"
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: activeDef.color }}
        />
        <span className="font-semibold text-white">{activeDef.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8A94A9]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-72 glass-panel-elevated p-3 rounded-2xl border border-[var(--border-light)] shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#FFB547]/10 border border-[#FFB547]/20 rounded-lg text-[10px] text-[#FFB547]">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Role personas filter views &amp; notifications</span>
          </div>

          <div className="space-y-1">
            {ROLES.map((role) => {
              const isSelected = role.id === currentRole;
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    onRoleChange(role.id);
                    setIsOpen(false);
                    if (role.id === 'ADMIN' && !isAdminAuthenticated) {
                      openAdminAuthModal();
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-[#151C2E] border border-[var(--border-light)] text-white shadow-sm'
                      : 'hover:bg-[#0E1320] text-[#8A94A9] hover:text-white'
                  }`}
                >
                  <div
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{
                      backgroundColor: `${role.color}18`,
                      color: role.color,
                    }}
                  >
                    <RoleIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>{role.label}</span>
                      {isSelected && (
                        <span className="text-[10px] text-[#2EE6A6] font-mono-data">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8A94A9] mt-0.5 leading-snug">
                      {role.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
