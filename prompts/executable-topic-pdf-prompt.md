# Executable Prompt: Dynamic Topic-PDF System

## Task
Modify the application to dynamically show topics based on folder structure and display PDFs in the selected section.

## Current Structure
```
content/
├── Meta/           ← Company (from API)
│   └── News-Feed/  ← Topic (from folder)
│       └── *.pdf   ← PDFs to display
└── Google/
    └── Search-Engine/
        └── *.pdf
```

## Implementation Steps

### 1. Update Backend API (`backend/src/server.js`)

**Replace existing `/api/ml-topics` endpoint with:**
```javascript
app.get('/api/ml-topics', (req, res) => {
  try {
    const company = req.query.company;
    const companyDir = path.join(projectRoot, 'content', company);
    
    if (!fs.existsSync(companyDir)) {
      return res.json({ topics: [] });
    }
    
    const topics = fs.readdirSync(companyDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});
```

**Add new `/api/pdf-files` endpoint:**
```javascript
app.get('/api/pdf-files', (req, res) => {
  try {
    const { company, topic } = req.query;
    const topicDir = path.join(projectRoot, 'content', company, topic);
    
    if (!fs.existsSync(topicDir)) {
      return res.json({ pdfs: [] });
    }
    
    const pdfs = fs.readdirSync(topicDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        url: `/content/${company}/${topic}/${file}`
      }));
    
    res.json({ pdfs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});
```

### 2. Update Frontend (`pages/index.js`)

**Add PDF state and functions:**
```javascript
const [pdfFiles, setPdfFiles] = useState([]);

const fetchPDFs = async (company, topic) => {
  try {
    const response = await fetch(`http://localhost:3001/api/pdf-files?company=${company}&topic=${topic}`);
    const data = await response.json();
    setPdfFiles(data.pdfs || []);
  } catch (error) {
    setPdfFiles([]);
  }
};

const handleTopicChange = (topic) => {
  setSelectedTopic(topic);
  if (selectedCompany && topic) {
    fetchPDFs(selectedCompany, topic);
  }
};
```

**Add PDF display in Selected section:**
```javascript
{/* Add after Company/Topic display */}
{selectedCompany && selectedTopic && pdfFiles.length > 0 && (
  <div className="mt-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Available PDFs:</h4>
    <div className="space-y-2">
      {pdfFiles.map((pdf, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">{pdf.name}</span>
          <div className="space-x-2">
            <button
              onClick={() => window.open(`http://localhost:3001${pdf.url}`, '_blank')}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              View
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `http://localhost:3001${pdf.url}`;
                link.download = pdf.name;
                link.click();
              }}
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

### 3. Test Implementation

**Test APIs:**
```bash
# Test topics
curl "http://localhost:3001/api/ml-topics?company=Meta"

# Test PDFs  
curl "http://localhost:3001/api/pdf-files?company=Meta&topic=News-Feed"
```

**Expected Results:**
- Topics show folder names from `content/Meta/`
- PDFs show files from `content/Meta/News-Feed/`
- View/Download buttons work for each PDF

## Success Criteria
✅ Topics dynamically loaded from folder structure  
✅ PDFs displayed in selected section  
✅ View PDF opens in new tab  
✅ Download PDF saves file locally  
✅ Error handling for missing folders/files  

## Execute This Prompt
Run the implementation steps above to create a fully dynamic topic-PDF system that reads from your content folder structure.
