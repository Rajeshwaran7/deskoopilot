'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTemplates } from '../../lib/api';

interface Template {
  _id: string;
  name: string;
  type: string;
  description?: string;
  metadata?: { category?: string; description?: string };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemplates()
      .then((response) => {
        setTemplates(response.data.data);
      })
      .catch((error) => {
        console.error('Failed to fetch templates:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-panel">
          <p>Loading templates...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl bg-white p-8 shadow-panel">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Templates</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Reusable HR templates</h1>
          <p className="mt-3 text-slate-600">Manage document masters, define placeholders, and call them from the document generator API.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {templates.length > 0 ? (
            templates.map((template) => (
              <Link key={template._id} href={`/documents/${template._id}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel transition hover:border-sky-300">
                <p className="text-sm text-slate-500 uppercase tracking-[0.18em]">{template.type.replace('_', ' ')}</p>
                <h2 className="mt-4 text-xl font-semibold text-slate-950">{template.name}</h2>
                <p className="mt-3 text-slate-600">
                  {template.description || template.metadata?.description || 'Open the editor with the selected template and start your AI-assisted workflow.'}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-slate-600">No templates available. Create some via the API.</p>
          )}
        </div>
      </div>
    </main>
  );
}

