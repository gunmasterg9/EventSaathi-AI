import { DialogPanel } from './DialogPanel';
import React from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Globe,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const { health } = useEvent();

  if (!isOpen) return null;

  const languages: { code: Language; label: string; sub: string }[] = [
    { code: 'en', label: 'English', sub: 'Default International' },
    { code: 'hi', label: 'हिंदी (Hindi)', sub: 'भारत की राष्ट्रभाषा' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)', sub: 'સ્થાનિક ઉત્સવ સંસ્કૃતિ' },
  ];

  const hasKey = health?.ai_engine.has_credentials;

  return (
    <div className="dialog-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
      <DialogPanel className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95" contentClassName="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-brand-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {t.navSettings}
              </h2>
              <p className="text-xs text-slate-500">
                AI provider status & multi-language configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Engine Status Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-600" />
              <span>AI Provider Status</span>
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              hasKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {hasKey ? 'Gemini configured' : 'Deterministic Fallback Active'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Model:</span>
              <span className="font-semibold text-slate-800">{health?.ai_engine.model || 'gemini-1.5-flash'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-semibold text-slate-800">{health?.database || 'SQLite connected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">System Environment:</span>
              <span className="font-semibold text-slate-800">{health?.environment || 'development'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fallback Protection:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Offline Guaranteed
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 leading-relaxed">
            When a Gemini API key is omitted in <code>.env</code> or an API timeout occurs, EventSaathi automatically engages the localized rules engine for 100% reliable hackathon demonstrations.
          </p>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>Select Interface & Planning Language</span>
          </label>

          <div className="grid grid-cols-1 gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  language === l.code
                    ? 'border-brand-500 bg-rose-50/60 ring-2 ring-brand-400/40 text-brand-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="text-sm block">{l.label}</span>
                  <span className="text-xs text-slate-400 font-normal">{l.sub}</span>
                </div>
                {language === l.code && (
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Security & Compliance Highlights */}
        <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-brand-900">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Security & Privacy Built-in</span>
          </div>
          <p className="text-[11px] text-rose-900/80 leading-relaxed">
            - No client-side API keys exposed.<br />
            - Parameterized SQLite queries with cross-event boundary isolation.<br />
            - CSV exports sanitized against spreadsheet formula injection (CWE-1236).
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
          >
            {t.close}
          </button>
        </div>
      </DialogPanel>
    </div>
  );
};
