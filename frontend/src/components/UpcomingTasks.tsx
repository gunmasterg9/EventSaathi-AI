import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TaskItem, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

const labels: Record<Language, { title: string; open: string; empty: string; overdue: string; undated: string; retry: string; loading: string }> = {
  en: { title: 'What needs attention next', open: 'Open timeline', empty: 'All caught up! No pending tasks.', overdue: 'Overdue', undated: 'No date set', retry: 'Try again', loading: 'Loading tasks…' },
  hi: { title: 'अगला जरूरी काम', open: 'समयरेखा खोलें', empty: 'बहुत अच्छे! कोई काम बाकी नहीं है।', overdue: 'समय सीमा बीत गई', undated: 'तारीख तय नहीं', retry: 'फिर कोशिश करें', loading: 'काम लोड हो रहे हैं…' },
  gu: { title: 'આગળ ધ્યાન આપવાના કામ', open: 'સમયરેખા ખોલો', empty: 'સરસ! કોઈ કામ બાકી નથી.', overdue: 'સમયમર્યાદા વીતી ગઈ', undated: 'તારીખ નક્કી નથી', retry: 'ફરી પ્રયાસ કરો', loading: 'કામ લોડ થઈ રહ્યાં છે…' },
};

export function UpcomingTasks({ eventId, revision, onOpen }: { eventId: string; revision: string; onOpen: () => void }) {
  const { language } = useLanguage();
  const text = labels[language];
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.getTasks(eventId).then(result => {
      if (active) setTasks(result.tasks);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load tasks');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [eventId, revision, retry]);

  // ISO calendar dates sort chronologically. Relative milestone labels remain
  // visible, but must never be interpreted as dates or marked overdue.
  const dateOf = (task: TaskItem) => /^\d{4}-\d{2}-\d{2}$/.test(task.due_date || '') ? task.due_date! : '';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const priority = { high: 0, medium: 1, low: 2 };
  const pending = tasks.filter(task => task.status !== 'completed').sort((a, b) =>
    (dateOf(a) || '9999').localeCompare(dateOf(b) || '9999') || priority[a.priority] - priority[b.priority]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4" aria-label={text.title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-lg text-slate-900">{text.title}</h2>
        <button onClick={onOpen} className="text-sm font-bold text-rose-700 underline underline-offset-4">{text.open}</button>
      </div>
      {loading ? <p role="status" className="text-sm text-slate-500">{text.loading}</p> : error ? (
        <div role="alert" className="text-sm text-rose-700"><p>{error}</p><button className="font-bold underline mt-2" onClick={() => setRetry(value => value + 1)}>{text.retry}</button></div>
      ) : pending.length === 0 ? <p className="text-sm text-emerald-700">{text.empty}</p> : (
        <ul className="divide-y divide-slate-100">
          {pending.slice(0, 5).map(task => {
            const overdue = Boolean(dateOf(task) && dateOf(task) < today);
            return <li key={task.id} className="py-3 flex flex-wrap justify-between items-start gap-2">
              <span className="text-sm font-semibold text-slate-800 min-w-0 break-words flex-1">{task.title}</span>
              <span className={`text-xs rounded-lg px-2 py-1 ${overdue ? 'bg-rose-50 text-rose-700 font-bold' : 'bg-slate-50 text-slate-600'}`}>
                {overdue ? `${text.overdue} · ` : ''}{task.due_date || text.undated}
              </span>
            </li>;
          })}
        </ul>
      )}
    </section>
  );
}
