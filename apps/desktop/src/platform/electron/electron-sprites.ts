/* @layer renderer-other @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { SpritesPort } from '../sprites-port.type';

const createElectronSprites = (): SpritesPort => ({
  baseUrl: async (romFile) => appApi().getSpritesBaseUrl(romFile),
});

export { createElectronSprites };
