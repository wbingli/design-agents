import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

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

  // Fetch PDFs when both company and topic are selected
  const fetchPDFs = async (company, topic) => {
    try {
      setApiLoading(true);
      const response = await fetch(`http://localhost:3001/api/pdf-files?company=${encodeURIComponent(company)}&topic=${encodeURIComponent(topic)}`);
      if (response.ok) {
        const data = await response.json();
        const pdfs = data.pdfs || [];
        setPdfFiles(pdfs);
        
        // Automatically display the first PDF if available
        if (pdfs.length > 0) {
          setSelectedPDF(pdfs[0]);
          setShowPDFViewer(true);
        } else {
          setSelectedPDF(null);
          setShowPDFViewer(false);
        }
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfFiles([]);
      setSelectedPDF(null);
      setShowPDFViewer(false);
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
    if (selectedCompany && topic) {
      fetchPDFs(selectedCompany, topic);
    }
  };

  const clearSelection = () => {
    setSelectedCompany('');
    setSelectedTopic('');
    setTopics([]);
    setPdfFiles([]);
    setSelectedPDF(null);
    setShowPDFViewer(false);
  };

  const viewPDF = (pdfUrl) => {
    window.open(`http://localhost:3001${pdfUrl}`, '_blank');
  };

  const downloadPDF = (pdfUrl, filename) => {
    const link = document.createElement('a');
    link.href = `http://localhost:3001${pdfUrl}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectPDF = (pdf) => {
    setSelectedPDF(pdf);
    setShowPDFViewer(true);
  };

  const closePDFViewer = () => {
    setShowPDFViewer(false);
    setSelectedPDF(null);
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
                     <h2 className="text-lg font-semibold text-gray-800">Select Topic</h2>
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

              {/* PDF Files Display */}
              {selectedCompany && selectedTopic && pdfFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available PDFs:</h4>
                  <div className="space-y-2">
                    {pdfFiles.map((pdf, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedPDF && selectedPDF.name === pdf.name 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <span 
                          className="text-sm text-gray-600 flex-1"
                          onClick={() => selectPDF(pdf)}
                        >
                          {pdf.name}
                          {selectedPDF && selectedPDF.name === pdf.name && (
                            <span className="ml-2 text-blue-600 text-xs">(Currently viewing)</span>
                          )}
                        </span>
                        <div className="space-x-2">
                          <button
                            onClick={() => selectPDF(pdf)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            {selectedPDF && selectedPDF.name === pdf.name ? 'Viewing' : 'View'}
                          </button>
                          <button
                            onClick={() => downloadPDF(pdf.url, pdf.name)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message when no PDFs are available */}
              {selectedCompany && selectedTopic && pdfFiles.length === 0 && !apiLoading && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-700">No PDF files found for this topic.</p>
                </div>
              )}

              {/* Simple PDF Display */}
              {selectedCompany && selectedTopic && pdfFiles.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">📄 PDF Content:</h4>
                  <div className="bg-white p-3 rounded border">
                    <iframe
                      src={`http://localhost:3001${pdfFiles[0].url}`}
                      className="w-full h-96 border-0 rounded"
                      title={pdfFiles[0].name}
                    />
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => downloadPDF(pdfFiles[0].url, pdfFiles[0].name)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
                   </div>
                 </div>
               </div>
             </div>

             {/* PDF Viewer Modal */}
             {showPDFViewer && selectedPDF && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                 <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full flex flex-col">
                   {/* PDF Viewer Header */}
                   <div className="flex items-center justify-between p-4 border-b">
                     <h3 className="text-lg font-semibold text-gray-800">
                       {selectedPDF.name}
                     </h3>
                     <div className="flex items-center space-x-2">
                       <button
                         onClick={() => downloadPDF(selectedPDF.url, selectedPDF.name)}
                         className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                       >
                         Download
                       </button>
                       <button
                         onClick={closePDFViewer}
                         className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                       >
                         Close
                       </button>
                     </div>
                   </div>
                   
                   {/* PDF Content */}
                   <div className="flex-1 p-4">
                     <iframe
                       src={`http://localhost:3001${selectedPDF.url}`}
                       className="w-full h-full border-0 rounded"
                       title={selectedPDF.name}
                     />
                   </div>
                   
                   {/* PDF List Footer */}
                   {pdfFiles.length > 1 && (
                     <div className="p-4 border-t bg-gray-50">
                       <h4 className="text-sm font-medium text-gray-700 mb-2">Other PDFs:</h4>
                       <div className="flex flex-wrap gap-2">
                         {pdfFiles.map((pdf, index) => (
                           <button
                             key={index}
                             onClick={() => selectPDF(pdf)}
                             className={`px-3 py-1 text-xs rounded ${
                               selectedPDF.name === pdf.name
                                 ? 'bg-blue-600 text-white'
                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                             }`}
                           >
                             {pdf.name}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>
         </>
       );
     }
