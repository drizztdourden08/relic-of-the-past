/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import type { SimRunConfig } from '@rotp/navigation';
import { writeDebugOutput } from './write-debug-output';
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

  handle('debug:writeSimRun', (_event, data: unknown) => writeDebugOutput('sim-run', 'sim-run.json', data));
};

export { registerSimRunHandler };
