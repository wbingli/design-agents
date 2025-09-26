const CHIP_BASE =
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide';

const VARIANT_STYLES = {
  hero: {
    container:
      'rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur transition',
    heading: 'text-3xl font-semibold text-white',
    description: 'text-indigo-100',
    chip: `${CHIP_BASE} bg-white/20 text-indigo-100`,
    focusCard: 'rounded-2xl bg-white/12 p-4 text-sm text-indigo-100',
    takeawaysWrapper:
      'mt-6 rounded-2xl border border-white/20 bg-white/10 p-5 text-indigo-100/90 shadow-inner shadow-indigo-900/10',
  },
  panel: {
    container:
      'rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-left shadow-xl shadow-indigo-950/30 transition',
    heading: 'text-2xl font-semibold text-white',
    description: 'text-slate-200',
    chip: `${CHIP_BASE} bg-indigo-500/10 text-indigo-200`,
    focusCard: 'rounded-2xl bg-slate-800/60 p-4 text-sm text-indigo-100',
    takeawaysWrapper:
      'mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-indigo-100/85 shadow-inner shadow-black/20',
  },
};

export default function ScenarioPreview({ scenario, variant = 'panel' }) {
  if (!scenario) {
    return null;
  }

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.panel;

  return (
    <article className={styles.container}>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {scenario.company && <span className={styles.chip}>{scenario.company}</span>}
        {scenario.difficulty && <span className={styles.chip}>{scenario.difficulty}</span>}
        {scenario.duration && <span className={styles.chip}>{scenario.duration}</span>}
      </div>

      <h2 className={`${styles.heading} mt-4`}>{scenario.title}</h2>
      {scenario.description && (
        <p className={`${styles.description} mt-3 text-base leading-relaxed`}>{scenario.description}</p>
      )}

      {scenario.focusAreas?.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {scenario.focusAreas.map((area) => (
            <div key={area} className={styles.focusCard}>
              <span className="font-medium text-white/90">{area}</span>
            </div>
          ))}
        </div>
      )}

      {scenario.takeaways?.length > 0 && (
        <div className={styles.takeawaysWrapper}>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">What to cover</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {scenario.takeaways.map((item) => (
              <li key={item} className="flex gap-2 text-indigo-100/90">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-300" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
