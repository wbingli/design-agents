import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, topic } = req.query;

  if (!company || !topic) {
    return res.json({ question: null });
  }

  if (company === 'Meta' && topic === 'News-Feed') {
    const markdownPath = path.join(
      process.cwd(),
      'content',
      'Meta',
      'News-Feed',
      'Design-a-News-Feed-ML-Ranking-System.md'
    );

    try {
      const content = fs.readFileSync(markdownPath, 'utf8');
      return res.json({
        question: {
          title: 'Design a News Feed ML Ranking System',
          content,
        },
      });
    } catch (error) {
      console.error('Failed to read markdown content:', error);
      return res.status(500).json({ error: 'Failed to load question content.' });
    }
  }

  return res.json({ question: null });
}
