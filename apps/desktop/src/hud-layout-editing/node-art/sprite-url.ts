/* @layer renderer-components @kind logic */
import { getSpritesBase } from '@rotp/game-data';

const spriteUrl = (file: string): string => `${getSpritesBase()}${file}.png`;

export { spriteUrl };
