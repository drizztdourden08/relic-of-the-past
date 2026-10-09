/* @layer renderer-components @kind logic */
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';

const spriteUrl = (file: string): string => `${getSpritesBase()}${file}.png`;

export { spriteUrl };
