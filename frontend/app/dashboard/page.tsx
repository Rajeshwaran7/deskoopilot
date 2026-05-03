'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteDocument, listDocuments } from '../../lib/api';
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
    </main>
  );
}
