/* @layer renderer-other @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { SpritesPort } from '../sprites-port.type';

const createElectronSprites = (): SpritesPort => ({
  baseUrl: async (romFile) => requireHostApi().getSpritesBaseUrl(romFile),
});

export { createElectronSprites };
