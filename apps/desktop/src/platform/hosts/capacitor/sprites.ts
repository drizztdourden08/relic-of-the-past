/* @layer renderer-other @kind logic */
import type { SpritesPort } from '../../sprites-port.type';
import { createCapacitorStorage } from './storage';

const createCapacitorSprites = (): SpritesPort => ({
  baseUrl: (romFile) => createCapacitorStorage().spritesBaseUrl(romFile),
});

export { createCapacitorSprites };
