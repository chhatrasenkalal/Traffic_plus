import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminAuthBar } from './components/AdminAuthBar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LiveCityPage } from './pages/LiveCityPage';
import { LabPage } from './pages/LabPage';
import { ReportPage } from './pages/ReportPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { AdminPage } from './pages/AdminPage';
import { ResultsPage } from './pages/ResultsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { PolicePage } from './pages/PolicePage';
import { UserPage } from './pages/UserPage';
import { ReportsHubPage } from './pages/ReportsHubPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { LoginPage } from './pages/LoginPage';
import { ToastNotification } from './components/ToastNotification';

function AppContent() {
  const [currentHash, setCurrentHash] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  const { isAdminAuthModalOpen, closeAdminAuthModal } = useSimulation();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentHash(route);
    window.scrollTo(0, 0);
  };

  const isPresenting = currentHash === '#/present';

  const getPageName = (hash: string) => {
    switch (hash) {
      case '#/city':
        return '3D Digital Twin';
      case '#/simulation':
      case '#/lab':
        return 'Simulation Lab';
      case '#/scenarios':
      case '#/accident-sim':
        return 'Accident Scenario Center';
      case '#/incidents':
        return 'Incident Management';
      case '#/emergency':
        return 'Emergency CAD Dispatch';
      case '#/police':
        return 'Police Operations';
      case '#/user':
        return 'Citizen Portal';
      case '#/reports':
        return 'Validation Hub';
      case '#/report':
        return 'Citizen Report Submission';
      case '#/intelligence':
        return 'TMC Intelligence';
      case '#/results':
        return 'Results & Proof';
      case '#/admin':
        return 'Administration Console';
      case '#/login':
      case '#/auth':
        return 'Role & Interface Authentication Center';
      case '#/':
      default:
        return 'Command Overview';
    }
  };

  const renderCurrentPage = () => {
    switch (currentHash) {
      case '#/login':
      case '#/auth':
        return <LoginPage navigate={navigate} />;
      case '#/scenarios':
      case '#/accident-sim':
        return <ScenariosPage />;
      case '#/present':
        return <ScenariosPage isPresentationOnly={true} />;
      case '#/simulation':
      case '#/lab':
        return <LabPage />;
      case '#/city':
        return <LiveCityPage />;
      case '#/incidents':
        return <IncidentsPage />;
      case '#/emergency':
        return <EmergencyPage />;
      case '#/police':
        return <PolicePage />;
      case '#/user':
        return <UserPage navigate={navigate} />;
      case '#/reports':
        return <ReportsHubPage />;
      case '#/report':
        return <ReportPage navigate={navigate} />;
      case '#/intelligence':
        return <IntelligencePage />;
      case '#/admin':
        return <AdminPage />;
      case '#/results':
        return <ResultsPage />;
      case '#/':
      case '':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] selection:bg-[#4F8CFF]/30 selection:text-white relative transition-colors duration-200">
      {!isPresenting && <Navbar currentRoute={currentHash} navigate={navigate} />}
      <ToastNotification />
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={closeAdminAuthModal}
        navigate={navigate}
      />

      <main className="flex-1 flex flex-col">
        {/* Top Role-Aware Interface Authentication Bar displayed on content pages */}
        {!isPresenting &&
          currentHash !== '#/admin' &&
          currentHash !== '#/login' &&
          currentHash !== '#/auth' && (
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
              <AdminAuthBar pageName={getPageName(currentHash)} navigate={navigate} />
            </div>
          )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentHash}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isPresenting && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
