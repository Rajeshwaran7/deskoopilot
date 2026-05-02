import Link from 'next/link';

interface TemplateDescriptor {
  id: string;
  name: string;
  description: string;
}

interface TemplateSelectorProps {
  templates: TemplateDescriptor[];
}

export default function TemplateSelector({ templates }: TemplateSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {templates.map((template) => (
        <Link key={template.id} href={`/documents/${template.id}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel transition hover:border-sky-300">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-600">Template</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">{template.name}</h3>
          <p className="mt-2 text-slate-600">{template.description}</p>
        </Link>
      ))}
    </div>
  );
}
