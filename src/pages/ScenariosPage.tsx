// ScenariosPage: Main Scenario Control & Exhibition Page for TrafficPulse
import React, { useState } from 'react';
import { EventLog } from '../components/scenarios/EventLog';
import { PresentationMode } from '../components/scenarios/PresentationMode';
import { ScenarioCenter } from '../components/scenarios/ScenarioCenter';
import { ScenarioStage } from '../components/scenarios/ScenarioStage';
import { StageInfoPanel } from '../components/scenarios/StageInfoPanel';
import { StatusPanels } from '../components/scenarios/StatusPanels';
import { ScenarioProvider, useScenario } from '../scenarios/ScenarioContext';

interface ScenariosPageProps {
  isPresentationOnly?: boolean;
}

const ScenariosPageContent: React.FC<{ isPresentationOnly?: boolean }> = ({ isPresentationOnly = false }) => {
  const [isPresentationMode, setIsPresentationMode] = useState(isPresentationOnly);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // If in Presentation Mode, render full-viewport projector mode
  if (isPresentationMode || isPresentationOnly) {
    return (
      <PresentationMode
        onExit={() => {
          setIsPresentationMode(false);
          if (window.location.hash === '#/present') {
            window.location.hash = '#/scenarios';
          }
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Scenario Control Center */}
      <ScenarioCenter
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(true)}
        showTechDetails={showTechDetails}
        onToggleTechDetails={() => setShowTechDetails(!showTechDetails)}
      />

      {/* Main Animated Intersection Stage */}
      <ScenarioStage />

      {/* Collapsible Deep Tech Proof Panel */}
      {showTechDetails && <StageInfoPanel />}

      {/* Synchronized Multi-Agency Telemetry Status Panels */}
      <StatusPanels />

      {/* Deterministic Chronological Event Log */}
      <EventLog />
    </div>
  );
};

export const ScenariosPage: React.FC<ScenariosPageProps> = ({ isPresentationOnly = false }) => {
  return (
    <ScenarioProvider>
      <ScenariosPageContent isPresentationOnly={isPresentationOnly} />
    </ScenarioProvider>
  );
};
