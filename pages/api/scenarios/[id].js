import fs from 'fs/promises';
import path from 'path';
import { findScenarioById } from '../../../../lib/scenarios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const scenarioId = Array.isArray(id) ? id[0] : id;

  if (!scenarioId) {
    return res.status(400).json({ error: 'Scenario id is required.' });
  }

  try {
    const scenario = await findScenarioById(scenarioId);

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found.' });
    }

    if (!scenario.promptPath) {
      return res.status(500).json({ error: 'Scenario prompt path is missing.' });
    }

    const promptPath = path.isAbsolute(scenario.promptPath)
      ? scenario.promptPath
      : path.join(process.cwd(), scenario.promptPath);

    const prompt = await fs.readFile(promptPath, 'utf8');

    return res.status(200).json({
      ...scenario,
      prompt,
    });
  } catch (error) {
    console.error(`Failed to load scenario ${scenarioId}:`, error);
    return res.status(500).json({ error: 'Failed to load scenario.' });
  }
}
