import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setApiLoading(true);
        const response = await fetch('http://localhost:3001/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        } else {
          // Fallback to mock data if API fails
          setCompanies(['Amazon', 'Google', 'Meta', 'Microsoft', 'Netflix']);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies(['Amazon', 'Google', 'Meta', 'Microsoft', 'Netflix']);
      } finally {
        setApiLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch ML topics from API when company is selected
  const fetchTopics = async (company) => {
    try {
      setApiLoading(true);
      const response = await fetch(`http://localhost:3001/api/ml-topics?company=${encodeURIComponent(company)}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      } else {
        // Fallback to mock data
        const mockTopics = {
          'Amazon': ['Recommendation Systems', 'AWS ML Services', 'Alexa NLP'],
          'Google': ['Search Ranking', 'YouTube Recommendations', 'Google Translate'],
          'Meta': ['News Feed Ranking', 'Instagram ML', 'Facebook Ads'],
          'Microsoft': ['Azure ML', 'Office Intelligence', 'Bing Search'],
          'Netflix': ['Content Recommendations', 'Personalization', 'Content Analysis']
        };
        setTopics(mockTopics[company] || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      const mockTopics = {
        'Amazon': ['Recommendation Systems', 'AWS ML Services', 'Alexa NLP'],
        'Google': ['Search Ranking', 'YouTube Recommendations', 'Google Translate'],
        'Meta': ['News Feed Ranking', 'Instagram ML', 'Facebook Ads'],
        'Microsoft': ['Azure ML', 'Office Intelligence', 'Bing Search'],
        'Netflix': ['Content Recommendations', 'Personalization', 'Content Analysis']
      };
      setTopics(mockTopics[company] || []);
    } finally {
      setApiLoading(false);
    }
  };

  const handleCompanyChange = (company) => {
    setSelectedCompany(company);
    setSelectedTopic('');
    if (company) {
      fetchTopics(company);
    } else {
      setTopics([]);
    }
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
  };

  const clearSelection = () => {
    setSelectedCompany('');
    setSelectedTopic('');
    setTopics([]);
  };

  const viewPDF = () => {
    if (selectedCompany && selectedTopic) {
      setLoading(true);
      // Simulate PDF loading
      setTimeout(() => {
        alert(`Viewing PDF for ${selectedCompany} - ${selectedTopic}`);
        setLoading(false);
      }, 1000);
    }
  };

  const downloadPDF = () => {
    if (selectedCompany && selectedTopic) {
      // Simulate PDF download
      alert(`Downloading PDF for ${selectedCompany} - ${selectedTopic}`);
    }
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
                   机器学习系统设计学习
                 </h1>
               </div>
          <p className="text-lg text-white max-w-2xl mx-auto">
            选择公司和主题来学习机器学习系统设计
          </p>
        </div>

             {/* Main Content Area */}
             <div className="relative z-10 w-full max-w-4xl mt-36">
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
                <h2 className="text-lg font-semibold text-gray-800">选择公司</h2>
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
                <h2 className="text-lg font-semibold text-gray-800">选择主题</h2>
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
                <h3 className="text-lg font-semibold text-gray-800">已选择</h3>
                <button
                  onClick={clearSelection}
                  className="flex items-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  清除选择
                </button>
              </div>
              <hr className="border-gray-200 mb-3" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">公司:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedCompany || 'Not selected'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">主题:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedTopic || 'Not selected'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={viewPDF}
                  disabled={!selectedCompany || !selectedTopic || loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {loading ? 'Loading...' : '查看 PDF'}
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={!selectedCompany || !selectedTopic}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  下载 PDF
                </button>
              </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </>
       );
     }