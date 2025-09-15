const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contentDir = path.join(process.cwd(), 'content');
    
    if (!fs.existsSync(contentDir)) {
      return res.json({ companies: [] });
    }

    // Read company folders from content directory
    const companyFolders = fs.readdirSync(contentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    res.json({ companies: companyFolders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies', details: String(err) });
  }
}
