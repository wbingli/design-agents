import fs from 'fs/promises';
import path from 'path';

const transcriptsDir = path.join(process.cwd(), 'content', 'transcripts');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Missing authentication context.' });
  }

  try {
    await ensureDir(transcriptsDir);
  } catch (error) {
    console.error('Failed to ensure transcripts directory:', error);
    return res.status(500).json({ error: 'Unable to initialize transcript storage.' });
  }

  const userFile = path.join(transcriptsDir, `${userId}.json`);

  if (req.method === 'GET') {
    try {
      const data = (await readJsonSafe(userFile)) || { sessions: {} };
      data.sessionIds = Object.keys(data.sessions || {});
      return res.status(200).json(data);
    } catch (error) {
      console.error(`Failed to read transcripts for user ${userId}:`, error);
      return res.status(500).json({ error: 'Failed to read transcripts.' });
    }
  }

  if (req.method === 'POST') {
    const { sessionId, summary } = req.body ?? {};
    if (!sessionId || !summary) {
      return res.status(400).json({ error: 'sessionId and summary are required.' });
    }

    try {
      const existing = (await readJsonSafe(userFile)) || { sessions: {} };
      const timestamp = new Date().toISOString();
      const entry = {
        sessionId,
        updatedAt: timestamp,
        summary,
      };
      existing.sessions[sessionId] = entry;
      existing.lastUpdated = timestamp;
      await writeJson(userFile, existing);
      return res.status(200).json({ ok: true, session: entry });
    } catch (error) {
      console.error(`Failed to persist transcript for user ${userId}:`, error);
      return res.status(500).json({ error: 'Failed to persist transcript.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
