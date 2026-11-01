import React from 'react';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  CheckSquare,
  AlertTriangle,
  RotateCw,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Building,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { UpcomingTasks } from './UpcomingTasks';
import { guestLabels } from '../i18n/guests';

interface EventDashboardProps {
  onNavigateTab: (tab: string) => void;
  onEditEvent: () => void;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({ onNavigateTab, onEditEvent }) => {
  const { t, language } = useLanguage();
  const { currentEvent, generatePlan, generatingPlan } = useEvent();

  if (!currentEvent) {
    return null;
  }

  const isOverBudget = currentEvent.is_over_budget;
  const isFallback = currentEvent.plan_source === 'rules_fallback';

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Event Header Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-rose-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-rose-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/20">
                {currentEvent.event_type.toUpperCase()}
              </span>

              {/* AI vs Fallback Badge */}
              {isFallback ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.fallbackBadge}</span>
                </span>
              ) : currentEvent.plan_source === 'gemini_ai' || currentEvent.plan_source === 'ollama_ai' ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{currentEvent.plan_source === 'ollama_ai' ? 'Local AI · Ollama' : t.aiBadge}</span>
                </span>
              ) : <span className="text-xs text-rose-200">{t.noPlanYet}</span>}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {currentEvent.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-rose-100/90 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                {currentEvent.city}
              </span>
              {currentEvent.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {currentEvent.date}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                {currentEvent.guest_count} Guests
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={onEditEvent} disabled={generatingPlan} className="px-4 py-2.5 rounded-xl bg-white text-brand-900 font-semibold text-xs sm:text-sm disabled:opacity-50">
              {{ en: 'Edit event', hi: 'इवेंट बदलें', gu: 'ઇવેન્ટ બદલો' }[language]}
            </button>
            <button
              onClick={() => generatePlan(currentEvent.id)}
              disabled={generatingPlan}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-sm transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${generatingPlan ? 'animate-spin' : ''}`} />
              <span>{generatingPlan ? t.regenerating : t.regeneratePlanBtn}</span>
            </button>
          </div>
        </div>

        {/* Fallback notification notice if fallback planner was used */}
        {isFallback && (
          <div className="mt-4 pt-3 border-t border-rose-800/60 text-xs text-rose-200/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{t.fallbackNote}</span>
          </div>
        )}
      </div>

      {/* Over-budget Banner Alert */}
      {isOverBudget ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">{t.budgetAlertOver}</span>{' '}
            <span className="font-black text-rose-700">
              {currentEvent.currency} {Math.abs(currentEvent.budget_remaining).toLocaleString()}
            </span>
            . Please adjust expense amounts in the Budget Planner to remain within your target.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">{t.budgetAlertGood}</div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t.statTotalBudget}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              {currentEvent.currency} {currentEvent.total_budget.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Allocated target</span>
        </div>

        {/* Actual Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t.statSpent}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-brand-900">
              {currentEvent.currency} {currentEvent.budget_total_actual.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Estimated: {currentEvent.currency} {currentEvent.budget_total_estimated.toLocaleString()}
          </span>
        </div>

        {/* Remaining Budget */}
        <div className={`p-5 rounded-2xl border shadow-sm space-y-1 ${
          isOverBudget ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'
        }`}>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            {t.statRemaining}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
              {currentEvent.currency} {currentEvent.budget_remaining.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600">
            {isOverBudget ? 'Over Target Budget' : 'Safe Balance Available'}
          </span>
        </div>

        {/* Tasks Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.statTasksProgress}
            </span>
            <span className="text-xs font-bold text-brand-600">
              {currentEvent.completed_tasks}/{currentEvent.total_tasks}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {currentEvent.task_completion_percentage}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentEvent.task_completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      <UpcomingTasks key={currentEvent.id} eventId={currentEvent.id} revision={currentEvent.updated_at} onOpen={() => onNavigateTab('timeline')} />
      <button onClick={() => onNavigateTab('guests')} className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left hover:bg-rose-100 transition-colors">
        <span className="block font-bold text-rose-900">{guestLabels[language].title} →</span>
        <span className="block mt-1 text-sm text-rose-800">{guestLabels[language].subtitle}</span>
      </button>

      {/* Quick Action Workspace Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab('plan')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md text-left flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{t.viewMasterPlan}</h3>
              <p className="text-xs text-slate-500">
                Explore concept, timeline schedule, guest ideas, and contingencies.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-brand-600 mt-2">
              <span>Open Master Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('budget')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md text-left flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{t.manageBudget}</h3>
              <p className="text-xs text-slate-500">
                Track category splits, actual payments, and export to CSV.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-600 mt-2">
              <span>Manage Expenses</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('timeline')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md text-left flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{t.trackTasks}</h3>
              <p className="text-xs text-slate-500">
                Milestones, high priority tasks, deadlines, and completion checks.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 mt-2">
              <span>View Checklist</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('vendors')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md text-left flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{t.coordinateVendors}</h3>
              <p className="text-xs text-slate-500">
                Manage catering, venue, decor quotes, contacts, and bookings.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 mt-2">
              <span>Vendor Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Plan Summary Card */}
      {currentEvent.event_summary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-700">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900">
              Celebration Summary
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            {currentEvent.event_summary}
          </p>
          {currentEvent.theme_concept && (
            <div className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
              <span className="font-bold text-slate-800 shrink-0">Style & Aesthetic:</span>
              <span>{currentEvent.theme_concept}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
