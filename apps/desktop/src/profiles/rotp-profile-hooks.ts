/* @layer renderer-app @kind logic */
import type { ProfileStoreHooks } from '@drizztdourden08/brock-core';

const rotpProfileHooks: ProfileStoreHooks = {
  build: ({ romFile, language, appLanguage, msuPack, randomizer }) => {
    if (randomizer) randomizer.romFile = romFile ?? '';
    return {
      romFile: romFile ?? '',
      ...(language ? { language } : {}),
      ...(appLanguage ? { appLanguage } : {}),
      ...(msuPack ? { msuPack } : {}),
    };
  },
  patchable: ['language', 'appLanguage', 'msuPack'],
  onCreate: async (profile, files) => {
    await files.mkdir(`profiles/${profile.id}/saves`);
  },
};

export { rotpProfileHooks };
