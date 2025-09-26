import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import ScenarioPreview from '../components/session/ScenarioPreview';
import ScenarioPicker from '../components/session/ScenarioPicker';

export default function Home() {
  const [stage, setStage] = useState('intro');
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [scenarioDetails, setScenarioDetails] = useState(null);
  const [manifestError, setManifestError] = useState(null);
  const [promptError, setPromptError] = useState(null);
  const [isManifestLoading, setIsManifestLoading] = useState(true);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [manifestRequestId, setManifestRequestId] = useState(0);
  const [promptRequestId, setPromptRequestId] = useState(0);

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) || null,
    [scenarios, selectedScenarioId]
  );

  useEffect(() => {
    let ignore = false;

    const fetchManifest = async () => {
      try {
        setIsManifestLoading(true);
        setManifestError(null);

        const response = await fetch('/api/scenarios');
        if (!response.ok) {
          throw new Error(`Failed to load scenarios: ${response.status}`);
        }

        const data = await response.json();
        if (ignore) {
          return;
        }

        const manifestList = Array.isArray(data.scenarios) ? data.scenarios : [];
        setScenarios(manifestList);

        const defaultId =
          data.defaultScenario?.id ||
          manifestList.find((item) => item.default)?.id ||
          manifestList[0]?.id ||
          null;
        setSelectedScenarioId((prev) => prev || defaultId);
      } catch (error) {
        console.error('Error loading scenario manifest:', error);
        if (!ignore) {
          setManifestError('Unable to load scenarios. Please try again.');
          setScenarios([]);
          setSelectedScenarioId(null);
        }
      } finally {
        if (!ignore) {
          setIsManifestLoading(false);
        }
      }
    };

    fetchManifest();

    return () => {
      ignore = true;
    };
  }, [manifestRequestId]);

  useEffect(() => {
    if (!selectedScenarioId) {
      setScenarioDetails(null);
      return;
    }

    let ignore = false;

    const fetchScenario = async () => {
      try {
        setIsPromptLoading(true);
        setPromptError(null);
        setScenarioDetails((previous) =>
          previous?.id === selectedScenarioId ? previous : null
        );

        const response = await fetch(`/api/scenarios/${selectedScenarioId}`);
        if (!response.ok) {
          throw new Error(`Failed to load scenario ${selectedScenarioId}: ${response.status}`);
        }

        const data = await response.json();
        if (!ignore) {
          setScenarioDetails(data);
        }
      } catch (error) {
        console.error(`Error fetching scenario ${selectedScenarioId}:`, error);
        if (!ignore) {
          setScenarioDetails(null);
          setPromptError('Unable to load scenario prompt. Please try again.');
        }
      } finally {
        if (!ignore) {
          setIsPromptLoading(false);
        }
      }
    };

    fetchScenario();

    return () => {
      ignore = true;
    };
  }, [selectedScenarioId, promptRequestId]);

  const handleStartSession = () => {
    if (!selectedScenarioId) {
      return;
    }
    setStage('session');
  };

  const handleScenarioSelect = (scenario) => {
    if (!scenario?.id) {
      return;
    }
    setSelectedScenarioId(scenario.id);
    setIsPickerOpen(false);
  };

  const restartIntro = () => {
    setStage('intro');
  };

  const openSummary = () => {
    setStage('summary');
  };

  const handleRetryManifest = () => {
    setManifestRequestId((id) => id + 1);
  };

  const handleRetryPrompt = () => {
    setPromptRequestId((id) => id + 1);
  };

  const previewScenario = scenarioDetails || selectedScenario;
  const promptMarkdown = scenarioDetails?.prompt || '';

  return (
    <>
      <Head>
        <title>Machine Learning System Design Learning</title>
        <meta
          name="description"
          content="Interactive interview prep with curated ML system design scenarios"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {stage === 'intro' && (
        <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-950 to-slate-900 px-6 py-16 text-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
            <header className="space-y-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wide text-indigo-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                Guided session
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Master ML system design with interview-grade scenarios
              </h1>
              <p className="max-w-2xl text-lg text-indigo-100">
                Preview the experience, pick the scenario that matches your next interview, and step into a structured practice session with real questions used by leading teams.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleStartSession}
                  disabled={!selectedScenarioId || isManifestLoading}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-50 ${
                    !selectedScenarioId || isManifestLoading
                      ? 'cursor-not-allowed bg-white/40 text-slate-600'
                      : 'bg-white text-slate-900'
                  }`}
                >
                  Start session
                </button>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
                  disabled={isManifestLoading}
                >
                  Browse scenarios
                </button>
              </div>
              {isManifestLoading && (
                <p className="text-sm text-indigo-200/80">Loading scenarios…</p>
              )}
              {manifestError && (
                <div className="rounded-2xl border border-red-200/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  <p>{manifestError}</p>
                  <button
                    type="button"
                    onClick={handleRetryManifest}
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-red-200/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-100 transition hover:border-red-100 hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              )}
            </header>

            <ScenarioPreview scenario={previewScenario} variant="hero" />
          </div>
        </section>
      )}

      {stage === 'session' && (
        <section className="min-h-screen bg-slate-950 px-6 py-16 text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row">
            <div className="lg:w-5/12 lg:max-w-sm">
              <ScenarioPreview scenario={previewScenario} variant="panel" />
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border border-indigo-400/40 px-5 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-white"
                >
                  Change scenario
                </button>
                <button
                  type="button"
                  onClick={openSummary}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-white hover:text-white"
                >
                  View session summary
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur">
                <header className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-indigo-200">Session prompt</p>
                    <h2 className="text-2xl font-semibold text-white">
                      {scenarioDetails?.title || selectedScenario?.title || 'Select a scenario'}
                    </h2>
                  </div>
                  {isPromptLoading && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-indigo-100">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" aria-hidden />
                      Loading content…
                    </span>
                  )}
                </header>

                <div className="prose prose-invert mt-6 max-w-none text-indigo-100">
                  {promptError && (
                    <div className="rounded-2xl border border-red-200/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      <p>{promptError}</p>
                      <button
                        type="button"
                        onClick={handleRetryPrompt}
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-red-200/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-100 transition hover:border-red-100 hover:text-white"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!promptError && promptMarkdown && <ReactMarkdown>{promptMarkdown}</ReactMarkdown>}

                  {!promptError && !promptMarkdown && !isPromptLoading && (
                    <p className="text-base leading-relaxed text-indigo-100/80">
                      We are generating a detailed prompt and walkthrough for this scenario. Use the overview on the left to structure your discussion, or pick another scenario to explore a different challenge.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {stage === 'summary' && (
        <section className="min-h-screen bg-slate-950 px-6 py-24 text-white">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <h2 className="text-4xl font-semibold">Session summary</h2>
            <p className="mt-4 max-w-2xl text-lg text-indigo-100">
              We&apos;re building a reflective summary that captures your decisions, trade-offs, and follow-up actions. For now, you can jump back into the session or explore a new scenario.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => setStage('session')}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                Return to session
              </button>
              <button
                type="button"
                onClick={restartIntro}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Choose another scenario
              </button>
            </div>
          </div>
        </section>
      )}

      <ScenarioPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        scenarios={scenarios}
        onSelect={handleScenarioSelect}
        selectedScenarioId={selectedScenarioId}
      />
    </>
  );
}
