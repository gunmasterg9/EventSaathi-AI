import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { EventProvider, useEvent } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { EventDashboard } from './components/EventDashboard';
import { PlanViewer } from './components/PlanViewer';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TimelineView } from './components/TimelineView';
import { VendorManager } from './components/VendorManager';
import { EventWizard } from './components/EventWizard';
import { SavedEventsModal } from './components/SavedEventsModal';
import { SettingsModal } from './components/SettingsModal';

const MainLayout: React.FC = () => {
  const { currentEvent } = useEvent();
  const { t } = useLanguage();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [savedModalOpen, setSavedModalOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenWizard={() => setWizardOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSavedEvents={() => setSavedModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {!currentEvent ? (
          <LandingHero onOpenWizard={() => setWizardOpen(true)} />
        ) : (
          <div>
            {currentTab === 'dashboard' && <EventDashboard onNavigateTab={setCurrentTab} />}
            {currentTab === 'plan' && <PlanViewer />}
            {currentTab === 'budget' && <BudgetPlanner />}
            {currentTab === 'timeline' && <TimelineView />}
            {currentTab === 'vendors' && <VendorManager />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-800">
            <span className="bg-gradient-to-r from-brand-900 via-rose-700 to-amber-600 bg-clip-text text-transparent text-sm">
              EventSaathi AI
            </span>
            <span>•</span>
            <span className="text-slate-600 font-semibold">{t.brandTagline}</span>
          </div>
          <p className="text-slate-400">
            PromptWars Challenge 5 MVP • Multilingual (English, हिंदी, ગુજરાતી) • Decimal-Safe Budget Intelligence • SQLite & FastAPI Architecture
          </p>
        </div>
      </footer>

      {/* Modals */}
      <EventWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => setCurrentTab('dashboard')}
      />

      <SavedEventsModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        onOpenWizard={() => setWizardOpen(true)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <EventProvider>
        <MainLayout />
      </EventProvider>
    </LanguageProvider>
  );
};

export default App;
