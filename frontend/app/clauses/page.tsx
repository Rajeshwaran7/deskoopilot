'use client';

import { useEffect, useState } from 'react';
import { listClauses } from '../../lib/api';

interface Clause {
  _id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  states: string[];
}

const STATES = [
  '',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'West Bengal',
  'Gujarat'
];

export default function ClausesPage() {
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listClauses({
      state: state || undefined,
      category: category || undefined
    })
      .then((res) => {
        if (!cancelled) setClauses(res.data.data as Clause[]);
      })
      .catch(() => {
        if (!cancelled) setClauses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state, category]);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Clause library</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">India compliance clauses</h1>
        <p className="mt-2 text-slate-600">
          PF, ESI, and state Shops &amp; Establishments snippets used by the rule engine and GenAI flows.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            State filter
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
            >
              {STATES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || 'All states'}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
            >
              <option value="">All</option>
              <option value="pf">PF</option>
              <option value="esi">ESI</option>
              <option value="shops_act">Shops &amp; Establishments</option>
              <option value="general">General</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading clauses…</p>
      ) : (
        <ul className="space-y-4">
          {clauses.map((c) => (
            <li key={c._id} className="rounded-3xl bg-white p-6 shadow-panel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-950">{c.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-600">
                  {c.category.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">{c.slug}</p>
              {c.states?.length ? (
                <p className="mt-2 text-sm text-slate-600">States: {c.states.join(', ')}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Applies: India-wide</p>
              )}
              <p className="mt-4 whitespace-pre-wrap text-slate-700">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
