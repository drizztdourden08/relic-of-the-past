/* @layer renderer-app @kind logic */
import type { ProfileStoreHooks } from '@drizztdourden08/brock-core';

const rotpProfileHooks: ProfileStoreHooks = {
  build: ({ romFile, language, msuPack, randomizer }) => {
    if (randomizer) randomizer.romFile = romFile ?? '';
    return {
      romFile: romFile ?? '',
      ...(language ? { language } : {}),
      ...(msuPack ? { msuPack } : {}),
    };
  },
  patchable: ['language', 'msuPack'],
  onCreate: async (profile, files) => {
    await files.mkdir(`profiles/${profile.id}/saves`);
  },
};

export { rotpProfileHooks };
