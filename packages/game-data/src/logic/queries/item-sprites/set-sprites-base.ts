/* @layer shared-game @kind logic */
import { spriteSource } from './sprite-source';

const setSpritesBase = (base: string): void => {
  spriteSource.base = base;
};

export { setSpritesBase };
