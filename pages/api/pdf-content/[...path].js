const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;
    
    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'content', ...filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    // Check if it's a PDF file
    if (!fullPath.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'File is not a PDF' });
    }

    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Read and send the PDF file
    const fileBuffer = fs.readFileSync(fullPath);
    res.status(200).send(fileBuffer);
    
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
