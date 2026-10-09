/* @layer shared-game @kind logic */
import { getSpritesBase } from './get-sprites-base';

const getSpritePath = (file: string): string => `${getSpritesBase()}${file}.png`;

export { getSpritePath };
