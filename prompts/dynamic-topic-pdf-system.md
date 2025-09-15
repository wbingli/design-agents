# Dynamic Topic-PDF System Implementation

## Objective
Implement a dynamic topic selection system that reads from the content folder structure and displays PDFs in the selected section.

## Current Folder Structure
```
content/
├── Meta/
│   └── News-Feed/
│       └── placeholder.pdf
├── Google/
│   └── Search-Engine/
│       └── placeholder.pdf
└── [other companies]/
    └── [topics]/
        └── [pdf files]
```

## Requirements

### 1. Dynamic Topic API Enhancement
**File**: `backend/src/server.js`

**Current API**: `/api/ml-topics?company=Meta`
**Enhancement**: Modify to read from actual folder structure

**Implementation**:
```javascript
// Enhanced ML Topics API endpoint
app.get('/api/ml-topics', (req, res) => {
  try {
    const company = req.query.company;
    const contentDir = path.join(projectRoot, 'content');
    
    if (!company) {
      return res.json({ topics: [] });
    }
    
    const companyDir = path.join(contentDir, company);
    
    if (!fs.existsSync(companyDir)) {
      return res.json({ topics: [] });
    }
    
    // Read topic folders from company directory
    const topicFolders = fs.readdirSync(companyDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    res.json({ topics: topicFolders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics', details: String(err) });
  }
});
```

### 2. PDF Discovery API
**New Endpoint**: `/api/pdf-files?company=Meta&topic=News-Feed`

**Implementation**:
```javascript
// PDF Files API endpoint
app.get('/api/pdf-files', (req, res) => {
  try {
    const { company, topic } = req.query;
    const topicDir = path.join(projectRoot, 'content', company, topic);
    
    if (!fs.existsSync(topicDir)) {
      return res.json({ pdfs: [] });
    }
    
    // Find all PDF files in topic directory
    const pdfFiles = fs.readdirSync(topicDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: path.join(topic, file),
        url: `/content/${company}/${topic}/${file}`
      }));
    
    res.json({ pdfs: pdfFiles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PDFs', details: String(err) });
  }
});
```

### 3. Frontend Integration
**File**: `pages/index.js`

**Modifications**:
1. Update `fetchTopics()` to use enhanced API
2. Add `fetchPDFs()` function
3. Update "Selected" section to display PDFs
4. Add PDF viewing/downloading functionality

**Implementation**:
```javascript
// Fetch PDFs when both company and topic are selected
const fetchPDFs = async (company, topic) => {
  try {
    setApiLoading(true);
    const response = await fetch(`http://localhost:3001/api/pdf-files?company=${encodeURIComponent(company)}&topic=${encodeURIComponent(topic)}`);
    if (response.ok) {
      const data = await response.json();
      setPdfFiles(data.pdfs || []);
    }
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    setPdfFiles([]);
  } finally {
    setApiLoading(false);
  }
};

// Update handleTopicChange to fetch PDFs
const handleTopicChange = (topic) => {
  setSelectedTopic(topic);
  if (selectedCompany && topic) {
    fetchPDFs(selectedCompany, topic);
  }
};
```

### 4. PDF Display Component
**In Selected Section**:
```javascript
{/* PDF Files Display */}
{selectedCompany && selectedTopic && pdfFiles.length > 0 && (
  <div className="mt-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Available PDFs:</h4>
    <div className="space-y-2">
      {pdfFiles.map((pdf, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">{pdf.name}</span>
          <div className="space-x-2">
            <button
              onClick={() => viewPDF(pdf.url)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              View
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
```

### 5. PDF Viewing Functions
```javascript
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
```

### 6. State Management Updates
```javascript
// Add new state variables
const [pdfFiles, setPdfFiles] = useState([]);

// Update useEffect to fetch PDFs when both selections are made
useEffect(() => {
  if (selectedCompany && selectedTopic) {
    fetchPDFs(selectedCompany, selectedTopic);
  }
}, [selectedCompany, selectedTopic]);
```

## Implementation Steps

### Step 1: Backend API Enhancement
1. Modify `/api/ml-topics` to read from folder structure
2. Add new `/api/pdf-files` endpoint
3. Test APIs with curl commands

### Step 2: Frontend Integration
1. Add `fetchPDFs()` function
2. Update `handleTopicChange()` to fetch PDFs
3. Add PDF display component
4. Implement PDF viewing/downloading

### Step 3: Testing
1. Test topic selection with real folder structure
2. Test PDF discovery and display
3. Test PDF viewing and downloading
4. Verify error handling

### Step 4: Content Structure Validation
1. Ensure all company folders exist in `content/`
2. Ensure topic folders exist under each company
3. Ensure PDF files exist in each topic folder
4. Test with multiple companies and topics

## Expected Behavior

1. **Company Selection**: Shows companies from folder names in `content/`
2. **Topic Selection**: Shows topics from folder names under selected company
3. **PDF Display**: Shows available PDFs in selected topic folder
4. **PDF Actions**: View and download PDFs directly from the interface

## Error Handling

- Handle missing company folders gracefully
- Handle missing topic folders gracefully  
- Handle missing PDF files gracefully
- Provide user feedback for all error states
- Fallback to empty arrays for missing data

## Testing Commands

```bash
# Test topic API
curl "http://localhost:3001/api/ml-topics?company=Meta"

# Test PDF API
curl "http://localhost:3001/api/pdf-files?company=Meta&topic=News-Feed"

# Test frontend
curl -s http://localhost:3000 | grep -q "Available PDFs"
```

This implementation will create a fully dynamic system that reads from your actual content folder structure and displays PDFs accordingly.
