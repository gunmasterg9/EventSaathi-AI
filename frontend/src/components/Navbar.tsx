import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  IndianRupee,
  CheckSquare,
  Users,
  PlusCircle,
  Settings,
  Globe,
  Menu,
  X,
  FolderOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { Language } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenWizard: () => void;
  onOpenSettings: () => void;
  onOpenSavedEvents: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenWizard,
  onOpenSettings,
  onOpenSavedEvents,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentEvent, events, selectEvent, health } = useEvent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: Calendar },
    { id: 'plan', label: t.navPlan, icon: Sparkles },
    { id: 'budget', label: t.navBudget, icon: IndianRupee },
    { id: 'timeline', label: t.navTimeline, icon: CheckSquare },
    { id: 'vendors', label: t.navVendors, icon: Users },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 group text-left focus:outline-none"
              aria-label="EventSaathi AI Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-900 via-rose-700 to-amber-600 bg-clip-text text-transparent">
                  {t.brandName}
                </span>
                <span className="hidden sm:block text-xs font-medium text-slate-500">
                  {t.brandTagline}
                </span>
              </div>
            </button>

            {/* Active Event Indicator */}
            {currentEvent && (
              <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200">
                <select
                  aria-label="Switch celebration event"
                  value={currentEvent.id}
                  onChange={(e) => selectEvent(e.target.value)}
                  className="text-xs font-semibold text-brand-900 bg-rose-50/70 border border-rose-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-brand-500 focus:outline-none max-w-[200px] truncate"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          {currentEvent && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-rose-50 text-rose-700 font-semibold shadow-sm border border-rose-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Create / Plan Event Button */}
            <button
              onClick={onOpenWizard}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-rose-600 to-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-rose-200 hover:from-rose-700 hover:to-brand-800 hover:shadow active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.navNewEvent}</span>
            </button>

            {/* Saved Events Drawer Button */}
            <button
              onClick={onOpenSavedEvents}
              aria-label="View saved events"
              title={t.navEvents}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            >
              <FolderOpen className="w-5 h-5" />
              {events.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-brand-600 text-white text-[10px] font-bold rounded-full">
                  {events.length}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change language"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-600" />
                <span className="uppercase">{language}</span>
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-rose-50 ${
                        language === l.code ? 'font-bold text-rose-700 bg-rose-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      <span>{l.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings & AI Status */}
            <button
              onClick={onOpenSettings}
              aria-label="Settings and AI status"
              title={t.navSettings}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            >
              <Settings className="w-5 h-5" />
              {health && (
                <span
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                    health.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && currentEvent && (
          <div className="md:hidden border-t border-slate-200 py-3 px-2 space-y-1 bg-white">
            <div className="pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">
                Active Event
              </span>
              <p className="text-sm font-semibold text-brand-900 px-2 truncate">
                {currentEvent.name} ({currentEvent.city})
              </p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    active ? 'bg-rose-50 text-rose-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
