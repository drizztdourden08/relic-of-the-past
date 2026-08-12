/* @layer shared-storage @kind logic */
/** Per-device rumble strength multiplier over FileStore (rumble-strength.json at the Data root). */
import type { FileStore } from '@shared/platform';
import { clampRumbleStrength } from '@shared/input/haptics-rumble-strength';
import { readJson, writeJson } from './json';

const RUMBLE_STRENGTH_FILE = 'rumble-strength.json';

/** All rumble strength multipliers keyed by "vid:pid" */
type RumbleStrengthStore = Record<string, number>;

const readRumbleStrength = (files: FileStore): Promise<RumbleStrengthStore> =>
  readJson<RumbleStrengthStore>(files, RUMBLE_STRENGTH_FILE, {});

const writeRumbleStrength = async (files: FileStore, deviceKey: string, strength: number): Promise<void> => {
  const store = await readRumbleStrength(files);
  store[deviceKey] = clampRumbleStrength(strength);
  await writeJson(files, RUMBLE_STRENGTH_FILE, store);
};

export { readRumbleStrength, writeRumbleStrength };
export type { RumbleStrengthStore };
