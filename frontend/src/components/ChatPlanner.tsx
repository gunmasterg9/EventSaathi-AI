import { useEffect, useRef, useState } from 'react';
import { DialogPanel } from './DialogPanel';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ChatMessage, ChatResponse, EventCreateInput } from '../types';

export const chatLabels = {
  en: { title: 'AI chat planner', intro: 'Tell me about your celebration. Include the city, number of guests, budget in INR, and any theme or dietary needs.', placeholder: 'Plan a vegetarian birthday in Ahmedabad for 30 guests, budget ₹20,000…', send: 'Send', waiting: 'AI is thinking…', review: 'Review details & create plan', form: 'Use event form', close: 'Close chat', note: 'Chat drafts are not saved as events. Review the details before creating a plan. This chat starts fresh when closed.', draft: 'Event draft', message: 'Your message', limit: 'Conversation limit reached. Review your draft or start a new chat.', reset: 'Start new chat' },
  hi: { title: 'AI चैट प्लानर', intro: 'अपने उत्सव के बारे में बताएं। शहर, मेहमानों की संख्या, रुपये में बजट, थीम और आहार की जरूरतें शामिल करें।', placeholder: 'अहमदाबाद में 30 मेहमानों के लिए जन्मदिन, बजट ₹20,000…', send: 'भेजें', waiting: 'AI सोच रहा है…', review: 'विवरण जांचें और योजना बनाएं', form: 'इवेंट फॉर्म खोलें', close: 'चैट बंद करें', note: 'चैट ड्राफ्ट इवेंट के रूप में सहेजे नहीं जाते। योजना बनाने से पहले विवरण जांचें। बंद करने पर चैट रीसेट होगी।', draft: 'इवेंट ड्राफ्ट', message: 'आपका संदेश', limit: 'चैट सीमा पूरी हुई। ड्राफ्ट जांचें या नई चैट शुरू करें।', reset: 'नई चैट' },
  gu: { title: 'AI ચેટ પ્લાનર', intro: 'તમારા ઉત્સવ વિશે જણાવો. શહેર, મહેમાનોની સંખ્યા, રૂપિયામાં બજેટ, થીમ અને આહારની જરૂરિયાતો જણાવો.', placeholder: 'અમદાવાદમાં 30 મહેમાનો માટે જન્મદિવસ, બજેટ ₹20,000…', send: 'મોકલો', waiting: 'AI વિચારી રહ્યું છે…', review: 'વિગતો તપાસો અને યોજના બનાવો', form: 'ઇવેન્ટ ફોર્મ ખોલો', close: 'ચેટ બંધ કરો', note: 'ચેટ ડ્રાફ્ટ ઇવેન્ટ તરીકે સાચવાતા નથી. યોજના બનાવતા પહેલાં વિગતો તપાસો. બંધ કરવાથી ચેટ રીસેટ થશે.', draft: 'ઇવેન્ટ ડ્રાફ્ટ', message: 'તમારો સંદેશ', limit: 'ચેટ મર્યાદા પૂરી થઈ. ડ્રાફ્ટ તપાસો અથવા નવી ચેટ શરૂ કરો.', reset: 'નવી ચેટ' },
};

export function ChatPlanner({ onClose, onReview, onForm }: {
  onClose: () => void;
  onReview: (input: EventCreateInput) => void;
  onForm: () => void;
}) {
  const { language } = useLanguage();
  const t = chatLabels[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState('');
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }); }, [messages, pending]);
  const atLimit = messages.length >= 20;

  async function send() {
    if (busy || !input.trim() || atLimit) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: input.trim() }];
    setBusy(true); setError(''); setPending(input.trim());
    try {
      const reply = await api.chat(next, language);
      setMessages([...next, { role: 'assistant', content: reply.reply }]);
      setResult(reply); setInput('');
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to contact AI');
    } finally { setBusy(false); setPending(''); }
  }

  return <div className="dialog-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
    <DialogPanel className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100" contentClassName="p-5 sm:p-7 space-y-4">
      <div className="flex items-start justify-between gap-3"><h2 className="font-extrabold text-xl text-rose-900">{t.title}</h2><button onClick={onClose} aria-label={t.close} className="px-3 py-1 rounded-lg border border-slate-200 text-xl">×</button></div>
      <p className="text-sm text-slate-600">{t.intro}</p>
      <div role="log" aria-label={t.title} aria-live="polite" aria-busy={busy} className="space-y-3 max-h-[40dvh] min-h-24 overflow-y-auto rounded-xl bg-slate-50 p-3">
        {messages.map((message, index) => <p key={index} className={`rounded-xl p-3 text-sm whitespace-pre-wrap break-words ${message.role === 'user' ? 'bg-rose-100 text-rose-950 ml-5' : 'bg-white border border-slate-200 mr-5'}`}><span className="sr-only">{message.role}: </span>{message.content}</p>)}
        {pending && <p className="rounded-xl bg-rose-100 p-3 ml-5 text-sm whitespace-pre-wrap break-words">{pending}</p>}
        {busy && <p role="status" className="text-sm text-slate-500">{t.waiting}</p>}
        <div ref={end} />
      </div>
      {error && <p role="alert" className="text-sm text-rose-800 bg-rose-50 rounded-xl p-3">{error}</p>}
      {result && <p className="text-xs font-semibold text-slate-500">Gemini AI · {result.model}</p>}
      {result?.event_input && <section className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
        <h3 className="font-bold text-emerald-900">{t.draft}</h3>
        <p className="text-sm break-words">{result.event_input.name} · {result.event_input.city} · {result.event_input.guest_count} · INR {result.event_input.total_budget.toLocaleString()}</p>
        <button disabled={busy} onClick={() => onReview(result.event_input!)} className="px-4 py-3 rounded-xl bg-emerald-700 text-white text-sm font-bold disabled:opacity-50">{t.review}</button>
      </section>}
      <form onSubmit={event => { event.preventDefault(); void send(); }} className="space-y-2">
        <label htmlFor="chat-message" className="text-sm font-semibold">{t.message}</label>
        <textarea id="chat-message" autoFocus rows={3} maxLength={3000} disabled={busy || atLimit} value={input} onChange={event => setInput(event.target.value)} placeholder={t.placeholder} className="w-full rounded-xl border border-slate-200 p-3 text-base" />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={busy || !input.trim() || atLimit} className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold text-sm disabled:opacity-50">{t.send}</button>
          <button type="button" disabled={busy} onClick={onForm} className="px-4 py-2 rounded-xl border border-slate-200 text-sm">{t.form}</button>
          <button type="button" disabled={busy} onClick={() => { setMessages([]); setResult(null); setError(''); setInput(''); }} className="px-4 py-2 text-sm underline">{t.reset}</button>
        </div>
        {atLimit && <p className="text-sm text-amber-800">{t.limit}</p>}
      </form>
      <p className="text-xs text-slate-500">{t.note}</p>
    </DialogPanel>
  </div>;
}
