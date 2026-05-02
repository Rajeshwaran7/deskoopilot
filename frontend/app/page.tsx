import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="rounded-3xl bg-white p-10 shadow-panel">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Compliance Copilot</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">HR documents tailored for India.</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Generate offer letters, policies, and compliance-ready documents with AI guidance, built-in rule evaluation, and India-specific risk analysis.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/templates" className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50">
              <p className="text-sm font-semibold text-slate-900">Template library</p>
              <p className="mt-3 text-slate-600">Create and manage HR templates with placeholders for automatic document generation.</p>
            </Link>
            <Link href="/documents" className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50">
              <p className="text-sm font-semibold text-slate-900">Document editor</p>
              <p className="mt-3 text-slate-600">Edit documents using AI prompts and see compliance insights on the side panel.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 shadow-panel">
          <h2 className="text-xl font-semibold text-slate-950">Smart template engine</h2>
          <p className="mt-3 text-slate-600">Author templates once and generate personalized HR documents at scale.</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-panel">
          <h2 className="text-xl font-semibold text-slate-950">Compliance rule engine</h2>
          <p className="mt-3 text-slate-600">Apply India region rules dynamically to catch statutory gaps before review.</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-panel">
          <h2 className="text-xl font-semibold text-slate-950">Risk analysis</h2>
          <p className="mt-3 text-slate-600">Measure risk severity and receive actionable suggestions in real time.</p>
        </article>
      </section>
    </main>
  );
}
