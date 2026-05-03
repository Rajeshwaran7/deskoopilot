'use client';

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { aiEditDocument, patchDocument } from '../lib/api';

interface DocumentEditorProps {
  content: string;
  onChange: (value: string) => void;
  onPromptComplete: (updatedContent: string) => void;
  documentId?: string;
  /** Called after a successful AI edit (server persisted). Use to refresh risk / version. */
  onAiEditComplete?: () => void;
}

export default function DocumentEditor({
  content,
  onChange,
  onPromptComplete,
  documentId,
  onAiEditComplete
}: DocumentEditorProps) {
  const [prompt, setPrompt] = useState('Update this document to reflect Tamil Nadu Shops Act compliance.');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(content);
  }, [content, editor]);

  const handleSaveDraft = async () => {
    if (!documentId) {
      onPromptComplete(content);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await patchDocument(documentId, content);
      onAiEditComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      console.error('Failed to save draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPrompt = async () => {
    if (!documentId) {
      onPromptComplete(prompt); // Fallback if no documentId
      return;
    }
    setEditing(true);
    setError(null);
    try {
      const response = await aiEditDocument(documentId, prompt);
      const updatedContent = response.data?.data?.generatedContent || response.data?.generatedContent;
      if (!updatedContent) {
        throw new Error('Invalid response format from server');
      }
      onPromptComplete(updatedContent);
      onAiEditComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit document';
      setError(errorMessage);
      console.error('Failed to edit document:', err);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">AI Document Editor</h2>
            <p className="text-sm text-slate-600">Edit the document and refine it with an AI prompt.</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSaveDraft()}
            disabled={saving}
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save draft'}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
        <label className="block text-sm font-medium text-slate-800">AI Prompt</label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="mt-3 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
        />
        {error && (
          <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleApplyPrompt}
          disabled={editing}
          className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {editing ? 'Applying...' : 'Apply AI edit'}
        </button>
      </div>
    </div>
  );
}
