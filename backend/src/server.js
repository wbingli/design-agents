import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const publicDir = path.join(projectRoot, 'public');
const promptsDir = path.join(projectRoot, 'prompts');
const contentDir = path.join(projectRoot, 'content');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow all origins, including file:// (null origin)
const corsOptions = {
  origin: function(origin, callback) {
    return callback(null, true);
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
// Serve static files from public directory
app.use(express.static(publicDir));

// Serve static files from content directory
app.use('/content', express.static(contentDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Companies/topics listing from content directory
app.get('/api/companies', (req, res) => {
  try {
    if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
    const companies = fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    res.json({ companies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list companies', details: String(err) });
  }
});

app.get('/api/companies/:company/topics', (req, res) => {
  try {
    const company = path.basename(req.params.company);
    const companyDir = path.join(contentDir, company);
    if (!fs.existsSync(companyDir)) return res.json({ topics: [] });
    const topics = fs
      .readdirSync(companyDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list topics', details: String(err) });
  }
});

// Enhanced ML Topics API endpoint - reads from folder structure
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

// PDF Files API endpoint - discovers PDFs in topic folders
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

// Stream PDF under company/topic folder; assume a single PDF per topic folder
app.get('/api/companies/:company/topics/:topic/pdf', (req, res) => {
  try {
    const company = path.basename(req.params.company);
    const topic = path.basename(req.params.topic);
    const topicDir = path.join(contentDir, company, topic);
    if (!fs.existsSync(topicDir)) return res.status(404).json({ error: 'Topic not found' });
    const files = fs.readdirSync(topicDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    if (files.length === 0) return res.status(404).json({ error: 'No PDF found in topic' });
    const pdfPath = path.join(topicDir, files[0]);
    res.setHeader('Content-Type', 'application/pdf');
    fs.createReadStream(pdfPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to stream PDF', details: String(err) });
  }
});

// List prompts
app.get('/api/prompts', (req, res) => {
  try {
    if (!fs.existsSync(promptsDir)) fs.mkdirSync(promptsDir, { recursive: true });
    const files = fs
      .readdirSync(promptsDir)
      .filter((f) => f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.txt'));
    res.json({ items: files.map((name) => ({ name })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list prompts', details: String(err) });
  }
});

// Get prompt content
app.get('/api/prompts/:name', (req, res) => {
  try {
    const name = req.params.name;
    const safeName = path.basename(name);
    const filePath = path.join(promptsDir, safeName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const content = fs.readFileSync(filePath, 'utf8');
    res.type('text/plain').send(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read prompt', details: String(err) });
  }
});

// Create or update prompt
app.post('/api/prompts/:name', (req, res) => {
  try {
    const name = req.params.name;
    const safeName = path.basename(name);
    if (!/\.(md|txt|json)$/.test(safeName)) {
      return res.status(400).json({ error: 'File must end with .md, .txt, or .json' });
    }
    if (!fs.existsSync(promptsDir)) fs.mkdirSync(promptsDir, { recursive: true });
    const filePath = path.join(promptsDir, safeName);
    const content = typeof req.body === 'string' ? req.body : req.body?.content ?? '';
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ ok: true, name: safeName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write prompt', details: String(err) });
  }
});

// Run prompt (stub with file saving)
app.post('/api/run/:name', (req, res) => {
  try {
    const name = path.basename(req.params.name);
    const filePath = path.join(promptsDir, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Prompt not found' });
    const promptText = fs.readFileSync(filePath, 'utf8');
    const parameters = req.body?.parameters ?? {};
    
    // For now, create a sample output file based on the prompt
    if (name === 'generate-companies-ml-topics.md') {
      const sampleOutput = [
        {
          "company_name": "Google",
          "ml_topic": "Search Ranking",
          "product_description": "Google Search uses ML ranking algorithms to order search results by relevance. ML engineers work on query understanding, page quality scoring, and personalization to improve search experience for billions of users."
        },
        {
          "company_name": "Google",
          "ml_topic": "Computer Vision",
          "product_description": "Google Photos uses computer vision for automatic photo organization, face recognition, and object detection. ML engineers develop image classification models and object detection systems for smart photo management."
        },
        {
          "company_name": "Google",
          "ml_topic": "Natural Language Processing",
          "product_description": "Google Translate uses NLP for real-time language translation. ML engineers work on neural machine translation, language detection, and context-aware translation models."
        },
        {
          "company_name": "Meta",
          "ml_topic": "News Feed Ranking",
          "product_description": "Facebook News Feed uses ML to personalize content ranking. ML engineers develop algorithms for content scoring, user engagement prediction, and feed optimization for billions of users."
        },
        {
          "company_name": "Meta",
          "ml_topic": "Computer Vision",
          "product_description": "Instagram uses computer vision for content moderation, image recognition, and AR filters. ML engineers work on object detection, face recognition, and real-time image processing."
        },
        {
          "company_name": "Amazon",
          "ml_topic": "Recommendation Systems",
          "product_description": "Amazon's product recommendation engine drives 35% of revenue. ML engineers develop collaborative filtering, content-based filtering, and deep learning models for personalized product suggestions."
        },
        {
          "company_name": "Amazon",
          "ml_topic": "Computer Vision",
          "product_description": "Amazon Go uses computer vision for cashier-less shopping. ML engineers work on object detection, tracking, and recognition systems for automated checkout."
        },
        {
          "company_name": "Netflix",
          "ml_topic": "Recommendation Systems",
          "product_description": "Netflix's recommendation engine personalizes content discovery. ML engineers develop collaborative filtering, content-based filtering, and deep learning models to improve user engagement and retention."
        },
        {
          "company_name": "Uber",
          "ml_topic": "Ride Matching",
          "product_description": "Uber's ride matching system connects riders with drivers in real-time. ML engineers work on geospatial algorithms, demand prediction, and optimization models for efficient matching."
        },
        {
          "company_name": "Tesla",
          "ml_topic": "Autonomous Driving",
          "product_description": "Tesla's Autopilot uses computer vision and deep learning for autonomous driving. ML engineers develop neural networks for object detection, path planning, and decision-making systems."
        }
      ];
      
      const outputFile = parameters.output_file || 'content/companies-ml-topics.json';
      const outputPath = path.join(projectRoot, outputFile);
      fs.writeFileSync(outputPath, JSON.stringify(sampleOutput, null, 2), 'utf8');
    }
    
    res.json({
      status: 'completed',
      prompt: name,
      parameters,
      preview: promptText.slice(0, 200),
      output_file: parameters.output_file || 'content/companies-ml-topics.json',
      note: 'Sample output generated. Integrate with your LLM job runner for real generation.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run prompt', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


