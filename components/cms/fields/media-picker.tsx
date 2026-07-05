'use client';

import { useId, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { appConfig } from '@/lib/config';
import { resolveImg } from '@/lib/img';

interface MediaPickerProps {
  label: string;
  value: string;
  onChange: (url: string, publicId?: string) => void;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
}

export function MediaPicker({ label, value, onChange, helper, required, disabled }: MediaPickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${appConfig.apiUrl}/api/admin/uploads`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        let msg = `Upload failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) msg = body.error as string;
          else if (body?.message) msg = body.message as string;
        } catch {}
        throw new Error(msg);
      }
      const data = (await res.json()) as { url: string; publicId: string };
      onChange(data.url, data.publicId);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function clear() {
    onChange('');
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="surface p-3 flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.02] flex items-center justify-center">
          {value ? (
            // Intentionally a plain <img>, not next/image: `value` is live,
            // arbitrary user input (any host, possibly garbage mid-keystroke),
            // which next/image would throw on; onError quietly hides misses.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImg(value)}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-ink-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || disabled}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-ink-100 hover:bg-white/[0.07] hover:border-white/20 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={clear}
                disabled={busy || disabled}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-xs text-ink-300 hover:text-rose-300 hover:border-rose-500/40 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            <input
              id={id}
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </div>
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL"
            disabled={busy || disabled}
            className="ring-focus w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60 font-mono"
          />
          {err && <p className="text-[11px] text-rose-400">{err}</p>}
          {!err && helper && <p className="text-[11px] text-ink-500">{helper}</p>}
        </div>
      </div>
    </div>
  );
}
