/* @layer renderer-components @kind logic */
import { SPRITE_MANIFEST } from '@rotp/game-data';

const spriteLabel = (file: string): string =>
  SPRITE_MANIFEST.find((sprite) => sprite.file === file)?.label ?? file;

export { spriteLabel };
