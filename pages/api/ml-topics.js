 export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company } = req.query;

  if (!company) {
    return res.json({ topics: [] });
  }

  // For now, return static data to test deployment
  if (company === 'Meta') {
    res.json({ topics: ['News-Feed'] });
  } else {
    res.json({ topics: [] });
  }
}
