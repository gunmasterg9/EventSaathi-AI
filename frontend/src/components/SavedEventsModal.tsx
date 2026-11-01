import { DialogPanel } from './DialogPanel';
import React from 'react';
import {
  X,
  MapPin,
  Users,
  Trash2,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';

interface SavedEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWizard: () => void;
}

export const SavedEventsModal: React.FC<SavedEventsModalProps> = ({
  isOpen,
  onClose,
  onOpenWizard,
}) => {
  const { t } = useLanguage();
  const { events, currentEvent, selectEvent, deleteEvent } = useEvent();

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
      <DialogPanel className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95" contentClassName="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t.navEvents} ({events.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between ongoing celebrations or start a new plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No saved events found. Plan your first celebration below!
            </div>
          ) : (
            events.map((ev) => {
              const isSelected = currentEvent?.id === ev.id;
              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-50/70 border-brand-500 ring-2 ring-brand-400/40 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() => {
                      selectEvent(ev.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ev.event_type}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-rose-600" /> Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {ev.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {ev.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {ev.guest_count}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {ev.currency} {ev.total_budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${ev.name}" and all associated planning records?`)) {
                        deleteEvent(ev.id);
                      }
                    }}
                    aria-label="Delete event"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenWizard();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 text-white text-xs font-bold shadow-sm hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navNewEvent}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            {t.close}
          </button>
        </div>
      </DialogPanel>
    </div>
  );
};
