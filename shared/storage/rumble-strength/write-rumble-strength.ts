/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { clampRumbleStrength } from '@shared/input/haptics-rumble-strength';
import { writeJson } from '@drizztdourden08/brock-core';
import { readRumbleStrength } from './read-rumble-strength';
import { RUMBLE_STRENGTH_FILE } from './rumble-strength.constants';

const writeRumbleStrength = async (files: FileStore, deviceKey: string, strength: number): Promise<void> => {
  const store = await readRumbleStrength(files);
  store[deviceKey] = clampRumbleStrength(strength);
  await writeJson(files, RUMBLE_STRENGTH_FILE, store);
};

export { writeRumbleStrength };
