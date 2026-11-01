import React from 'react';
import {
  Sparkles,
  Clock,
  Lightbulb,
  CloudSun,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  Palette,
  CalendarCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { api } from '../services/api';

export const PlanViewer: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentEvent, generatePlan, generatingPlan } = useEvent();

  if (!currentEvent) return null;

  const isFallback = currentEvent.plan_source === 'rules_fallback';
  const hasPlan = Boolean(currentEvent.event_summary || currentEvent.theme_concept);

  if (!hasPlan) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t.noPlanYet}</h2>
        <p className="text-sm text-slate-500">{t.generatePlanPrompt}</p>
        <button
          onClick={() => generatePlan(currentEvent.id)}
          disabled={generatingPlan}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${generatingPlan ? 'animate-spin' : ''}`} />
          <span>{generatingPlan ? t.btnCreating : t.btnCreateAndGenerate}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.planTitle}
            </h1>
            {isFallback ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic Fallback Mode</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Powered (Gemini)</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Tailored specifically for {currentEvent.name} in {currentEvent.city}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
        <a
          href={api.getEventExportUrl(currentEvent.id)}
          className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm"
        >
          {{ en: 'Download event backup', hi: 'इवेंट बैकअप डाउनलोड करें', gu: 'ઇવેન્ટ બેકઅપ ડાઉનલોડ કરો' }[language]}
        </a>
        <button
          onClick={() => generatePlan(currentEvent.id)}
          disabled={generatingPlan}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${generatingPlan ? 'animate-spin' : ''}`} />
          <span>{generatingPlan ? t.regenerating : t.regeneratePlanBtn}</span>
        </button>
        </div>
      </div>

      {/* Summary Banner */}
      {currentEvent.event_summary && (
        <div className="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/80 rounded-2xl p-6 border border-rose-100 shadow-sm">
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
            "{currentEvent.event_summary}"
          </p>
        </div>
      )}

      {/* Theme Concept */}
      {currentEvent.theme_concept && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm sm:text-base">
            <Palette className="w-5 h-5" />
            <h3>{t.conceptThemeTitle}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {currentEvent.theme_concept}
          </p>
        </div>
      )}

      {/* Event-Day Schedule */}
      {currentEvent.event_day_schedule && currentEvent.event_day_schedule.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-sm sm:text-base">
            <Clock className="w-5 h-5" />
            <h3>{t.scheduleTitle}</h3>
          </div>

          <div className="relative border-l-2 border-rose-200 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6 my-2">
            {currentEvent.event_day_schedule.map((slot, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-[23px] sm:-left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white ring-2 ring-rose-200" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-rose-700 tracking-wide uppercase bg-rose-50 px-2.5 py-0.5 rounded-md inline-block">
                    {slot.time_slot}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {slot.activity}
                  </h4>
                  {slot.notes && (
                    <p className="text-xs text-slate-500 italic">
                      Note: {slot.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest Ideas & Contingencies in 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Experience Ideas */}
        {currentEvent.guest_experience_ideas && currentEvent.guest_experience_ideas.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm sm:text-base">
              <Lightbulb className="w-5 h-5" />
              <h3>{t.guestIdeasTitle}</h3>
            </div>
            <ul className="space-y-3">
              {currentEvent.guest_experience_ideas.map((idea, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weather & Contingencies */}
        {currentEvent.weather_contingency && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm sm:text-base">
              <CloudSun className="w-5 h-5" />
              <h3>{t.contingenciesTitle}</h3>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-indigo-950 whitespace-pre-line leading-relaxed">
              {currentEvent.weather_contingency}
            </div>
          </div>
        )}
      </div>

      {/* Key Prep Milestones */}
      {currentEvent.prep_steps && currentEvent.prep_steps.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm sm:text-base">
            <CalendarCheck className="w-5 h-5" />
            <h3>{t.prepStepsTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentEvent.prep_steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-800 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
