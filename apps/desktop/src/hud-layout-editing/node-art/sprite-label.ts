/* @layer renderer-components @kind logic */
import { SPRITE_MANIFEST } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';

const spriteLabel = (file: string): string => {
  const label = SPRITE_MANIFEST.find((sprite) => sprite.file === file)?.label;
  return label === undefined ? file : textOf(label);
};

export { spriteLabel };
