const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { company } = req.query;
    const contentDir = path.join(process.cwd(), 'content');

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
}
