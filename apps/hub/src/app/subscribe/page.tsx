'use client';

import { useState } from 'react';

export default function SubscribePage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [note, setNote] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setNote('');

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(form.get('name') || ''),
          email: String(form.get('email') || ''),
          cadence: String(form.get('cadence') || 'daily'),
          language: String(form.get('language') || 'en'),
          location: String(form.get('location') || ''),
          site: 'hub',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not complete registration');
      }

      setStatus('ok');
      setNote('Registration complete. You will receive the next intelligence briefing.');
      event.currentTarget.reset();
    } catch (error) {
      setStatus('error');
      setNote(String(error));
    }
  }

  return (
    <main className="pt-20 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8 text-center">
          <p className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-3">XXXIII DELIVERY</p>
          <h1 className="text-4xl font-bold text-text-primary mb-3">Subscribe to Intelligence</h1>
          <p className="text-text-secondary">
            Get concise AI briefings on what changed, what it means, and what to watch next.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border-subtle bg-surface p-6 space-y-4">
          <input
            name="name"
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            placeholder="Name"
          />

          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            placeholder="Email"
          />

          <div className="grid sm:grid-cols-3 gap-3">
            <select name="cadence" className="rounded-lg border border-border-subtle bg-background px-3 py-2">
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
            </select>

            <select name="language" className="rounded-lg border border-border-subtle bg-background px-3 py-2">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ar">Arabic</option>
            </select>

            <input
              name="location"
              className="rounded-lg border border-border-subtle bg-background px-3 py-2"
              placeholder="Region"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-lg bg-gold text-black font-semibold py-2.5 disabled:opacity-70"
          >
            {status === 'sending' ? 'Submitting...' : 'Start Delivery'}
          </button>

          {note && (
            <p className={`text-sm ${status === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
              {note}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
