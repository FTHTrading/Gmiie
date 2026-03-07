'use client';

import { useState } from 'react';

interface SettingSection {
  title: string;
  description: string;
  fields: { label: string; value: string; type: 'text' | 'number' | 'select' | 'password'; options?: string[] }[];
}

const SECTIONS: SettingSection[] = [
  {
    title: 'AI Configuration',
    description: 'Model selection and generation parameters',
    fields: [
      { label: 'Primary Model', value: 'gpt-4-turbo', type: 'select', options: ['gpt-4-turbo', 'gpt-4o', 'claude-3.5-sonnet', 'claude-3-opus'] },
      { label: 'Fallback Model', value: 'gpt-4o-mini', type: 'select', options: ['gpt-4o-mini', 'gpt-3.5-turbo', 'claude-3-haiku'] },
      { label: 'Temperature', value: '0.3', type: 'number' },
      { label: 'Max Tokens', value: '4096', type: 'number' },
    ],
  },
  {
    title: 'Ingestion Settings',
    description: 'Source polling and deduplication configuration',
    fields: [
      { label: 'RSS Poll Interval', value: '15', type: 'number' },
      { label: 'Scrape Interval (min)', value: '60', type: 'number' },
      { label: 'Max Scrape Pages / Run', value: '50', type: 'number' },
      { label: 'Dedup Threshold', value: '0.85', type: 'number' },
    ],
  },
  {
    title: 'Publishing Rules',
    description: 'Automated publishing thresholds and review requirements',
    fields: [
      { label: 'Auto-Publish Signal Threshold', value: '8.0', type: 'number' },
      { label: 'Review Required Types', value: 'Deep Dive, Regulatory Alert', type: 'text' },
      { label: 'Embargo Hours', value: '0', type: 'number' },
      { label: 'Auto-Publish Enabled', value: 'true', type: 'select', options: ['true', 'false'] },
    ],
  },
  {
    title: 'SEO Settings',
    description: 'Search engine optimization defaults',
    fields: [
      { label: 'Default Meta Title Suffix', value: '| XXXIII Intelligence', type: 'text' },
      { label: 'Sitemap Frequency', value: 'hourly', type: 'select', options: ['always', 'hourly', 'daily', 'weekly'] },
      { label: 'Canonical Base URL', value: 'https://xxxiii.io', type: 'text' },
      { label: 'OG Image Default', value: '/og/default.png', type: 'text' },
    ],
  },
  {
    title: 'API Keys',
    description: 'Third-party service credentials — values are masked',
    fields: [
      { label: 'OpenAI API Key', value: 'sk-••••••••••••••••••••3kF9', type: 'password' },
      { label: 'Anthropic API Key', value: 'sk-ant-••••••••••••••••••a7X2', type: 'password' },
      { label: 'SEC EDGAR User Agent', value: 'XXXIII Bot admin@xxxiii.io', type: 'text' },
      { label: 'Chainalysis API Key', value: 'ca-••••••••••••••••••8mN1', type: 'password' },
    ],
  },
];

export default function SettingsPage() {
  const [sections, setSections] = useState(SECTIONS);

  const updateField = (sectionIdx: number, fieldIdx: number, newValue: string) => {
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIdx
          ? {
              ...section,
              fields: section.fields.map((f, fi) =>
                fi === fieldIdx ? { ...f, value: newValue } : f
              ),
            }
          : section
      )
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/40 text-sm mt-1">System configuration and service credentials</p>
      </div>

      {sections.map((section, si) => (
        <div key={section.title} className="bg-surface border border-white/5 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white/80">{section.title}</h2>
            <p className="text-xs text-white/30 mt-0.5">{section.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field, fi) => (
              <div key={field.label} className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={field.value}
                    onChange={(e) => updateField(si, fi, e.target.value)}
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white/70 focus:outline-none focus:border-gold/40"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'password' ? 'password' : 'text'}
                    value={field.value}
                    onChange={(e) => updateField(si, fi, e.target.value)}
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/40"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button className="bg-gold text-black text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-light transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
