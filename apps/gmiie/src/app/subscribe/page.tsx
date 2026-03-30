'use client';

import { useMemo, useState } from 'react';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function SubscribePage() {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cadence, setCadence] = useState<'daily' | 'twice_daily' | 'weekly'>('daily');
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('');

  const cadenceLabel = useMemo(() => {
    if (cadence === 'twice_daily') return 'Twice daily AM/PM';
    if (cadence === 'weekly') return 'Weekly brief';
    return 'Daily brief';
  }, [cadence]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          cadence,
          language,
          location,
          site: 'xxxiii',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to complete registration');
      }

      setState('success');
      setMessage('You are subscribed. Digest delivery is now active.');
    } catch (error) {
      setState('error');
      setMessage(String(error));
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="meta-line mb-3">INTELLIGENCE DELIVERY</p>
        <h1 className="text-heading-lg sm:text-display-sm font-bold text-text-primary mb-3">
          Register for AI Briefings
        </h1>
        <p className="text-body text-text-secondary max-w-2xl">
          Receive short daily or twice-daily insights generated from the GMIIE pipeline, including what changed,
          why it matters, and methodology-linked context.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border-subtle bg-surface p-5 sm:p-7">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="meta-line">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-body"
              placeholder="Your name"
            />
          </label>

          <label className="space-y-2">
            <span className="meta-line">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-body"
              placeholder="you@company.com"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="space-y-2">
            <span className="meta-line">Cadence</span>
            <select
              value={cadence}
              onChange={(e) => setCadence(e.target.value as any)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-body"
            >
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="meta-line">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-body"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ar">Arabic</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="meta-line">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-body"
              placeholder="US, EU, APAC..."
            />
          </label>
        </div>

        <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-body-sm text-text-secondary">
          Selected cadence: <span className="text-text-primary font-semibold">{cadenceLabel}</span>
        </div>

        <button
          type="submit"
          disabled={state === 'submitting'}
          className="inline-flex items-center justify-center rounded-lg bg-gold px-5 py-2.5 text-black font-semibold disabled:opacity-60"
        >
          {state === 'submitting' ? 'Registering...' : 'Register & Activate Delivery'}
        </button>

        {message && (
          <p className={`text-body-sm ${state === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
