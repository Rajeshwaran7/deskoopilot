interface CompliancePanelProps {
  riskScore: number;
  suggestions: string[];
  issues: Array<{ rule: string; detail: string }>;
}

export default function CompliancePanel({ riskScore, suggestions, issues }: CompliancePanelProps) {
  const riskLabel = riskScore > 70 ? 'High' : riskScore > 35 ? 'Medium' : 'Low';
  const riskColor = riskLabel === 'High' ? 'text-rose-600' : riskLabel === 'Medium' ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="rounded-3xl bg-white p-8 shadow-panel">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Compliance panel</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Risk summary</h2>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-600">Estimated risk score</p>
        <div className="mt-4 flex items-center gap-4">
          <span className={`rounded-3xl bg-slate-950 px-4 py-3 text-xl font-semibold text-white ${riskColor}`}>{riskScore}%</span>
          <span className={`text-lg font-semibold ${riskColor}`}>{riskLabel}</span>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Suggestions</h3>
          <ul className="mt-3 space-y-3 text-slate-600">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <li key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {suggestion}
                </li>
              ))
            ) : (
              <li className="text-slate-500">No suggestions yet. Run an analysis to see recommendations.</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-950">Compliance issues</h3>
          <ul className="mt-3 space-y-3 text-slate-600">
            {issues.length > 0 ? (
              issues.map((issue, index) => (
                <li key={index} className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="font-semibold text-slate-950">{issue.rule}</p>
                  <p>{issue.detail}</p>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No compliance issues detected yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
