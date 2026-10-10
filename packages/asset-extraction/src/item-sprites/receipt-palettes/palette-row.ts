/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import type { RGBA } from '../../graphics/palette';
import type { SpritePalettes } from './receipt-palettes.type';

const paletteRow = (spritePalettes: SpritePalettes, row: number): RGBA[] => itemAt(spritePalettes.palettes, row, 'Sprite palette row');

export { paletteRow };
