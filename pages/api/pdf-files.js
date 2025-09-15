const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { company, topic } = req.query;
    const topicDir = path.join(process.cwd(), 'content', company, topic);

    if (!fs.existsSync(topicDir)) {
      return res.json({ pdfs: [] });
    }

    // Find all PDF files in topic directory
    const pdfFiles = fs.readdirSync(topicDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: path.join(topic, file),
        url: `/api/pdf-content/${company}/${topic}/${file}`
      }));

    res.json({ pdfs: pdfFiles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PDFs', details: String(err) });
  }
}
