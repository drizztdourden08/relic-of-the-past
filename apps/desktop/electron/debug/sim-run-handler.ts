/* @layer electron-main @kind logic */
/**
 * Debug CLI: --sim-run[=slot=N;target=<screenId>;stop=<checkId>;max=N]
 *
 * Runs the gameplay simulator headlessly to a stop condition, then writes a
 * SimRunReport (outcome, reached screens, verified checks, boundary edges,
 * data-correction suggestions) to debug-output/sim-run.json and exits. Drives
 * the in-chat data-correction loop.
 *
 * Usage:
 *   npx electron dist/electron/main.js --muted --no-focus \
 *     --sim-run=slot=0;target=hyrule-castle-secret-passage
 */

import { app } from 'electron';
import { join } from 'path';
import { handle } from '../lib/ipc/handle';
import { writeFile, mkdir } from 'fs/promises';
import type { SimRunConfig } from '@shared/game/simulation';

const DEFAULT_MAX_STEPS = 20000;

const parseSimRunConfig = (): SimRunConfig | null => {
  const arg = process.argv.find((a) => a === '--sim-run' || a.startsWith('--sim-run='));
  if (!arg) return null;

  const config: SimRunConfig = { startSlot: null, stateName: null, target: null, stopAtCheckId: null, maxSteps: DEFAULT_MAX_STEPS, floodScreen: null, probeRoom: null, probeTile: null, probeItems: null, screenWalkLimit: null };
  const eq = arg.indexOf('=');
  if (eq === -1) return config;

  for (const pair of arg.slice(eq + 1).split(';')) {
    const [key, value] = pair.split('=');
    if (!value) continue;
    if (key === 'slot') config.startSlot = parseInt(value, 10);
    else if (key === 'state') config.stateName = value;
    else if (key === 'target') config.target = value;
    else if (key === 'stop') config.stopAtCheckId = value;
    else if (key === 'max') config.maxSteps = parseInt(value, 10);
    else if (key === 'flood') config.floodScreen = parseInt(value, 16);
    else if (key === 'items') config.probeItems = value.split(',').filter(Boolean);
    else if (key === 'room') config.probeRoom = parseInt(value, 16);
    else if (key === 'tile') {
      const [row, col] = value.split(',').map((n) => parseInt(n, 10));
      if (Number.isFinite(row) && Number.isFinite(col)) config.probeTile = { row, col };
    }
    else if (key === 'screens') config.screenWalkLimit = parseInt(value, 10);
  }
  return config;
};

const registerSimRunHandler = (): void => {
  const config = parseSimRunConfig();

  handle('debug:getSimRunConfig', () => config);

  handle('debug:writeSimRun', async (_event, data: unknown) => {
    const appRoot = app.isPackaged ? join(app.getAppPath(), '../..') : join(__dirname, '../..');
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'sim-run.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[sim-run] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerSimRunHandler };
