export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, return a placeholder response to test deployment
  res.status(200).json({ 
    message: 'PDF content API is working',
    note: 'PDF serving will be implemented after successful deployment'
  });
}
