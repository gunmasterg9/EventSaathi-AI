import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { FeedbackInput, FeedbackSummary, ServiceBundle } from '../types';
import { operationsLabels } from '../i18n/operations';

const bundles: ServiceBundle[] = ['hospitality', 'travel', 'registration', 'hybrid', 'coordination'];
const fieldClass = 'w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-base';
const buttonClass = 'rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50';

export function EventOperations({ eventId, onTimeline }: { eventId: string; onTimeline: () => void }) {
  const { language } = useLanguage();
  const { refreshCurrentEvent } = useEvent();
  const t = operationsLabels[language];
  const [data, setData] = useState<FeedbackSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [form, setForm] = useState<FeedbackInput>({ author: '', rating: 5, comment: '' });
  useEffect(() => {
    let active = true;
    api.getFeedback(eventId).then(result => { if (active) setData(result); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load feedback'); });
    return () => { active = false; };
  }, [eventId, revision]);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'Unable to save changes'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6 pb-10">
    <div><h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1><p className="mt-1 text-sm text-slate-500">{t.subtitle}</p></div>
    {error && <div role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800"><p>{error}</p><button disabled={busy} className="mt-2 underline" onClick={() => { setError(''); setRevision(value => value + 1); }}>{t.retry}</button></div>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold text-lg">{t.checklist}</h2><button className="text-sm text-rose-700 font-bold underline" onClick={onTimeline}>{t.open}</button></div>
      <p className="text-sm text-slate-500">{t.templateNote}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{bundles.map(bundle => <div key={bundle} className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
        <h3 className="font-semibold text-slate-800">{t[bundle]}</h3>
        <button disabled={busy} className={`${buttonClass} bg-white`} aria-label={`${t.add}: ${t[bundle]}`} onClick={() => void run(async () => {
          const result = await api.addServiceChecklist(eventId, bundle);
          setNotice(result.added ? `${t.added}: ${result.added}` : t.noNew);
          await refreshCurrentEvent();
        })}>{t.add}</button>
      </div>)}</div>
    </section>
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold text-lg">{t.feedback}</h2>{data && <p className="text-sm text-slate-600">{t.average}: <strong>{data.average_rating === null ? '—' : `${data.average_rating}/5`}</strong> · {t.responses}: {data.total}</p>}</div>
      <p className="text-sm text-slate-500">{t.privateNote}</p>
      <form onSubmit={event => { event.preventDefault(); if (!form.author.trim() || !form.comment.trim()) return; void run(async () => {
        await api.addFeedback(eventId, form);
        setForm({ author: '', rating: 5, comment: '' });
        setRevision(value => value + 1);
      }); }}>
        <fieldset disabled={busy} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1 text-sm font-semibold"><span>{t.author}</span><input className={fieldClass} required maxLength={150} value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></label>
            <label className="block space-y-1 text-sm font-semibold"><span>{t.rating}</span><select className={fieldClass} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label>
          </div>
          <label className="block space-y-1 text-sm font-semibold"><span>{t.comment}</span><textarea className={fieldClass} required maxLength={2000} rows={3} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} /></label>
          <button className={`${buttonClass} bg-rose-700 text-white`} type="submit">{t.save}</button>
        </fieldset>
      </form>
      {!data ? !error && <p role="status">{t.loading}</p> : data.total === 0 ? <p className="text-sm text-slate-500">{t.empty}</p> : <ul className="space-y-3">{data.entries.map(entry => <li key={entry.id} className="rounded-xl border border-slate-200 p-4 min-w-0 break-words">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{entry.author}</h3><span aria-label={`${t.rating}: ${entry.rating}/5`} className="text-amber-700">{'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}</span></div>
        <p className="text-sm text-slate-600 whitespace-pre-wrap mt-2">{entry.comment}</p>
        <button className="mt-3 text-xs font-semibold text-rose-700 underline disabled:opacity-50" disabled={busy} onClick={() => { if (window.confirm(t.confirm)) void run(async () => { await api.deleteFeedback(eventId, entry.id); setRevision(value => value + 1); }); }}>{t.remove}</button>
      </li>)}</ul>}
    </section>
  </div>;
}
