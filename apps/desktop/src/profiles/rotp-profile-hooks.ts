/* @layer renderer-app @kind logic */
import type { ProfileStoreHooks } from '@drizztdourden08/brock-core';

const rotpProfileHooks: ProfileStoreHooks = {
  build: ({ romFile, language, msuPack, randomizer }) => ({
    romFile: romFile ?? '',
    ...(language ? { language } : {}),
    ...(msuPack ? { msuPack } : {}),
    ...(randomizer ? { randomizer } : {}),
  }),
  patchable: ['language', 'msuPack', 'randomizer'],
  onCreate: async (profile, files) => {
    await files.mkdir(`profiles/${profile.id}/saves`);
  },
};

export { rotpProfileHooks };
