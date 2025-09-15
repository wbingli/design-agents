const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;
    const fullPath = path.join(process.cwd(), 'content', ...filePath);

    // Security check - ensure the file is within the content directory
    const contentDir = path.join(process.cwd(), 'content');
    const resolvedPath = path.resolve(fullPath);
    const resolvedContentDir = path.resolve(contentDir);
    
    if (!resolvedPath.startsWith(resolvedContentDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to serve PDF', details: String(err) });
  }
}
