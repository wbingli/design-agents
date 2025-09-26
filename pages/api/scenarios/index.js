import { loadScenarioManifest } from '../../../lib/scenarios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scenarios = await loadScenarioManifest();
    return res.status(200).json({ scenarios });
  } catch (error) {
    console.error('Failed to load scenarios manifest:', error);
    return res.status(500).json({ error: 'Failed to load scenarios.' });
  }
}
