import prisma from './prisma';

export async function createInterviewSession(userId, data = {}) {
  if (!userId) {
    throw new Error('userId is required to create an interview session');
  }

  const { status, metadata } = data;

  return prisma.interviewSession.create({
    data: {
      userId,
      status: status ?? 'in_progress',
      metadata: metadata ?? null,
    },
  });
}

export async function updateInterviewSession(sessionId, data = {}) {
  if (!sessionId) {
    throw new Error('sessionId is required to update an interview session');
  }

  return prisma.interviewSession.update({
    where: { id: sessionId },
    data,
  });
}

export async function completeInterviewSession({ sessionId, userId, transcript, status = 'completed' }) {
  if (!sessionId || !userId) {
    throw new Error('sessionId and userId are required to complete an interview session');
  }

  return prisma.$transaction(async (tx) => {
    const session = await tx.interviewSession.update({
      where: { id: sessionId },
      data: {
        status,
        completedAt: new Date(),
      },
    });

    if (transcript) {
      await tx.transcript.create({
        data: {
          userId,
          sessionId,
          content: transcript,
        },
      });
    }

    return session;
  });
}

export async function listInterviewSessions(userId) {
  if (!userId) {
    throw new Error('userId is required to list interview sessions');
  }

  return prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      transcripts: true,
    },
  });
}
