'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import DocumentEditor from '../../../components/DocumentEditor';
import CompliancePanel from '../../../components/CompliancePanel';
import { generateDocument, analyzeDocument } from '../../../lib/api';

interface Template {
  _id: string;
  name: string;
  type: string;
  content: string;
  placeholders: string[];
}

interface Document {
  _id: string;
  generatedContent: string;
  riskScore: number;
  suggestions: string[];
  complianceIssues: Array<{ rule: string; detail: string }>;
}

export default function DocumentPage() {
  const params = useParams();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // For MVP, assume templateId is passed and fetch template (but backend doesn't have GET /templates/:id yet, so mock or add)
    // For now, set a mock template
    setTemplate({
      _id: templateId,
      name: 'Sample Offer Letter',
      type: 'offer_letter',
      content: 'Dear {{candidateName}}, We are pleased to offer you the position of {{position}} with a salary of {{salary}} in {{state}}.',
      placeholders: ['candidateName', 'position', 'salary', 'state']
    });
    setLoading(false);
  }, [templateId]);

  const handleGenerate = async () => {
    if (!template) return;
    setGenerating(true);
    try {
      const response = await generateDocument({
        userId: 'default-user', // Mock userId
        templateId: template._id,
        variables
      });
      const doc = response.data.data;
      setDocument(doc);
      setContent(doc.generatedContent);
    } catch (error) {
      console.error('Failed to generate document:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!document) return;
    try {
      const response = await analyzeDocument(document._id);
      const analysis = response.data.data;
      setDocument((prev) => prev ? { ...prev, ...analysis } : null);
    } catch (error) {
      console.error('Failed to analyze document:', error);
    }
  };

  const handleExport = async () => {
    if (!document) return;

    try {
      // Dynamically import jsPDF and html2canvas
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create a temporary element with the document content
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = document.generatedContent;
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.fontSize = '12px';
      window.document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      window.document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`${template?.name || 'Document'}.pdf`);

      alert('Document exported successfully as PDF!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportDOCX = async () => {
    if (!document) return;

    try {
      // Dynamically import docx
      const { Document, Packer, Paragraph, TextRun } = await import('docx');

      // Create DOCX document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: document.generatedContent.replace(/<[^>]*>/g, ''), // Strip HTML tags
                  size: 24
                })
              ]
            })
          ]
        }]
      });

      // Generate and download DOCX
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${template?.name || 'Document'}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Document exported successfully as DOCX!');
    } catch (error) {
      console.error('DOCX export failed:', error);
      alert('DOCX export failed. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!template) {
    return <p>Template not found.</p>;
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-10 xl:grid-cols-[1.5fr_0.85fr]">
      <section className="rounded-3xl bg-white p-8 shadow-panel">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Document Editor</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">{template.name}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="rounded-2xl bg-sky-600 px-4 py-3 text-white transition hover:bg-sky-700">Export PDF</button>
            <button onClick={handleExportDOCX} className="rounded-2xl bg-green-600 px-4 py-3 text-white transition hover:bg-green-700">Export DOCX</button>
          </div>
        </div>

        {!document ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Fill Variables</h2>
              {template.placeholders.map((placeholder) => (
                <div key={placeholder} className="mt-4">
                  <label className="block text-sm font-medium">{placeholder}</label>
                  <input
                    type="text"
                    value={variables[placeholder] || ''}
                    onChange={(e) => setVariables({ ...variables, [placeholder]: e.target.value })}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>
              ))}
              <button onClick={handleGenerate} disabled={generating} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
                {generating ? 'Generating...' : 'Generate Document'}
              </button>
            </div>
          </div>
        ) : (
          <DocumentEditor
            content={content}
            onChange={setContent}
            onPromptComplete={(result) => {
              setContent(result);
              handleAnalyze(); // Re-analyze after edit
            }}
            documentId={document?._id}
          />
        )}
      </section>

      <section className="space-y-6">
        <CompliancePanel
          riskScore={document?.riskScore || 0}
          suggestions={document?.suggestions || []}
          issues={document?.complianceIssues || []}
        />
        {document && (
          <button onClick={handleAnalyze} className="w-full rounded bg-green-600 px-4 py-2 text-white">
            Re-analyze
          </button>
        )}
      </section>
    </main>
  );
}
