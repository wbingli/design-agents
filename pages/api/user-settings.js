import prisma from '../../lib/prisma';
import { requireUser } from '../../lib/auth';
import { loadScenarioManifest } from '../../lib/scenarios';

async function validateScenarioId(scenarioId) {
  if (scenarioId === null) {
    return true;
  }
  if (typeof scenarioId !== 'string' || scenarioId.trim() === '') {
    return false;
  }
  const scenarios = await loadScenarioManifest();
  return scenarios.some((scenario) => scenario.id === scenarioId);
}

export default async function handler(req, res) {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }

  if (req.method === 'GET') {
    try {
      const settings = await prisma.userSetting.findUnique({
        where: { userId: user.id },
      });
      return res.status(200).json({ scenarioId: settings?.scenarioId ?? null });
    } catch (error) {
      console.error('Failed to load user settings', error);
      return res.status(500).json({ error: 'Failed to load user settings.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { scenarioId } = req.body ?? {};
      if (!(await validateScenarioId(scenarioId ?? null))) {
        return res.status(400).json({ error: 'Invalid scenarioId provided.' });
      }

      const updated = await prisma.userSetting.upsert({
        where: { userId: user.id },
        update: { scenarioId: scenarioId ?? null },
        create: {
          userId: user.id,
          scenarioId: scenarioId ?? null,
        },
      });

      return res.status(200).json({ scenarioId: updated.scenarioId ?? null });
    } catch (error) {
      console.error('Failed to update user settings', error);
      return res.status(500).json({ error: 'Failed to update user settings.' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed.' });
}
