'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, Send, Sparkles } from 'lucide-react';
import { ApiError, apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

type Turn = { role: 'user' | 'assistant'; content: string };
type Source = { slug: string; title: string };

type ChatResponse = { answer: string; sources: Source[]; model: string };
type DocsResponse = { docs: { slug: string; title: string }[]; count: number };

const SUGGESTIONS = [
  'What services does Devya offer and how are they priced?',
  'How does the booking → contract → invoice flow work?',
  'ما هي قرارات البنية المعمارية الأساسية لدينا؟',
  'What is the X-Ray engagement and how does it run?',
];

export function AssistantChat() {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    apiFetch<DocsResponse>('/api/assistant/docs')
      .then((d) => setDocCount(d.count))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, busy]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setError(null);
    setInput('');
    const history = turns.slice(-8);
    setTurns((t) => [...t, { role: 'user', content: q }]);
    setBusy(true);
    try {
      const res = await apiFetch<ChatResponse>('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ question: q, history }),
      });
      setTurns((t) => [...t, { role: 'assistant', content: res.answer }]);
      setSources(res.sources);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
        return;
      }
      const msg =
        err instanceof ApiError && err.status === 503
          ? 'The assistant is not configured yet — docs or the model API key are missing.'
          : 'Something went wrong — try again.';
      setError(msg);
      // Roll the question back into the input so nothing is lost.
      setTurns((t) => t.slice(0, -1));
      setInput(q);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Transcript */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {turns.length === 0 && (
          <div className="pt-10 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.03] mb-4">
              <Sparkles className="h-6 w-6 text-ink-200" />
            </div>
            <h1 className="text-xl font-semibold text-white">Ask Devya</h1>
            <p className="mt-2 text-sm text-ink-300 max-w-md mx-auto">
              Answers grounded in the company docs — architecture decisions, app
              guides, processes, pricing. English or Arabic.
              {docCount !== null && (
                <span className="block mt-1 text-ink-500 text-xs">
                  {docCount} documents indexed
                </span>
              )}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 text-start">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3 text-[13px] text-ink-200 hover:border-white/25 hover:text-white transition-colors text-start"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div
            key={i}
            dir="auto"
            className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
              turn.role === 'user'
                ? 'bg-white text-ink-950 ms-12'
                : 'border border-white/10 bg-white/[0.03] text-ink-100 me-12',
            )}
          >
            {turn.content}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-ink-400 text-sm px-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reading the docs…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {sources.length > 0 && turns.length > 0 && !busy && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            <BookOpen className="h-3.5 w-3.5 text-ink-500" />
            {sources.slice(0, 8).map((s) => (
              <span
                key={s.slug}
                title={s.slug}
                className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[11px] text-ink-400"
              >
                {s.title}
              </span>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="mt-4 flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-950/70 backdrop-blur px-3 py-2.5"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void ask(input);
            }
          }}
          dir="auto"
          rows={Math.min(4, Math.max(1, input.split('\n').length))}
          placeholder="Ask anything about Devya — apps, processes, pricing, decisions…"
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-ink-500 outline-none px-1.5 py-1.5"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length < 2}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ink-950 disabled:opacity-40 transition-opacity"
          aria-label="Send"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
