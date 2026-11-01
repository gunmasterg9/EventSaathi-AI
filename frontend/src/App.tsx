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
import { GuestManager } from './components/GuestManager';
import { EventItem, EventCreateInput } from './types';
import { ChatPlanner, chatLabels } from './components/ChatPlanner';
import { EventOperations } from './components/EventOperations';

const MainLayout: React.FC = () => {
  const { currentEvent, error, clearError } = useEvent();
  const { t, language } = useLanguage();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState<EventCreateInput | null>(null);
  const openNewEvent = () => { setChatDraft(null); setEditingEvent(null); setWizardOpen(true); };
  const [savedModalOpen, setSavedModalOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenWizard={openNewEvent}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSavedEvents={() => setSavedModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-12">
        {error && (
          <div role="alert" className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <span>{error}</span>
            <button onClick={clearError} aria-label="Dismiss error" className="font-bold px-2 py-1">×</button>
          </div>
        )}
        {!currentEvent ? (
          <LandingHero onOpenWizard={openNewEvent} />
        ) : (
          <div>
            {currentTab === 'dashboard' && <EventDashboard onNavigateTab={setCurrentTab} onEditEvent={() => { setEditingEvent(currentEvent); setWizardOpen(true); }} />}
            {currentTab === 'plan' && <PlanViewer />}
            {currentTab === 'budget' && <BudgetPlanner />}
            {currentTab === 'timeline' && <TimelineView />}
            {currentTab === 'vendors' && <VendorManager />}
            {currentTab === 'guests' && <GuestManager key={currentEvent.id} eventId={currentEvent.id} />}
            {currentTab === 'operations' && <EventOperations key={currentEvent.id} eventId={currentEvent.id} onTimeline={() => setCurrentTab('timeline')} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 pt-8 pb-28 sm:pb-8 text-center text-xs text-slate-500">
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
      <div className="chat-launcher fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-40 border-t border-rose-100 bg-white/95 p-3 sm:p-0 sm:border-0 sm:bg-transparent">
        <button onClick={() => setChatOpen(true)} className="w-full sm:w-auto rounded-xl sm:rounded-full bg-rose-700 px-4 py-3 text-sm font-bold text-white shadow-lg border border-rose-600">{chatLabels[language].title}</button>
      </div>
      {chatOpen && <ChatPlanner onClose={() => setChatOpen(false)} onForm={() => { setChatOpen(false); openNewEvent(); }} onReview={input => {
        setChatOpen(false); setEditingEvent(null); setChatDraft(input); setWizardOpen(true);
      }} />}
      {wizardOpen && <EventWizard
        key={editingEvent?.id || 'new'}
        editingEvent={editingEvent}
        initialInput={chatDraft}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => setCurrentTab('dashboard')}
      />}

      <SavedEventsModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        onOpenWizard={openNewEvent}
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
