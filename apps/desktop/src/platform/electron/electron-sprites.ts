/* @layer renderer-other @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { SpritesPort } from '../sprites-port.type';

const createElectronSprites = (): SpritesPort => ({
  baseUrl: (romFile) => new Promise<string>((resolve) => resolve(requireHostApi().getSpritesBaseUrl(romFile))),
});

export { createElectronSprites };
