import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import ScenarioPreview from '../components/session/ScenarioPreview';
import ScenarioPicker from '../components/session/ScenarioPicker';

const SCENARIO_TEMPLATES = [
  {
    id: 'meta-news-feed',
    title: 'Meta News Feed Ranking System',
    description:
      'Design the end-to-end ranking system that powers the News Feed experience for billions of daily users while balancing engagement, well-being, and system resilience.',
    company: 'Meta',
    topic: 'News-Feed',
    difficulty: 'Intermediate',
    duration: '45 minute live interview',
    focusAreas: [
      'Signals & personalization strategy',
      'Ranking pipeline and system topology',
      'Online metrics, guardrails, and iteration loops',
    ],
    takeaways: [
      'Clarify the product objective and define north-star metrics up front.',
      'Translate product requirements into ML signals, features, and feedback loops.',
      'Outline how the ranking service scales globally and adapts to real-time events.',
    ],
  },
  {
    id: 'meta-cold-start',
    title: 'Meta Cold Start & Onboarding',
    description:
      'You are responsible for the experience of brand new users who open the app with no historical signals. Design a bootstrapping strategy that surfaces high-quality content quickly.',
    company: 'Meta',
    topic: 'News-Feed',
    difficulty: 'Advanced',
    duration: '60 minute whiteboard',
    focusAreas: [
      'User modeling without historical signals',
      'Freshness-aware ranking and exploration',
      'Success metrics for retention and trust',
    ],
    takeaways: [
      'Balance exploration and exploitation to learn user preferences safely.',
      'Integrate qualitative onboarding cues with quantitative ranking feedback.',
      'Plan measurement that isolates the impact of onboarding changes.',
    ],
  },
];

export default function Home() {
  const [stage, setStage] = useState('intro');
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIO_TEMPLATES[0].id);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [question, setQuestion] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const selectedScenario = useMemo(
    () => SCENARIO_TEMPLATES.find((scenario) => scenario.id === selectedScenarioId),
    [selectedScenarioId]
  );

  useEffect(() => {
    if (!selectedScenario?.company || !selectedScenario?.topic) {
      setQuestion(null);
      return;
    }

    let ignore = false;

    const fetchQuestion = async () => {
      try {
        setApiLoading(true);
        const response = await fetch(
          `/api/pdf-files?company=${encodeURIComponent(selectedScenario.company)}&topic=${encodeURIComponent(selectedScenario.topic)}`
        );
        if (!ignore) {
          if (response.ok) {
            const data = await response.json();
            setQuestion(data.question || null);
          } else {
            setQuestion(null);
          }
        }
      } catch (error) {
        console.error('Error fetching question content:', error);
        if (!ignore) {
          setQuestion(null);
        }
      } finally {
        if (!ignore) {
          setApiLoading(false);
        }
      }
    };

    fetchQuestion();

    return () => {
      ignore = true;
    };
  }, [selectedScenario]);

  const handleStartSession = () => {
    setStage('session');
  };

  const handleScenarioSelect = (scenario) => {
    setSelectedScenarioId(scenario.id);
    setIsPickerOpen(false);
  };

  const restartIntro = () => {
    setStage('intro');
  };

  const openSummary = () => {
    setStage('summary');
  };

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
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  Start session
                </button>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Browse scenarios
                </button>
              </div>
            </header>

            <ScenarioPreview scenario={selectedScenario} variant="hero" />
          </div>
        </section>
      )}

      {stage === 'session' && (
        <section className="min-h-screen bg-slate-950 px-6 py-16 text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row">
            <div className="lg:w-5/12 lg:max-w-sm">
              <ScenarioPreview scenario={selectedScenario} variant="panel" />
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
                      {question?.title || selectedScenario?.title}
                    </h2>
                  </div>
                  {apiLoading && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-indigo-100">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" aria-hidden />
                      Loading content…
                    </span>
                  )}
                </header>

                <div className="prose prose-invert mt-6 max-w-none text-indigo-100">
                  {question ? (
                    <ReactMarkdown>{question.content}</ReactMarkdown>
                  ) : (
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
        scenarios={SCENARIO_TEMPLATES}
        onSelect={handleScenarioSelect}
        selectedScenarioId={selectedScenarioId}
      />
    </>
  );
}
