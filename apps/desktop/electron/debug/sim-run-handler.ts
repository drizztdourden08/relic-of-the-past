/* @layer electron-main @kind logic */
import { app } from 'electron';
import { join } from 'path';
import { handle } from '@drizztdourden08/brock-electron/main';
import { getWorkspaceRoot } from '../screen-editor/workspace-root';
import { writeFile, mkdir } from 'fs/promises';
import type { SimRunConfig } from '@rotp/navigation';
import { DEFAULT_MAX_STEPS } from './sim-run-handler.constants';
import { SIM_RUN_FIELDS } from './sim-run-fields.constants';

const parseSimRunConfig = (): SimRunConfig | null => {
  const arg = process.argv.find((a) => a === '--sim-run' || a.startsWith('--sim-run='));
  if (!arg) return null;

  const config: SimRunConfig = { startSlot: null, stateName: null, target: null, stopAtCheckId: null, maxSteps: DEFAULT_MAX_STEPS, floodScreen: null, probeRoom: null, probeTile: null, probeItems: null, scanSprite: null, combatSprite: null, screenWalkLimit: null };
  const eq = arg.indexOf('=');
  if (eq === -1) return config;

  for (const pair of arg.slice(eq + 1).split(';')) {
    const [key = '', value] = pair.split('=');
    if (value) SIM_RUN_FIELDS.get(key)?.(config, value);
  }
  return config;
};

const registerSimRunHandler = (): void => {
  const config = parseSimRunConfig();

  handle('debug:getSimRunConfig', () => config);

  handle('debug:writeSimRun', async (_event, data: unknown) => {
    const appRoot = app.isPackaged ? join(app.getAppPath(), '../..') : getWorkspaceRoot();
    const dir = join(appRoot, 'debug-output');
    await mkdir(dir, { recursive: true });
    const outPath = join(dir, 'sim-run.json');
    await writeFile(outPath, JSON.stringify(data, null, 2));
    console.log(`[sim-run] Written to: ${outPath}`);
    return outPath;
  });
};

export { registerSimRunHandler };
