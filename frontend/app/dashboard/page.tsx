'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteDocument, listDocuments, generateDocumentWithRAG } from '../../lib/api';
import { getDefaultUserId } from '../../lib/user';

interface TemplateRef {
  _id?: string;
  name?: string;
  type?: string;
}

interface DocumentRow {
  _id: string;
  updatedAt?: string;
  riskScore?: number;
  status?: string;
  approvalStage?: string;
  version?: number;
  templateId?: string | TemplateRef;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRAGModal, setShowRAGModal] = useState(false);
  const [ragInput, setRagInput] = useState('');
  const [ragDocumentType, setRagDocumentType] = useState('contract');
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listDocuments({ userId: getDefaultUserId(), limit: 50 })
      .then((res) => setDocuments(res.data.data as DocumentRow[]))
      .catch(() => setError('Could not load documents. Is the API running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(id, getDefaultUserId());
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateWithRAG = async () => {
    if (!ragInput.trim()) {
      setError('Please describe what document you need.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      await generateDocumentWithRAG({
        userId: getDefaultUserId(),
        userInput: ragInput,
        documentType: ragDocumentType
      });
      setShowRAGModal(false);
      setRagInput('');
      load();
    } catch (e) {
      console.error(e);
      setError('Failed to generate document with RAG. Is the API running?');
    } finally {
      setGenerating(false);
    }
  };

  const highRisk = documents.filter((d) => (d.riskScore ?? 0) >= 50).length;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="rounded-3xl bg-white p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">HR compliance workspace</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Generate documents from templates, run India PF / ESI / Shops Act checks, route approvals, and use GenAI assists.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Documents</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{loading ? '—' : documents.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Elevated risk (≥50)</p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">{loading ? '—' : highRisk}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Demo user id</p>
            <p className="mt-2 break-all font-mono text-xs text-slate-700">{getDefaultUserId()}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/templates"
            className="rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            New from template
          </Link>
          <button
            type="button"
            onClick={() => setShowRAGModal(true)}
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Generate with AI (RAG)
          </button>
          <Link
            href="/clauses"
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Browse clause library
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-950">Recent documents</h2>
        {error && <p className="mt-4 text-rose-600">{error}</p>}
        {loading ? (
          <p className="mt-4 text-slate-600">Loading…</p>
        ) : documents.length === 0 ? (
          <p className="mt-4 text-slate-600">No documents yet. Start from a template.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Template</th>
                  <th className="pb-3 font-medium">Risk</th>
                  <th className="pb-3 font-medium">Version</th>
                  <th className="pb-3 font-medium">Approval</th>
                  <th className="pb-3 font-medium">Updated</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => {
                  const tpl = typeof d.templateId === 'object' && d.templateId ? d.templateId : null;
                  return (
                    <tr key={d._id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{tpl?.name ?? '—'}</td>
                      <td className="py-3 text-slate-700">{d.riskScore ?? 0}%</td>
                      <td className="py-3 text-slate-700">v{d.version ?? 1}</td>
                      <td className="py-3 text-slate-700">{d.approvalStage ?? 'none'}</td>
                      <td className="py-3 text-slate-600">
                        {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/documents/edit/${d._id}`} className="text-sky-600 hover:underline">
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(d._id)}
                          className="ml-4 text-rose-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RAG Modal */}
      {showRAGModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-8 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-slate-950">Generate Document with AI</h2>
            <p className="mt-2 text-sm text-slate-600">
              Describe what contract or agreement you need. The AI will retrieve relevant clauses and generate it.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900">Document Type</label>
                <select
                  value={ragDocumentType}
                  onChange={(e) => setRagDocumentType(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="contract">Service Agreement / Contract</option>
                  <option value="sla">Service Level Agreement (SLA)</option>
                  <option value="nda">Non-Disclosure Agreement (NDA)</option>
                  <option value="policy">Company Policy</option>
                  <option value="agreement">General Agreement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Your Requirements</label>
                <textarea
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  placeholder="e.g., Create a service agreement for software development services. Must include maintenance clauses, response time SLAs, and confidentiality..."
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRAGModal(false);
                    setError(null);
                  }}
                  disabled={generating}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWithRAG}
                  disabled={generating}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {generating ? 'Generating…' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
