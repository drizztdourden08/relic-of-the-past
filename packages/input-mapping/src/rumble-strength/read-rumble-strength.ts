/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readJson } from '@drizztdourden08/brock-core';
import { RUMBLE_STRENGTH_FILE } from './rumble-strength.constants';
import type { RumbleStrengthStore } from './rumble-strength.type';

const readRumbleStrength = (files: FileStore): Promise<RumbleStrengthStore> =>
  readJson<RumbleStrengthStore>(files, RUMBLE_STRENGTH_FILE, {});

export { readRumbleStrength };
