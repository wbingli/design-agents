export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, return static data to test deployment
  res.json({ companies: ['Meta'] });
}
