import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Cake,
  Users2,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { EventCreateInput, EventType, VenueStatus, IndoorOutdoor, Language } from '../types';

interface EventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventWizard: React.FC<EventWizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const { language, t } = useLanguage();
  const { createEvent, generatePlan } = useEvent();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventCreateInput>({
    name: '',
    event_type: 'wedding',
    date: '',
    city: 'Ahmedabad',
    venue_status: 'not_booked',
    guest_count: 50,
    total_budget: 50000,
    currency: 'INR',
    language: language,
    theme_preference: '',
    dietary_requirements: '',
    indoor_outdoor: 'flexible',
    additional_notes: '',
  });

  if (!isOpen) return null;

  const eventTypes: { type: EventType; label: string; icon: React.ElementType; color: string }[] = [
    { type: 'wedding', label: t.typeWedding, icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { type: 'birthday', label: t.typeBirthday, icon: Cake, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { type: 'community', label: t.typeCommunity, icon: Users2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { type: 'other', label: t.typeOther, icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  ];

  const handleNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        setValidationError('Please enter a valid event name (minimum 2 characters).');
        return;
      }
      if (!formData.city.trim()) {
        setValidationError('Please specify the celebration city or location.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (formData.guest_count < 1) {
        setValidationError('Please enter at least 1 guest.');
        return;
      }
      if (formData.total_budget < 0) {
        setValidationError('Budget must be zero or a positive amount.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitting(true);
    try {
      const created = await createEvent(formData);
      // Immediately generate plan with AI or fallback
      await generatePlan(created.id);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create celebration plan';
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-modal-title"
      >
        {/* Header with Step indicator */}
        <div className="bg-gradient-to-r from-brand-900 via-rose-800 to-amber-700 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-1.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-md">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
              EventSaathi AI Planner
            </span>
            <h2 id="wizard-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t.wizardTitle}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 mt-1">
              {t.wizardSubtitle}
            </p>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-rose-700/50">
            {[1, 2, 3].map((s) => (
              <div key={s} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    step >= s ? 'bg-amber-400' : 'bg-rose-950/40'
                  }`}
                />
                <span className="text-[11px] font-semibold text-rose-200 block truncate">
                  {s === 1 ? t.stepBasics : s === 2 ? t.stepBudgetGuests : t.stepPreferences}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Event Type Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.eventTypeLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {eventTypes.map((et) => {
                    const Icon = et.icon;
                    const selected = formData.event_type === et.type;
                    return (
                      <button
                        type="button"
                        key={et.type}
                        onClick={() => setFormData({ ...formData, event_type: et.type })}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          selected
                            ? 'border-brand-600 bg-rose-50/80 ring-2 ring-brand-500 text-brand-950 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-brand-700' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold leading-tight">{et.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.eventNameLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.eventNamePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                />
              </div>

              {/* City & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{t.cityLabel}</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t.cityPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>{t.eventDateLabel}</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Venue Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.venueStatusLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'not_booked', label: t.venueNotBooked },
                    { value: 'shortlisted', label: t.venueShortlisted },
                    { value: 'booked', label: t.venueBooked },
                  ].map((vs) => (
                    <button
                      type="button"
                      key={vs.value}
                      onClick={() => setFormData({ ...formData, venue_status: vs.value as VenueStatus })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        formData.venue_status === vs.value
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {vs.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Guests */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Total Budget */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-brand-600" />
                  <span>{t.budgetLabel}</span> <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
                    {formData.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.total_budget}
                    onChange={(e) => setFormData({ ...formData, total_budget: Number(e.target.value) })}
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-semibold outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Default: ₹50,000 INR (suggested for birthdays, ₹2-5 Lakh for weddings, ₹80k for community utsavs).
                </p>
              </div>

              {/* Guest Count */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  <span>{t.guestCountLabel}</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  required
                  value={formData.guest_count}
                  onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-semibold outline-none transition-all"
                />
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.languageLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', label: 'English', desc: 'Standard' },
                    { code: 'hi', label: 'हिंदी (Hindi)', desc: 'पारंपरिक' },
                    { code: 'gu', label: 'ગુજરાતી (Gujarati)', desc: 'સ્થાનિક' },
                  ].map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => setFormData({ ...formData, language: l.code as Language })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.language === l.code
                          ? 'bg-rose-50 border-brand-500 ring-2 ring-brand-400 text-brand-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs block">{l.label}</span>
                      <span className="text-[10px] text-slate-400 block">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Style & Culture */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Theme Preference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.themeLabel}
                </label>
                <input
                  type="text"
                  value={formData.theme_preference || ''}
                  onChange={(e) => setFormData({ ...formData, theme_preference: e.target.value })}
                  placeholder={t.themePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                />
              </div>

              {/* Setting Preference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.indoorOutdoorLabel}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'indoor', label: t.optIndoor },
                    { val: 'outdoor', label: t.optOutdoor },
                    { val: 'both', label: t.optBoth },
                    { val: 'flexible', label: t.optFlexible },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.val}
                      onClick={() => setFormData({ ...formData, indoor_outdoor: s.val as IndoorOutdoor })}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                        formData.indoor_outdoor === s.val
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Requirements */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.dietaryLabel}
                </label>
                <input
                  type="text"
                  value={formData.dietary_requirements || ''}
                  onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
                  placeholder={t.dietaryPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={formData.additional_notes || ''}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  placeholder={t.notesPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                {t.back}
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow transition-all"
              >
                {t.next}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-brand-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                <span>{submitting ? t.btnCreating : t.btnCreateAndGenerate}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
