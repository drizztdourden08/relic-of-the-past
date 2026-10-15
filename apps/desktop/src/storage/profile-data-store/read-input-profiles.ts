/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';
import type { InputProfile } from '@rotp/input-mapping';

const readInputProfiles = async (p: string): Promise<InputProfile[]> =>
  (await store.readInputProfiles(platformFiles(), p)) as InputProfile[];

export { readInputProfiles };
