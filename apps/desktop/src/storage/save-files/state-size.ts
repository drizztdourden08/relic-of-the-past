/* @layer renderer-lib @kind logic */
import { saveSlotPaths } from '@drizztdourden08/brock-port-kit';
import type { SaveSlotRef } from '@drizztdourden08/brock-port-kit';
import type { FileStore } from '@drizztdourden08/brock-core';

const stateSize = async (files: FileStore, profileId: string, ref: SaveSlotRef): Promise<number | null> =>
  (await files.stat(saveSlotPaths(profileId, ref).state))?.bytes ?? null;

export { stateSize };
