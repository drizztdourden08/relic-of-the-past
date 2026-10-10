/* @layer electron-main @kind constants */
import type { SimRunConfig } from '@rotp/navigation';
import type { CheckId } from '@rotp/game-data';
import type { FieldParser } from './sim-run-fields.type';

const isCheckId = (value: string): value is CheckId => value.startsWith('check-');

const parseTile = (config: SimRunConfig, value: string): void => {
  const [row, col] = value.split(',').map((n) => parseInt(n, 10));
  if (row !== undefined && col !== undefined && Number.isFinite(row) && Number.isFinite(col)) config.probeTile = { row, col };
};

const SIM_RUN_FIELDS: ReadonlyMap<string, FieldParser> = new Map<string, FieldParser>([
  ['slot', (config, value) => { config.startSlot = parseInt(value, 10); }],
  ['state', (config, value) => { config.stateName = value; }],
  ['target', (config, value) => { config.target = value; }],
  ['stop', (config, value) => { config.stopAtCheckId = isCheckId(value) ? value : null; }],
  ['max', (config, value) => { config.maxSteps = parseInt(value, 10); }],
  ['flood', (config, value) => { config.floodScreen = parseInt(value, 16); }],
  ['items', (config, value) => { config.probeItems = value.split(',').filter(Boolean); }],
  ['room', (config, value) => { config.probeRoom = parseInt(value, 16); }],
  ['scan', (config, value) => { config.scanSprite = parseInt(value, 16); }],
  ['combat', (config, value) => { config.combatSprite = parseInt(value, 16); }],
  ['tile', parseTile],
  ['screens', (config, value) => { config.screenWalkLimit = parseInt(value, 10); }],
]);

export { SIM_RUN_FIELDS };
