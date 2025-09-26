export default function ScenarioPicker({
  open,
  onClose,
  scenarios = [],
  onSelect,
  selectedScenarioId,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Scenario library</p>
            <h3 className="text-lg font-semibold text-slate-900">Choose a scenario to practice</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {scenarios.map((scenario) => {
              const isActive = scenario.id === selectedScenarioId;
              return (
                <button
                  type="button"
                  key={scenario.id}
                  onClick={() => onSelect?.(scenario)}
                  className={`group flex h-full flex-col justify-between rounded-2xl border p-5 text-left transition shadow-sm hover:-translate-y-1 hover:shadow-lg ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 shadow-indigo-200/80'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-lg font-semibold ${
                          isActive ? 'text-indigo-900' : 'text-slate-900'
                        }`}
                      >
                        {scenario.title}
                      </h4>
                      {isActive && (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                          Selected
                        </span>
                      )}
                    </div>
                    {scenario.description && (
                      <p
                        className={`text-sm leading-relaxed ${
                          isActive ? 'text-indigo-800/90' : 'text-slate-600'
                        }`}
                      >
                        {scenario.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    {scenario.difficulty && (
                      <span
                        className={`rounded-full px-3 py-1 ${
                          isActive ? 'bg-white/80 text-indigo-700' : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {scenario.difficulty}
                      </span>
                    )}
                    {scenario.duration && (
                      <span
                        className={`rounded-full px-3 py-1 ${
                          isActive ? 'bg-white/60 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {scenario.duration}
                      </span>
                    )}
                    {scenario.focusAreas?.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className={`rounded-full px-3 py-1 ${
                          isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
