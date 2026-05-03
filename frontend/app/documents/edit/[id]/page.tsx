'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DocumentEditor from '../../../../components/DocumentEditor';
import CompliancePanel from '../../../../components/CompliancePanel';
import {
  analyzeDocument,
  autoFixDocument,
  explainRisk,
  getDocumentAudit,
  getDocumentById,
  suggestCompliantDocument,
  workflowDocument
} from '../../../../lib/api';
import { getDefaultUserId } from '../../../../lib/user';

interface TemplateRef {
  _id?: string;
  name?: string;
  type?: string;
}

interface ComplianceDoc {
  _id: string;
  generatedContent: string;
  riskScore: number;
  suggestions: string[];
  complianceIssues: Array<{ rule: string; detail: string }>;
  version?: number;
  versionHistory?: Array<{ version: number; source: string; savedAt: string }>;
  approvalStage?: string;
  approvalEvents?: Array<{ at: string; role: string; action: string; note?: string }>;
  templateId?: string | TemplateRef;
  status?: string;
}

interface AuditRow {
  _id: string;
  action: string;
  createdAt?: string;
  details?: Record<string, unknown>;
}

const approvalLabels: Record<string, string> = {
  none: 'Not submitted',
  pending_hr: 'Awaiting HR',
  pending_manager: 'Awaiting manager',
  approved: 'Approved',
  rejected: 'Rejected'
};

