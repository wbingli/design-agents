import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import {
  completeInterviewSession,
  createInterviewSession,
  listInterviewSessions,
  updateInterviewSession,
} from '../../lib/interviewSessions';

function parseTranscript(transcript) {
  if (!transcript) {
    return null;
  }

  if (typeof transcript === 'string') {
    try {
      return JSON.parse(transcript);
    } catch (error) {
      console.warn('Failed to parse transcript string, storing as raw text');
      return transcript;
    }
  }

  return transcript;
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    if (req.method === 'GET') {
      const sessions = await listInterviewSessions(userId);
      return res.status(200).json({ sessions });
    }

    if (req.method === 'POST') {
      const { status, metadata } = req.body ?? {};
      const createdSession = await createInterviewSession(userId, { status, metadata });
      return res.status(201).json({ session: createdSession });
    }

    if (req.method === 'PATCH') {
      const { sessionId, status, metadata, completedAt } = req.body ?? {};

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const data = {};

      if (typeof status === 'string') {
        data.status = status;
      }

      if (metadata !== undefined) {
        data.metadata = metadata;
      }

      if (completedAt) {
        data.completedAt = new Date(completedAt);
      }

      const updatedSession = await updateInterviewSession(sessionId, data);
      return res.status(200).json({ session: updatedSession });
    }

    if (req.method === 'PUT') {
      const { sessionId, transcript, status } = req.body ?? {};

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const completedSession = await completeInterviewSession({
        sessionId,
        userId,
        transcript: parseTranscript(transcript),
        status: status ?? 'completed',
      });

      return res.status(200).json({ session: completedSession });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Interview session handler error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
