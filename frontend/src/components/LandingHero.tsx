import React from 'react';
import {
  Sparkles,
  Heart,
  Cake,
  Users2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';

interface LandingHeroProps {
  onOpenWizard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenWizard }) => {
  const { t } = useLanguage();
  const { loadDemoEvent, loading } = useEvent();

  const celebrationTypes = [
    {
      title: t.typeWedding,
      desc: "Mandap decor, Sangeet choreography, feasts, candid photography, and timeline logistics.",
      icon: Heart,
      color: "from-rose-500 to-red-600",
      badge: "Traditional & Modern",
    },
    {
      title: t.typeBirthday,
      desc: "Creative themes, customized cake, live activities, photo booth setups, and return gifts.",
      icon: Cake,
      color: "from-amber-500 to-orange-600",
      badge: "Kids & Milestone Adults",
    },
    {
      title: t.typeCommunity,
      desc: "Navratri Garba, Diwali Utsav, venue permissions, prasadam feasts, and PA audio logistics.",
      icon: Users2,
      color: "from-emerald-600 to-teal-700",
      badge: "Festivals & Large Gatherings",
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-rose-900/40">
        {/* Festive background elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>PromptWars Challenge 5: GenAI Celebration & Event Planner</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Celebrate With Less Stress, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-orange-200 bg-clip-text text-transparent">
              Zero Confusion, & Full Joy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-rose-100/90 leading-relaxed font-normal">
            {t.taglineSub}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onOpenWizard}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-brand-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-950/40 hover:shadow-xl active:scale-98 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>{t.heroCTA}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={loadDemoEvent}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-sm active:scale-98 transition-all disabled:opacity-50"
            >
              <Cake className="w-5 h-5 text-amber-300" />
              <span>{loading ? "Loading Scenario..." : t.demoEventCTA}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Celebration Categories */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tailored Planning for Every Occasion
          </h2>
          <p className="text-sm text-slate-500">
            From intimate birthday gatherings to grand multi-day Indian weddings and community melas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {celebrationTypes.map((type, idx) => {
            const Icon = type.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white shadow`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-brand-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      {type.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {type.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {type.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center text-xs font-semibold text-brand-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  Budget allocations, schedule & checklists included
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Pillars of EventSaathi AI */}
      <section className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Why EventSaathi AI
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Engineered for Precision and Peace of Mind
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              AI
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{t.feature1Title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.feature1Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{t.feature2Title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.feature2Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{t.feature3Title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.feature3Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{t.feature4Title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.feature4Desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
