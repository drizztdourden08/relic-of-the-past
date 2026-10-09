/* @layer renderer-components @kind logic */
import { SPRITE_MANIFEST } from '@shared/game/data/sprite-manifest/manifest';

const spriteLabel = (file: string): string =>
  SPRITE_MANIFEST.find((sprite) => sprite.file === file)?.label ?? file;

export { spriteLabel };
