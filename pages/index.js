import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [manifestDefaultScenarioId, setManifestDefaultScenarioId] = useState('');
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setScenarioLoading(true);
        const response = await fetch('/api/scenarios');
        if (!response.ok) {
          throw new Error('Failed to load scenarios');
        }
        const data = await response.json();
        const scenarioList = data.scenarios || [];
        setScenarios(scenarioList);

        let defaultScenarioId = '';
        if (data?.defaultScenario?.id) {
          defaultScenarioId = data.defaultScenario.id;
        } else if (scenarioList.length > 0) {
          const flaggedDefault = scenarioList.find((scenario) => scenario.default);
          defaultScenarioId = flaggedDefault?.id ?? scenarioList[0].id;
        }

        setManifestDefaultScenarioId(defaultScenarioId);

        let initialScenarioId = defaultScenarioId;

        try {
          const settingsResponse = await fetch('/api/user-settings', {
            credentials: 'include',
          });
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            if (settingsData?.scenarioId) {
              initialScenarioId = settingsData.scenarioId;
            } else if (settingsData?.scenarioId === null) {
              initialScenarioId = defaultScenarioId;
            }
          }
        } catch (settingsError) {
          console.warn('Unable to load user settings', settingsError);
        }

        if (initialScenarioId && !scenarioList.some((scenario) => scenario.id === initialScenarioId)) {
          initialScenarioId = defaultScenarioId;
        }

        setSelectedScenarioId(initialScenarioId || '');
      } catch (error) {
        console.error('Failed to load scenarios', error);
      } finally {
        setScenarioLoading(false);
      }
    };

    loadScenarios();
  }, []);

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

  // Fetch ML topics from API when company is selected
  const fetchTopics = useCallback(async (company) => {
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
  }, []);

  // Fetch PDFs when both company and topic are selected
  const fetchQuestion = useCallback(async (company, topic) => {
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
  }, []);

  useEffect(() => {
    const activeScenarioId = selectedScenarioId || manifestDefaultScenarioId;
    if (!activeScenarioId) {
      setSelectedCompany('');
      setSelectedTopic('');
      setTopics([]);
      setQuestion(null);
      return;
    }

    const scenario = scenarios.find((item) => item.id === activeScenarioId);
    if (!scenario) {
      return;
    }

    const applyScenarioSelection = async () => {
      if (!scenario.companyLabel) {
        return;
      }
      setSelectedCompany(scenario.companyLabel);
      setSelectedTopic('');
      setQuestion(null);
      await fetchTopics(scenario.companyLabel);
      if (scenario.topicLabel) {
        setSelectedTopic(scenario.topicLabel);
        await fetchQuestion(scenario.companyLabel, scenario.topicLabel);
      }
    };

    applyScenarioSelection();
  }, [selectedScenarioId, manifestDefaultScenarioId, scenarios, fetchTopics, fetchQuestion]);

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

  const handleScenarioChange = (scenarioId) => {
    if (!scenarioId) {
      if (manifestDefaultScenarioId) {
        setSelectedScenarioId(manifestDefaultScenarioId);
      } else {
        setSelectedScenarioId('');
        clearSelection();
      }
      return;
    }
    setSelectedScenarioId(scenarioId);
  };

  const clearSelection = () => {
    setSelectedCompany('');
    setSelectedTopic('');
    setTopics([]);
    setQuestion(null);
  };


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
                <div className="bg-white rounded-2xl shadow-lg p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0-6C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Mock Interview Scenario</h2>
                  </div>
                  <hr className="border-gray-200 mb-4" />
                  <p className="text-sm text-gray-600 mb-3">
                    We’ll use this scenario to pre-select the company and topic for your practice session. Update your default in the settings page.
                  </p>
                  <select
                    value={selectedScenarioId || ''}
                    onChange={(event) => handleScenarioChange(event.target.value)}
                    disabled={scenarioLoading || scenarios.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {scenarioLoading ? (
                      <option value="">Loading scenarios…</option>
                    ) : scenarios.length === 0 ? (
                      <option value="">No scenarios available</option>
                    ) : (
                      scenarios.map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.companyLabel ? `${scenario.companyLabel} – ${scenario.topicLabel}` : scenario.topicLabel || scenario.id}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-3">
                    Looking for a different default? Visit the{' '}
                    <Link href="/settings" className="text-purple-600 hover:text-purple-500 font-medium">
                      settings page
                    </Link>{' '}
                    to save your preference.
                  </p>
                </div>
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
