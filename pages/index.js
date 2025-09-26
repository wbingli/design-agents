import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import useInterviewSession from '../hooks/useInterviewSession';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);

  // Fetch companies from API
  useEffect(() => {
  const fetchCompanies = async () => {
    try {
      setApiLoading(true);
      const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        } else {
          console.error('Failed to fetch companies:', response.status);
          setCompanies([]);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies([]);
      } finally {
        setApiLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setScenariosLoading(true);
        const response = await fetch('/api/scenarios');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        setScenarios(Array.isArray(data.scenarios) ? data.scenarios : []);
        setScenarioError(null);
      } catch (error) {
        console.error('Error fetching scenario manifest:', error);
        setScenarios([]);
        setScenarioError('Unable to load interview segments right now.');
      } finally {
        setScenariosLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // Fetch ML topics from API when company is selected
  const fetchTopics = async (company) => {
    try {
      setApiLoading(true);
      const response = await fetch(`/api/ml-topics?company=${encodeURIComponent(company)}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      } else {
        console.error('Failed to fetch topics:', response.status);
        setTopics([]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch PDFs when both company and topic are selected
  const fetchQuestion = async (company, topic) => {
    try {
      setApiLoading(true);
      const response = await fetch(`/api/pdf-files?company=${encodeURIComponent(company)}&topic=${encodeURIComponent(topic)}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question || null);
      } else {
        setQuestion(null);
      }
    } catch (error) {
      console.error('Error fetching question content:', error);
      setQuestion(null);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCompany || !selectedTopic) {
      setActiveScenario(null);
      return;
    }

    const normalizedCompany = selectedCompany.toLowerCase();
    const normalizedTopic = selectedTopic.toLowerCase();

    const match = scenarios.find((scenario) => {
      const scenarioCompany = (scenario.companyLabel || '').toLowerCase();
      const scenarioTopic = (scenario.topicLabel || '').toLowerCase();
      return scenarioCompany === normalizedCompany && scenarioTopic === normalizedTopic;
    });

    setActiveScenario(match || null);
  }, [selectedCompany, selectedTopic, scenarios]);

  const handleCompanyChange = (company) => {
    setSelectedCompany(company);
    setSelectedTopic('');
    setQuestion(null);
    if (company) {
      fetchTopics(company);
    } else {
      setTopics([]);
    }
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setQuestion(null);
    if (selectedCompany && topic) {
      fetchQuestion(selectedCompany, topic);
    }
  };

  const clearSelection = () => {
    setSelectedCompany('');
    setSelectedTopic('');
    setTopics([]);
    setQuestion(null);
  };

  const segmentNameFallbacks = useMemo(
    () => [
      'Kickoff & Clarify',
      'System Outline',
      'Deep Dive',
      'Tradeoffs & Scaling',
      'Wrap-up',
    ],
    []
  );

  const sessionSegments = useMemo(() => {
    if (!activeScenario || !Array.isArray(activeScenario.segmentDurations)) {
      return [];
    }

    return activeScenario.segmentDurations.map((duration, index) => ({
      id: `${activeScenario.id || 'segment'}-${index + 1}`,
      name:
        (Array.isArray(activeScenario.segmentNames)
          ? activeScenario.segmentNames[index]
          : null) ||
        segmentNameFallbacks[index] ||
        `Segment ${index + 1}`,
      duration: Number(duration) || 0,
    }));
  }, [activeScenario, segmentNameFallbacks]);

  const {
    segments: sessionDefinition,
    currentSegmentIndex,
    currentSegment,
    remainingSeconds: sessionRemainingSeconds,
    isActive: sessionActive,
    isPaused: sessionPaused,
    isComplete: sessionComplete,
    totalElapsedSeconds,
    totalDurationSeconds,
    segmentProgress,
    overallProgress,
    start: startSession,
    pause: pauseSession,
    resume: resumeSession,
    skip: skipSegment,
  } = useInterviewSession(sessionSegments);

  const hasNextSegment = currentSegmentIndex < sessionDefinition.length - 1;

  const formatTime = (value) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const totalSeconds = Math.max(0, Math.round(safeValue));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextSegment = hasNextSegment ? sessionDefinition[currentSegmentIndex + 1] : null;
  const segmentProgressPercent = Math.round(segmentProgress * 100);
  const overallProgressPercent = Math.round(overallProgress * 100);
  const totalRemainingSeconds = Math.max(totalDurationSeconds - totalElapsedSeconds, 0);


  return (
    <>
      <Head>
        <title>Machine Learning System Design Learning</title>
        <meta name="description" content="Select a company and topic to learn machine learning system design" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Gradient Background with Title */}
      <div 
        className="min-h-screen relative flex flex-col items-center justify-center p-6"
        style={{
          background: 'linear-gradient(to bottom, #8b5cf6, #7c3aed, #6d28d9)'
        }}
      >
             {/* Background Title */}
             <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center z-0">
               <div className="flex items-center justify-center mb-4">
                 <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                   <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                   </svg>
                 </div>
                 <h1 className="text-3xl font-bold text-white">
                   Machine Learning System Design Learning
                 </h1>
               </div>
               <p className="text-lg text-white max-w-2xl mx-auto">
                  Select a company and topic to learn machine learning system design
               </p>
        </div>

             {/* Main Content Area */}
             <div className="relative z-10 w-full max-w-4xl mt-48">
               <div className="space-y-5">
                 {/* Top Row: Company and Topic Selection */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Company Selection Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                     <h2 className="text-lg font-semibold text-gray-800">Select Company</h2>
              </div>
              <hr className="border-gray-200 mb-4" />
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
                disabled={apiLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-700"
              >
                <option value="" disabled>
                  {apiLoading ? 'Loading companies...' : 'Please select company...'}
                </option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

                 {/* Topic Selection Card */}
                 <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                     <h2 className="text-lg font-semibold text-gray-800">Select ML Topic</h2>
              </div>
              <hr className="border-gray-200 mb-4" />
              <select
                value={selectedTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={!selectedCompany || apiLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="" disabled>
                  {!selectedCompany 
                    ? 'Please select company first...' 
                    : apiLoading 
                      ? 'Loading topics...' 
                      : 'Please select topic...'
                  }
                </option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
                 </div>
                 </div>

                 {/* Bottom Row: Selected Information */}
                 <div className="flex justify-center">
                   <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Selected</h3>
                <button
                  onClick={clearSelection}
                  className="flex items-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Selection
                </button>
              </div>
              <hr className="border-gray-200 mb-3" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedCompany || 'Not selected'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Topic:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedTopic || 'Not selected'}
                  </p>
                </div>
              </div>

              {scenarioError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
                  {scenarioError}
                </div>
              )}

              {scenariosLoading && (
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 text-sm text-indigo-700 rounded-lg">
                  Preparing interview segments...
                </div>
              )}

              {activeScenario && sessionDefinition.length > 0 && (
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                          Interview Session
                        </p>
                        <h4 className="text-xl font-semibold text-indigo-900">
                          {sessionComplete
                            ? 'Session complete'
                            : sessionActive
                              ? currentSegment?.name || 'In progress'
                              : 'Ready to start'}
                        </h4>
                        <p className="text-sm text-indigo-700 mt-1">
                          {sessionComplete && 'Great work! Review the prompt or restart to practice again.'}
                          {!sessionComplete && sessionActive && !sessionPaused && `Segment ${currentSegmentIndex + 1} of ${sessionDefinition.length} · ${formatTime(sessionRemainingSeconds)} remaining`}
                          {!sessionComplete && sessionActive && sessionPaused && `Paused · ${formatTime(sessionRemainingSeconds)} remaining`}
                          {!sessionComplete && !sessionActive && `Total session time · ${formatTime(totalDurationSeconds)}`}
                        </p>
                        {nextSegment && sessionActive && !sessionComplete && (
                          <p className="text-xs text-indigo-600 mt-2">
                            Next up: {nextSegment.name} ({formatTime(nextSegment.duration)})
                          </p>
                        )}
                        {!sessionActive && !sessionComplete && (
                          <p className="text-xs text-indigo-600 mt-2">
                            Segments auto-advance as the countdown reaches zero.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {!sessionActive && !sessionComplete && (
                          <button
                            onClick={startSession}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition-colors"
                            disabled={sessionDefinition.length === 0}
                          >
                            Start Session
                          </button>
                        )}
                        {sessionActive && !sessionPaused && !sessionComplete && (
                          <button
                            onClick={pauseSession}
                            className="px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold text-sm border border-indigo-200 shadow-sm hover:bg-indigo-50 transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        {sessionActive && sessionPaused && !sessionComplete && (
                          <button
                            onClick={resumeSession}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition-colors"
                          >
                            Resume
                          </button>
                        )}
                        {sessionComplete && (
                          <button
                            onClick={startSession}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition-colors"
                          >
                            Restart Session
                          </button>
                        )}
                        {sessionActive && hasNextSegment && !sessionComplete && (
                          <button
                            onClick={skipSegment}
                            className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold text-sm border border-purple-200 hover:bg-purple-200 transition-colors"
                          >
                            Skip Segment
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                          <span>Segment Progress</span>
                          <span>{segmentProgressPercent}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, segmentProgressPercent))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-purple-600 uppercase tracking-wide">
                          <span>Overall Progress</span>
                          <span>{overallProgressPercent}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-purple-100 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, overallProgressPercent))}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-700">
                        <span className="inline-flex items-center rounded-full bg-white border border-indigo-100 px-3 py-1 font-medium">
                          Remaining · {formatTime(totalRemainingSeconds)}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white border border-indigo-100 px-3 py-1 font-medium">
                          Total · {formatTime(totalDurationSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {sessionDefinition.map((segment, index) => {
                        const isCurrent = index === currentSegmentIndex && sessionActive && !sessionComplete;
                        const isDone = index < currentSegmentIndex || sessionComplete;
                        return (
                          <div
                            key={segment.id}
                            className={`rounded-xl border p-4 transition-colors ${
                              isCurrent
                                ? 'border-indigo-400 bg-white shadow'
                                : isDone
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800">{segment.name}</p>
                              <span className="text-xs font-medium text-gray-500">{formatTime(segment.duration)}</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full ${
                                  isCurrent
                                    ? 'bg-indigo-500'
                                    : isDone
                                      ? 'bg-green-400'
                                      : 'bg-gray-300'
                                }`}
                                style={{
                                  width:
                                    isDone
                                      ? '100%'
                                      : isCurrent
                                        ? `${Math.min(100, Math.max(0, segmentProgressPercent))}%`
                                        : '0%',
                                }}
                              />
                            </div>
                            {isCurrent && sessionPaused && !sessionComplete && (
                              <p className="mt-2 text-xs text-indigo-600">Paused</p>
                            )}
                            {isDone && !isCurrent && (
                              <p className="mt-2 text-xs text-green-600">Completed</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Question Content Display */}
              {selectedCompany && selectedTopic && question && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">📘 {question.title}</h4>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6">
                    <div className="markdown-content">
                      <ReactMarkdown>{question.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message when no question is available */}
              {selectedCompany && selectedTopic && !question && !apiLoading && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">No question content found for this topic.</p>
                </div>
              )}
                   </div>
                 </div>
               </div>
             </div>

           </div>
         </>
       );
     }
