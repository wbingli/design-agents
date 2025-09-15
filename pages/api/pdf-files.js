module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, topic } = req.query;

  if (!company || !topic) {
    return res.json({ pdfs: [] });
  }

  // For now, return static data to test deployment
  if (company === 'Meta' && topic === 'News-Feed') {
    res.json({ 
      pdfs: [{
        name: 'Design-a-News-Feed-ML-Ranking-System.pdf',
        path: 'News-Feed/Design-a-News-Feed-ML-Ranking-System.pdf',
        url: '/api/pdf-content/Meta/News-Feed/Design-a-News-Feed-ML-Ranking-System.pdf'
      }]
    });
  } else {
    res.json({ pdfs: [] });
  }
}
