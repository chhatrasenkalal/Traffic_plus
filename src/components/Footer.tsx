import React from 'react';
import { Activity, Cpu, Download, FileText, ShieldCheck } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto no-print transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Disclaimer & Brand */}
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-[var(--text)] font-medium">
            <Cpu className="w-4 h-4 text-[#4F8CFF]" />
            <span>TrafficPulse Autonomous Digital Twin</span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-mono-data rounded bg-[var(--elevated)] text-[var(--adaptive-positive)] border border-[var(--border)]">
              Simulation Only
            </span>
          </div>
          <p className="max-w-xl text-[11px] leading-relaxed text-[var(--muted)]">
            This application is a 100% software-based digital twin comparing Fixed cycle vs. Adaptive dynamic signal timing on identical Poisson arrival streams. Calibrated to empirical bimodal metropolitan commute patterns.
          </p>
        </div>

        {/* Center: Quick navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs max-w-lg">
          <button onClick={() => navigate('#/city')} className="hover:text-white transition-colors cursor-pointer">
            3D City
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/lab')} className="hover:text-white transition-colors cursor-pointer">
            Sim Lab
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/incidents')} className="hover:text-white transition-colors cursor-pointer">
            Incidents
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/emergency')} className="hover:text-white transition-colors cursor-pointer">
            EOC Emergency
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/police')} className="hover:text-white transition-colors cursor-pointer">
            Police
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/user')} className="hover:text-white transition-colors cursor-pointer">
            Citizen Hub
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/reports')} className="hover:text-white transition-colors cursor-pointer">
            Validation Hub
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/intelligence')} className="hover:text-white transition-colors cursor-pointer">
            Intelligence
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/results')} className="hover:text-white transition-colors cursor-pointer">
            Results & PDF
          </button>
          <span className="text-[#151C2E]">•</span>
          <button onClick={() => navigate('#/admin')} className="hover:text-white transition-colors cursor-pointer">
            Admin Panel
          </button>
        </div>

        {/* Right: Integrity Badge & Downloads */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/download-pdf"
            download="trafficpulse-codebase.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#4F8CFF] bg-[#0E1320] hover:bg-[#151C2E] px-3 py-1.5 rounded-lg border border-[#4F8CFF]/30 hover:border-[#4F8CFF] transition-all cursor-pointer shadow-sm"
            title="Download full project codebase as a comprehensive 218-page PDF"
          >
            <FileText className="w-3.5 h-3.5 text-[#4F8CFF]" />
            <span>Codebase (.PDF)</span>
          </a>

          <a
            href="/api/download-zip"
            download="trafficpulse.zip"
            className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#2EE6A6] bg-[#0E1320] hover:bg-[#151C2E] px-3 py-1.5 rounded-lg border border-[#2EE6A6]/30 hover:border-[#2EE6A6] transition-all cursor-pointer shadow-sm"
            title="Download full project source code as a ZIP file"
          >
            <Download className="w-3.5 h-3.5 text-[#2EE6A6]" />
            <span>Code (.ZIP)</span>
          </a>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#8A94A9] bg-[#0E1320] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2EE6A6]" />
            <span>Synchronized Deterministic Seed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
