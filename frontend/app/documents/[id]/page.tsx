'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateDocument, getTemplateById } from '../../../lib/api';
import { getDefaultUserId } from '../../../lib/user';

interface Template {
  _id: string;
  name: string;
  type: string;
  content: string;
  placeholders: string[];
  metadata?: { category?: string; description?: string };
}

export default function NewDocumentFromTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!templateId) {
      setLoadError('Missing template id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    setLoading(true);
    getTemplateById(templateId)
      .then((response) => {
        if (cancelled) return;
        setTemplate(response.data.data as Template);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
            : null;
        setLoadError(message || 'Could not load template. Is the API running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const handleGenerate = async () => {
    if (!template) return;
    setGenerating(true);
    try {
      const response = await generateDocument({
        userId: getDefaultUserId(),
        templateId: template._id,
        variables
      });
      const doc = response.data.data;
      router.push(`/documents/edit/${doc._id}`);
    } catch (error) {
      console.error('Failed to generate document:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
        <p className="rounded-3xl bg-white p-8 shadow-panel text-slate-600">Loading template…</p>
      </main>
    );
  }

  if (loadError || !template) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-panel">
          <p className="font-semibold text-slate-950">Template not available</p>
          <p className="mt-2 text-slate-600">{loadError || 'Template not found.'}</p>
          <Link href="/templates" className="mt-4 inline-block text-sky-600 hover:underline">
            Back to templates
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">New document</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{template.name}</h1>
        <p className="mt-2 text-slate-600">Fill variables, then continue to the editor workspace.</p>

        <div className="mt-8 space-y-4">
          {template.placeholders.map((placeholder) => (
            <div key={placeholder}>
              <label className="block text-sm font-medium text-slate-800">{placeholder}</label>
              <input
                type="text"
                value={variables[placeholder] || ''}
                onChange={(e) => setVariables({ ...variables, [placeholder]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-sky-400"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate & open workspace'}
          </button>
          <Link
            href="/templates"
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}
