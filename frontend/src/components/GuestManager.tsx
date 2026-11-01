import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { GuestInput, GuestRecord, GuestSummary, RsvpStatus } from '../types';
import { guestLabels } from '../i18n/guests';

const blank: GuestInput = { name: '', phone: '', party_size: 1, rsvp_status: 'pending', dietary_requirements: '', notes: '' };
const inputClass = 'w-full min-w-0 rounded-xl border border-slate-200 p-3 text-base bg-white';
const buttonClass = 'rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50';
const statuses: RsvpStatus[] = ['pending', 'confirmed', 'declined'];

export function GuestManager({ eventId }: { eventId: string }) {
  const { language } = useLanguage();
  const t = guestLabels[language];
  const [summary, setSummary] = useState<GuestSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<string | null>(null);
  const [form, setForm] = useState<GuestInput>(blank);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getGuests(eventId).then(data => { if (active) setSummary(data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load guests'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [eventId, revision]);

  async function mutate(action: () => Promise<unknown>, closeEditor = false) {
    setBusy(true);
    setError('');
    try {
      await action();
      if (closeEditor) setEditor(null);
      setRevision(value => value + 1);
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'Unable to save guest'); }
    finally { setBusy(false); }
  }
  function edit(guest: GuestRecord) {
    setEditor(guest.id);
    setForm({ name: guest.name, phone: guest.phone || '', party_size: guest.party_size, rsvp_status: guest.rsvp_status, dietary_requirements: guest.dietary_requirements || '', notes: guest.notes || '' });
  }
  const visible = summary?.guests.filter(guest => (!filter || guest.rsvp_status === filter) && `${guest.name} ${guest.phone || ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())) || [];

  return <div className="space-y-6 pb-10">
    <div className="flex flex-wrap justify-between items-start gap-4">
      <div><h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1><p className="text-sm text-slate-500 mt-1">{t.subtitle}</p></div>
      <div className="flex flex-wrap gap-2">
        <a className={buttonClass} href={api.getGuestsExportUrl(eventId)}>{t.export}</a>
        <button disabled={busy} className={`${buttonClass} bg-rose-700 text-white`} onClick={() => { setForm({ ...blank }); setEditor('new'); }}>{t.add}</button>
      </div>
    </div>
    {error && <div role="alert" className="rounded-xl bg-rose-50 text-rose-800 p-4"><p>{error}</p><button className="underline mt-2" onClick={() => { setError(''); setRevision(value => value + 1); }}>{t.retry}</button></div>}
    {summary && <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[[t.invited, summary.invited_people], [t.confirmed, summary.confirmed_people], [t.pending, summary.pending_people], [t.declined, summary.declined_people], [t.capacity, summary.planned_capacity]].map(([label, count]) => <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold mt-1">{count}</p></div>)}
      </div>
      {summary.confirmed_people > summary.planned_capacity && <p role="status" className="bg-amber-50 text-amber-900 rounded-xl p-4 text-sm">{t.warning}</p>}
    </>}
    {editor !== null && <form className="bg-white rounded-2xl border border-rose-200 p-5 space-y-4" onSubmit={event => {
      event.preventDefault();
      if (!form.name.trim()) return;
      void mutate(() => editor === 'new' ? api.addGuest(eventId, form) : api.updateGuest(eventId, editor, form), true);
    }}>
      <fieldset disabled={busy} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-semibold space-y-1"><span>{t.name}</span><input className={inputClass} required maxLength={200} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label className="text-sm font-semibold space-y-1"><span>{t.phone}</span><input type="tel" className={inputClass} maxLength={50} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="text-sm font-semibold space-y-1"><span>{t.size}</span><input type="number" required min={1} max={1000} step={1} className={inputClass} value={form.party_size} onChange={e => setForm({ ...form, party_size: Number(e.target.value) })} /></label>
        <label className="text-sm font-semibold space-y-1"><span>{t.status}</span><select className={inputClass} value={form.rsvp_status} onChange={e => setForm({ ...form, rsvp_status: e.target.value as RsvpStatus })}>{statuses.map(status => <option key={status} value={status}>{t[status]}</option>)}</select></label>
        <label className="text-sm font-semibold space-y-1"><span>{t.diet}</span><input className={inputClass} maxLength={300} value={form.dietary_requirements} onChange={e => setForm({ ...form, dietary_requirements: e.target.value })} /></label>
        <label className="text-sm font-semibold space-y-1"><span>{t.notes}</span><textarea className={inputClass} maxLength={2000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
      </fieldset>
      <div className="flex gap-2"><button type="submit" disabled={busy} className={`${buttonClass} bg-rose-700 text-white`}>{t.save}</button><button type="button" disabled={busy} className={buttonClass} onClick={() => setEditor(null)}>{t.cancel}</button></div>
    </form>}
    <div className="flex flex-col sm:flex-row gap-3">
      <input type="search" aria-label={t.search} placeholder={t.search} className={inputClass} value={search} onChange={e => setSearch(e.target.value)} />
      <select aria-label={t.status} className={`${inputClass} sm:max-w-56`} value={filter} onChange={e => setFilter(e.target.value)}><option value="">{t.all}</option>{statuses.map(status => <option key={status} value={status}>{t[status]}</option>)}</select>
    </div>
    {loading ? <p role="status">{t.loading}</p> : summary && visible.length === 0 ? <p className="text-sm text-slate-500 p-6 bg-white rounded-xl">{summary.guests.length ? t.noMatch : t.empty}</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{visible.map(guest => <article key={guest.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 min-w-0 break-words">
      <div className="flex justify-between items-start gap-3"><h2 className="font-bold text-slate-900">{guest.name}</h2><span className={`rounded-lg px-2 py-1 text-xs shrink-0 ${guest.rsvp_status === 'confirmed' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{t[guest.rsvp_status]}</span></div>
      <p className="text-sm text-slate-600">{t.size}: <strong>{guest.party_size}</strong>{guest.phone ? ` · ${guest.phone}` : ''}</p>
      {guest.dietary_requirements && <p className="text-sm text-slate-600">{t.diet}: {guest.dietary_requirements}</p>}
      {guest.notes && <p className="text-sm text-slate-500">{guest.notes}</p>}
      <div className="flex flex-wrap gap-2"><button disabled={busy} className={buttonClass} onClick={() => edit(guest)}>{t.edit}</button><button disabled={busy} className={`${buttonClass} text-rose-700`} onClick={() => { if (window.confirm(t.confirm)) void mutate(() => api.deleteGuest(eventId, guest.id), editor === guest.id); }}>{t.remove}</button></div>
    </article>)}</div>}
  </div>;
}
