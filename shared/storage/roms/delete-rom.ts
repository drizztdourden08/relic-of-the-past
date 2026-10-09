/* @layer shared-storage @kind logic */
import { createProfileStore } from '@drizztdourden08/brock-core';
import type { FileStore } from '@shared/platform';
import { SUPPLEMENT_IDS } from '@shared/asset-extraction/sources/source-ids';
import { datName, sidecarName } from '../assets';
import { ROM_KINDS, isBaseRom, kindOfFile } from '../rom-kinds';
import { listRoms } from './list-roms';

const deleteRom = async (files: FileStore, romFile: string): Promise<void> => {
  await files.remove(`roms/${romFile}`);

  if (!isBaseRom(romFile)) {
    const spec = ROM_KINDS[kindOfFile(romFile) ?? 'gba-alttp'];
    if (spec.sourceId) {
      for (const base of await listRoms(files, 'snes-alttp')) {
        await files.remove(`assets/${sidecarName(base, spec.sourceId)}`);
      }
    }
    return;
  }

  await files.remove(`assets/${datName(romFile)}`);
  for (const id of SUPPLEMENT_IDS) await files.remove(`assets/${sidecarName(romFile, id)}`);
  const profiles = createProfileStore(files);
  for (const profile of await profiles.list()) {
    if (profile.romFile === romFile) await profiles.remove(profile.id);
  }
};

export { deleteRom };
