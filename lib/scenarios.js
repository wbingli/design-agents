import fs from 'fs/promises';
import path from 'path';

const manifestPath = path.join(process.cwd(), 'content', 'scenarios.json');

export async function loadScenarioManifest() {
  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  if (!manifest || !Array.isArray(manifest.scenarios)) {
    throw new Error('Invalid scenarios manifest.');
  }
  return manifest.scenarios;
}

export async function findScenarioById(id) {
  const scenarios = await loadScenarioManifest();
  return scenarios.find((scenario) => scenario.id === id) || null;
}

export function getDefaultScenario(scenarios) {
  return scenarios.find((scenario) => scenario.default) || null;
}