export default function DocumentWorkspacePage() {
  const params = useParams();
  const id = params?.id as string;
  const [doc, setDoc] = useState<ComplianceDoc | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explain, setExplain] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [genLoading, setGenLoading] = useState<'fix' | 'suggest' | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);

  const refresh = useCallback(async () => {
    if (!id) return;
    const res = await getDocumentById(id);
    const d = res.data.data as ComplianceDoc;
    setDoc(d);
    setContent(d.generatedContent);
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError('Missing document id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getDocumentById(id), getDocumentAudit(id)])
      .then(([dRes, aRes]) => {
        if (cancelled) return;
        const d = dRes.data.data as ComplianceDoc;
        setDoc(d);
        setContent(d.generatedContent);
        setAudit(aRes.data.data as AuditRow[]);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load document.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const reloadAudit = useCallback(async () => {
    if (!id) return;
    const aRes = await getDocumentAudit(id);
    setAudit(aRes.data.data as AuditRow[]);
  }, [id]);

  const handleAnalyze = async () => {
    if (!doc) return;
    try {
      const response = await analyzeDocument(doc._id);
      const analysis = response.data.data;
      setDoc((prev) => (prev ? { ...prev, ...analysis } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExplain = async () => {
    if (!doc) return;
    setExplainLoading(true);
    setExplain(null);
    try {
      const res = await explainRisk(doc._id);
      setExplain((res.data.data as { explanation?: string }).explanation ?? '');
      await reloadAudit();
    } catch (e) {
      console.error(e);
      setExplain('Could not load explanation.');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleAutoFix = async () => {
    if (!doc) return;
    setGenLoading('fix');
    try {
      const res = await autoFixDocument(doc._id);
      const updated = res.data.data as ComplianceDoc;
      setDoc(updated);
      setContent(updated.generatedContent);
      await reloadAudit();
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(null);
    }
  };

  const handleSuggestCompliant = async () => {
    if (!doc) return;
    setGenLoading('suggest');
    try {
      const res = await suggestCompliantDocument(doc._id);
      const updated = res.data.data as ComplianceDoc;
      setDoc(updated);
      setContent(updated.generatedContent);
      await reloadAudit();
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(null);
    }
  };

  const runWorkflow = async (action: 'submit' | 'hr_approve' | 'manager_approve' | 'reject') => {
    if (!doc) return;
    try {
      const res = await workflowDocument(doc._id, {
        action,
        actorUserId: getDefaultUserId()
      });
      setDoc(res.data.data as ComplianceDoc);
      await reloadAudit();
    } catch (e) {
      console.error(e);
      alert((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Workflow action failed');
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="rounded-3xl bg-white p-8 shadow-panel text-slate-600">Loading workspace…</p>
      </main>
    );
  }

  if (error || !doc) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-panel">
          <p className="font-semibold text-slate-950">Document not found</p>
          <p className="mt-2 text-slate-600">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sky-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const tpl = typeof doc.templateId === 'object' && doc.templateId ? doc.templateId : null;
  const stage = doc.approvalStage ?? 'none';
  const htmlForExport = content || doc.generatedContent;
  const exportBaseName = (tpl?.name ?? 'Document').replace(/[/\\?%*:|"<>]/g, '-').trim() || 'Document';

  const handleExportPdf = async () => {
    if (!htmlForExport) return;
    setExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = htmlForExport;
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.fontSize = '12px';
      window.document.body.appendChild(tempDiv);
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      window.document.body.removeChild(tempDiv);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${exportBaseName}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF export failed. Try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportDocx = async () => {
    if (!htmlForExport) return;
    setExporting('docx');
    try {
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      const docxFile = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: htmlForExport.replace(/<[^>]*>/g, ''),
                    size: 24
                  })
                ]
              })
            ]
          }
        ]
      });
      const buffer = await Packer.toBuffer(docxFile);
      const blob = new Blob([new Uint8Array(buffer)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${exportBaseName}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('DOCX export failed. Try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-10 xl:grid-cols-[1.45fr_0.95fr]">
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Document workspace</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">{tpl?.name ?? 'Document'}</h1>
              <p className="mt-1 text-sm text-slate-600">
                Version v{doc.version ?? 1} · {approvalLabels[stage] ?? stage}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void handleExportPdf()}
                disabled={exporting !== null || !htmlForExport}
                className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {exporting === 'pdf' ? 'PDF…' : 'Export PDF'}
              </button>
              <button
                type="button"
                onClick={() => void handleExportDocx()}
                disabled={exporting !== null || !htmlForExport}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {exporting === 'docx' ? 'DOCX…' : 'Export DOCX'}
              </button>
              <Link href="/dashboard" className="text-sm font-medium text-sky-600 hover:underline">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExplain}
              disabled={explainLoading}
              className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100 disabled:opacity-50"
            >
              {explainLoading ? 'Explaining…' : 'Explain risk'}
            </button>
            <button
              type="button"
              onClick={handleAutoFix}
              disabled={genLoading !== null}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-50"
            >
              {genLoading === 'fix' ? 'Fixing…' : 'Auto-fix issues'}
            </button>
            <button
              type="button"
              onClick={handleSuggestCompliant}
              disabled={genLoading !== null}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-100 disabled:opacity-50"
            >
              {genLoading === 'suggest' ? 'Drafting…' : 'Suggest compliant version'}
            </button>
          </div>

          {explain && (
            <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/80 p-4 text-sm text-slate-800">
              <p className="font-semibold text-violet-900">Risk explanation</p>
              <p className="mt-2 whitespace-pre-wrap">{explain}</p>
            </div>
          )}
        </div>

        <DocumentEditor
          content={content}
          onChange={setContent}
          onPromptComplete={(result) => {
            setContent(result);
            void handleAnalyze();
          }}
          documentId={doc._id}
          onAiEditComplete={() => {
            void refresh();
            void reloadAudit();
          }}
        />
      </section>

      <section className="space-y-6">
        <CompliancePanel
          riskScore={doc.riskScore || 0}
          suggestions={doc.suggestions || []}
          issues={doc.complianceIssues || []}
        />
        <button
          type="button"
          onClick={() => handleAnalyze()}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Re-analyze
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-950">Approval (HR → Manager → Final)</h2>
          <p className="mt-2 text-sm text-slate-600">
            Submit for review, then HR and manager approve in order. Manager approval marks the document final.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {stage === 'none' && (
              <button
                type="button"
                onClick={() => runWorkflow('submit')}
                className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Submit for HR review
              </button>
            )}
            {stage === 'pending_hr' && (
              <button
                type="button"
                onClick={() => runWorkflow('hr_approve')}
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                HR approve
              </button>
            )}
            {stage === 'pending_manager' && (
              <button
                type="button"
                onClick={() => runWorkflow('manager_approve')}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Manager approve (final)
              </button>
            )}
            {(stage === 'pending_hr' || stage === 'pending_manager') && (
              <button
                type="button"
                onClick={() => runWorkflow('reject')}
                className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
            )}
          </div>
          {doc.approvalEvents && doc.approvalEvents.length > 0 && (
            <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto text-xs text-slate-600">
              {[...doc.approvalEvents].reverse().map((ev, i) => (
                <li key={i} className="rounded-lg bg-slate-50 p-2">
                  {ev.action} · {ev.role} · {ev.at ? new Date(ev.at).toLocaleString() : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-950">Version history</h2>
          {!doc.versionHistory?.length ? (
            <p className="mt-2 text-sm text-slate-600">No prior versions yet.</p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-slate-700">
              {[...doc.versionHistory].reverse().map((h, i) => (
                <li key={i} className="rounded-xl border border-slate-100 p-3">
                  v{h.version} · {h.source} · {h.savedAt ? new Date(h.savedAt).toLocaleString() : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-950">Audit log</h2>
          {!audit.length ? (
            <p className="mt-2 text-sm text-slate-600">No audit entries.</p>
          ) : (
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-xs text-slate-600">
              {audit.map((a) => (
                <li key={a._id} className="rounded-lg bg-slate-50 p-2 font-mono">
                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''} — {a.action}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
