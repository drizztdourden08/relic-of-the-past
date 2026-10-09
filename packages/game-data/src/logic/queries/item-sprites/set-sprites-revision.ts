/* @layer shared-game @kind logic */
import { spriteSource } from './sprite-source';

const setSpritesRevision = (revision: number): void => {
  spriteSource.revision = revision;
};

export { setSpritesRevision };
