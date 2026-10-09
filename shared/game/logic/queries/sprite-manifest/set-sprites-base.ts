/* @layer shared-game @kind logic */
import { spritePathBase } from './sprite-path-base';

const setSpritesBase = (base: string): void => {
  spritePathBase.base = base;
};

export { setSpritesBase };
