/* @layer renderer-lib @kind logic */
import { createProfileStore } from '@drizztdourden08/brock-core';
import type { FileStore } from '@drizztdourden08/brock-core';
import { kindOfFile } from '@rotp/roms';
import { romStoreOf } from './rom-store-of';

const removeProfilesOf = async (files: FileStore, romFile: string): Promise<void> => {
  const profiles = createProfileStore(files);
  for (const profile of await profiles.list()) {
    if (Reflect.get(profile, 'romFile') === romFile) await profiles.remove(profile.id);
  }
};

const deleteRomFile = async (files: FileStore, romFile: string): Promise<void> => {
  const kind = kindOfFile(romFile) ?? 'gba-alttp';
  await romStoreOf(files, kind).remove(romFile);
  if (kind === 'snes-alttp') await removeProfilesOf(files, romFile);
};

export { deleteRomFile };
