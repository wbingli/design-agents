import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import SummaryScreen from '../../components/session/SummaryScreen';
import { SessionController } from '../../lib/session/controller';

const SEGMENT_LABELS = [
  'Warm-up & Goals',
  'System Design Planning',
  'Deep Dive & Data Flows',
  'Trade-offs & Scaling',
  'Wrap-up & Coaching',
];

export default function SessionRunnerPage() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | idle | running | summary
  const [currentSegment, setCurrentSegment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [isPersisting, setIsPersisting] = useState(false);
  const controllerRef = useRef(null);
  const [user] = useState({ id: 'demo-user', name: 'Demo Candidate' });

  useEffect(() => {
    let isMounted = true;
    const loadScenarios = async () => {
      try {
        setStatus('loading');
        const response = await fetch('/api/scenarios');
        if (!response.ok) {
          throw new Error('Failed to load scenarios.');
        }
        const data = await response.json();
        if (!isMounted) return;
        setScenarios(data.scenarios || []);
        setActiveScenario(data.defaultScenario || data.scenarios?.[0] || null);
        setStatus('idle');
      } catch (err) {
        console.error('Failed to fetch scenarios', err);
        if (isMounted) {
          setError('Unable to load scenarios. Please try again later.');
          setStatus('idle');
        }
      }
    };
    loadScenarios();
    return () => {
      isMounted = false;
      controllerRef.current?.removeAllListeners();
      controllerRef.current = null;
    };
  }, []);

  const segments = useMemo(() => {
    if (!activeScenario?.segmentDurations?.length) return [];
    return activeScenario.segmentDurations.map((durationSeconds, index) => ({
      id: `${activeScenario.id}-segment-${index + 1}`,
      name: SEGMENT_LABELS[index] || `Segment ${index + 1}`,
      durationSeconds,
    }));
  }, [activeScenario]);

  const startSession = () => {
    if (!activeScenario) return;
    controllerRef.current?.removeAllListeners();

    const controller = new SessionController({
      sessionId: `${activeScenario.id}-${Date.now()}`,
      scenarioId: activeScenario.id,
      segments,
      metadata: {
        scenarioLabel: `${activeScenario.companyLabel ?? ''} ${activeScenario.topicLabel ?? ''}`.trim(),
      },
    });

    controller.on('segment:start', ({ segment }) => {
      setCurrentSegment(segment);
    });

    controller.on('segment:end', ({ segment }) => {
      setCurrentSegment((current) => (current?.id === segment.id ? null : current));
    });

    controller.on('chat:message', ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    controller.on('summary', (payload) => {
      setSummary(payload);
      setStatus('summary');
      persistSummary(payload);
    });

    controller.begin();
    controller.advance();

    controllerRef.current = controller;
    setMessages([]);
    setDraftMessage('');
    setSummary(null);
    setStatus('running');
    setError(null);
  };

  const persistSummary = async (payload) => {
    try {
      setIsPersisting(true);
      const response = await fetch('/api/persistence/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ sessionId: payload.sessionId, summary: payload }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to persist transcript');
      }
      await response.json();
      setError(null);
    } catch (err) {
      console.error('Failed to persist session summary', err);
      setError(err.message || 'Unable to save transcript.');
    } finally {
      setIsPersisting(false);
    }
  };

  const addMessage = (role) => {
    const controller = controllerRef.current;
    if (!controller || !draftMessage.trim()) return;
    controller.recordMessage({ role, content: draftMessage.trim() });
    setDraftMessage('');
  };

  const handleCompleteSegment = () => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.completeCurrentSegment();
  };

  const handleExitEarly = () => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.exitEarly('candidate-ended');
  };

  const resetSession = () => {
    controllerRef.current?.reset();
    controllerRef.current?.removeAllListeners();
    controllerRef.current = null;
    setStatus('idle');
    setSummary(null);
    setMessages([]);
    setCurrentSegment(null);
    setDraftMessage('');
    setError(null);
  };

  const changeScenario = (scenarioId) => {
    const scenario = scenarios.find((item) => item.id === scenarioId) || null;
    setActiveScenario(scenario);
    resetSession();
  };

  const showSummary = status === 'summary' && summary;

  return (
    <>
      <Head>
        <title>Session Runner</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-white py-10">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          <header className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">Interview session</p>
            <h1 className="text-3xl font-bold text-gray-900">Run a mock ML system design interview</h1>
            <p className="text-gray-600 max-w-2xl">
              Progress through the timed segments, capture highlights, and review the transcript once you wrap up. You can restart
              the session or switch scenarios at any time.
            </p>
          </header>

          {error && status !== 'summary' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
          )}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Scenario</h2>
                <p className="text-gray-600 text-sm">Choose a scenario to tailor prompts and coaching.</p>
              </div>
              <select
                value={activeScenario?.id || ''}
                onChange={(event) => changeScenario(event.target.value)}
                className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={status === 'loading'}
              >
                <option value="" disabled>
                  {status === 'loading' ? 'Loading scenarios…' : 'Select scenario'}
                </option>
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.companyLabel} · {scenario.topicLabel}
                  </option>
                ))}
              </select>
            </div>

            {segments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className={`rounded-xl border p-4 ${
                      currentSegment?.id === segment.id
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-500">Segment {index + 1}</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">{segment.name}</div>
                    <div className="mt-2 text-sm text-gray-600">Planned duration: {Math.round(segment.durationSeconds / 60)} min</div>
                    {currentSegment?.id === segment.id && (
                      <div className="mt-3 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        In progress
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startSession}
                disabled={!activeScenario || status === 'running'}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold shadow hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                {status === 'running' ? 'Session in progress' : 'Start session'}
              </button>
              <button
                type="button"
                onClick={handleCompleteSegment}
                disabled={status !== 'running'}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                Complete segment
              </button>
              <button
                type="button"
                onClick={handleExitEarly}
                disabled={status !== 'running'}
                className="px-4 py-2 rounded-lg border border-red-300 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed"
              >
                Exit early
              </button>
              <button
                type="button"
                onClick={resetSession}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </section>

          {status === 'running' && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Transcript capture</h2>
                  <p className="text-gray-600 text-sm">Log interviewer or candidate notes as you progress.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addMessage('candidate')}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                  >
                    Add candidate note
                  </button>
                  <button
                    type="button"
                    onClick={() => addMessage('coach')}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add coach note
                  </button>
                </div>
              </div>

              <textarea
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                rows={4}
                placeholder="Capture highlights, follow-up prompts, or coaching feedback…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                    No transcript entries yet. Add candidate or coach notes to build your session log.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="uppercase tracking-wide font-semibold text-gray-600">{message.role}</span>
                        <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '—'}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {showSummary && (
            <SummaryScreen
              summary={summary}
              onRestart={() => {
                resetSession();
                startSession();
              }}
              onChangeScenario={() => {
                resetSession();
              }}
              isPersisting={isPersisting}
              persistenceError={error && status === 'summary' ? error : null}
            />
          )}
        </div>
      </main>
    </>
  );
}
