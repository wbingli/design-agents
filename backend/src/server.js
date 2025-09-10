import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
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
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
// Serve static frontend so it shares origin with the API
app.use(express.static(projectRoot));

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

// Run prompt (stub)
app.post('/api/run/:name', (req, res) => {
  try {
    const name = path.basename(req.params.name);
    const filePath = path.join(promptsDir, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Prompt not found' });
    const promptText = fs.readFileSync(filePath, 'utf8');
    const parameters = req.body?.parameters ?? {};
    res.json({
      status: 'queued',
      prompt: name,
      parameters,
      preview: promptText.slice(0, 200),
      note: 'Execution stub. Integrate with your LLM job runner later.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run prompt', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


