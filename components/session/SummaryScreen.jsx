import { useMemo } from 'react';

function formatDuration(ms) {
  if (!ms && ms !== 0) return '—';
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => value.toString().padStart(2, '0');
  return `${minutes}:${pad(seconds)}`;
}

function buildMarkdown(summary) {
  const lines = [];
  lines.push(`# Session Summary`);
  lines.push('');
  lines.push(`- **Session ID:** ${summary.sessionId}`);
  if (summary.scenarioId) {
    lines.push(`- **Scenario:** ${summary.scenarioId}`);
  }
  lines.push(`- **Status:** ${summary.status}`);
  if (summary.exitReason) {
    lines.push(`- **Exit Reason:** ${summary.exitReason}`);
  }
  lines.push(`- **Started:** ${summary.startedAt || 'Unknown'}`);
  lines.push(`- **Ended:** ${summary.endedAt || 'Unknown'}`);
  if (summary.totalDurationMs != null) {
    lines.push(`- **Total Duration:** ${formatDuration(summary.totalDurationMs)}`);
  }
  lines.push(`- **Messages:** ${summary.messageCount ?? summary.chatLog?.length ?? 0}`);
  lines.push('');

  if (summary.timing?.segments?.length) {
    lines.push('## Segment Timings');
    lines.push('');
    lines.push('| Segment | Planned | Actual | Status |');
    lines.push('| --- | --- | --- | --- |');
    summary.timing.segments.forEach((segment, index) => {
      lines.push(`| ${segment.name || `Segment ${index + 1}`} | ${formatDuration(segment.plannedDurationMs)} | ${formatDuration(segment.elapsedMs)} | ${segment.status || '—'} |`);
    });
    lines.push('');
  }

  if (summary.chatLog?.length) {
    lines.push('## Chat Log');
    lines.push('');
    summary.chatLog.forEach((message, index) => {
      lines.push(`### ${index + 1}. ${message.role || 'participant'} — ${message.timestamp || ''}`);
      lines.push('');
      lines.push(message.content || '');
      lines.push('');
    });
  }

  if (summary.takeaways?.length) {
    lines.push('## Key Takeaways');
    lines.push('');
    summary.takeaways.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

export default function SummaryScreen({ summary, onRestart, onChangeScenario, isPersisting = false, persistenceError = null }) {
  const takeaways = useMemo(() => {
    if (summary?.takeaways?.length) return summary.takeaways;
    if (!summary?.chatLog?.length) {
      return [
        'Session completed without recorded feedback. Review the conversation log to capture follow-up actions.',
      ];
    }
    const coachMessages = summary.chatLog.filter((entry) => entry.role === 'coach' || entry.metadata?.category === 'takeaway');
    if (coachMessages.length) {
      return coachMessages.slice(-3).map((entry) => entry.content);
    }
    return [
      'Reflect on pacing across segments and plan improvements for the next run.',
      'Review any flagged timestamps in the transcript for deeper analysis.',
    ];
  }, [summary]);

  const downloadMarkdown = () => {
    if (!summary) return;
    const blob = new Blob([buildMarkdown(summary)], { type: 'text/markdown' });
    triggerDownload(blob, `${summary.sessionId || 'session'}-summary.md`);
  };

  const downloadJson = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `${summary.sessionId || 'session'}-summary.json`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Session wrap-up</h2>
          <p className="text-gray-600 mt-1">
            {summary.status === 'completed'
              ? 'Great job! Here’s a recap of the conversation and timing insights.'
              : 'Session ended early. Review the transcript and plan your next attempt.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={downloadMarkdown}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
          >
            Download Markdown
          </button>
          <button
            type="button"
            onClick={downloadJson}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
          >
            Download JSON
          </button>
        </div>
      </div>

      {persistenceError && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 text-sm">
          {persistenceError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryStat label="Status" value={summary.status === 'completed' ? 'Completed' : 'Exited early'} />
        <SummaryStat label="Total duration" value={formatDuration(summary.totalDurationMs)} />
        <SummaryStat label="Messages" value={summary.messageCount ?? summary.chatLog?.length ?? 0} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Key takeaways</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {takeaways.map((item, index) => (
            <li key={`takeaway-${index}`}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Segment timings</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600">Segment</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600">Planned</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600">Actual</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {summary.timing?.segments?.map((segment, index) => (
                <tr key={segment.id || index}>
                  <td className="px-4 py-3 font-medium text-gray-900">{segment.name || `Segment ${index + 1}`}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDuration(segment.plannedDurationMs)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDuration(segment.elapsedMs)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                      {segment.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Transcript preview</h3>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          {summary.chatLog?.length ? (
            summary.chatLog.map((message, index) => (
              <div key={message.id || index} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-medium text-gray-700 uppercase tracking-wide">{message.role || 'participant'}</span>
                  <span>{message.timestamp ? new Date(message.timestamp).toLocaleString() : '—'}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No messages recorded for this session.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {isPersisting
            ? 'Saving transcript to your workspace…'
            : persistenceError
              ? 'Transcript could not be saved automatically. Download the summary to keep a copy.'
              : 'Transcript saved to your workspace.'}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow"
          >
            Run again
          </button>
          <button
            type="button"
            onClick={onChangeScenario}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
          >
            Change scenario
          </button>
        </div>
      </div>
    </div>
  );
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function SummaryStat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value ?? '—'}</div>
    </div>
  );
}
