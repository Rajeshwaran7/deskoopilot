import Link from 'next/link';

const linkClass = 'text-sm font-medium text-slate-600 transition hover:text-sky-700';

export default function AppNav() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-950">
          Compliance Copilot
        </Link>
        <nav className="flex flex-wrap items-center gap-6">
          <Link href="/dashboard" className={linkClass}>
            Dashboard
          </Link>
          <Link href="/templates" className={linkClass}>
            Templates
          </Link>
          <Link href="/clauses" className={linkClass}>
            Clause library
          </Link>
        </nav>
      </div>
    </header>
  );
}
