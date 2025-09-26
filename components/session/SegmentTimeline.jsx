function formatDuration(durationMs) {
  if (typeof durationMs !== 'number' || Number.isNaN(durationMs)) {
    return '—';
  }
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function statusLabel(status) {
  if (!status) return 'Pending';
  switch (status) {
    case 'in-progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'interrupted':
      return 'Interrupted';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export default function SegmentTimeline({
  segments = [],
  activeIndex = null,
  activeRemainingMs = null,
  status = 'idle',
  onTogglePause = () => {},
  onAdvance = () => {},
}) {
  const activeSegment = activeIndex != null ? segments[activeIndex] : null;
  const sessionStatusLabel =
    status === 'paused'
      ? 'Paused'
      : status === 'completed'
        ? 'Completed'
        : status === 'running'
          ? 'In progress'
          : 'Idle';

  const canControl = segments.length > 0 && status !== 'completed';
  const canPause = canControl && activeSegment;

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-inner shadow-indigo-900/30">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">Session timeline</p>
          <h3 className="text-xl font-semibold text-white">Guided interview flow</h3>
          <p className="mt-1 text-sm text-indigo-100/70">
            Follow the structured segments to pace your discussion and stay aligned with interview expectations.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-xs uppercase tracking-widest text-indigo-200/80">Status</span>
          <span className="text-sm font-semibold text-white/90">{sessionStatusLabel}</span>
          {activeSegment && (
            <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-indigo-300/40 px-3 py-1 text-xs font-medium text-indigo-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
              {activeRemainingMs != null
                ? `${formatDuration(activeRemainingMs)} remaining`
                : `${formatDuration(activeSegment.elapsedMs)} elapsed`}
            </span>
          )}
        </div>
      </header>

      {segments.length === 0 ? (
        <p className="mt-6 rounded-xl border border-indigo-300/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100/90">
          Segment metadata is not available for this scenario yet. You can still progress manually using the controls below.
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {segments.map((segment, index) => {
            const isActive = index === activeIndex;
            const planned = segment.plannedDurationMs;
            const elapsed = segment.elapsedMs || 0;
            const progress =
              typeof planned === 'number' && planned > 0
                ? Math.min(100, Math.round((elapsed / planned) * 100))
                : segment.status === 'completed'
                  ? 100
                  : isActive
                    ? 20
                    : 0;

            return (
              <li
                key={segment.id || `segment-${index}`}
                className={`rounded-2xl border p-4 transition ${
                  isActive
                    ? 'border-indigo-300/60 bg-indigo-500/20 shadow-lg shadow-indigo-900/30'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                        isActive
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/30 bg-slate-900/60 text-indigo-100'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">{`Segment ${index + 1}`}</p>
                      <p className="text-base font-semibold text-white">{segment.name || `Segment ${index + 1}`}</p>
                    </div>
                  </div>
                  <div className="text-left text-sm text-indigo-100/80 md:text-right">
                    <p className="text-xs uppercase tracking-widest text-indigo-200/60">{statusLabel(segment.status)}</p>
                    <p className="font-semibold text-white">
                      {formatDuration(elapsed)}
                      {planned ? ` / ${formatDuration(planned)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full ${
                      isActive ? 'bg-emerald-300' : segment.status === 'completed' ? 'bg-indigo-200' : 'bg-white/20'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onTogglePause}
          disabled={!canPause}
          className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
            canPause
              ? 'border border-white/20 bg-white/10 text-white hover:border-white hover:bg-white/20'
              : 'cursor-not-allowed border border-white/10 bg-white/5 text-white/40'
          }`}
        >
          {status === 'paused' ? 'Resume segment' : 'Pause segment'}
        </button>
        <button
          type="button"
          onClick={onAdvance}
          disabled={!canControl}
          className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
            canControl
              ? 'border border-indigo-300/60 bg-indigo-500/20 text-indigo-100 hover:border-indigo-200 hover:bg-indigo-400/30'
              : 'cursor-not-allowed border border-white/10 bg-white/5 text-white/40'
          }`}
        >
          Skip to next segment
        </button>
      </div>
    </section>
  );
}
