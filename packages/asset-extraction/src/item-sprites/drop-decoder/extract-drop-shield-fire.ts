/* @layer shared-asset-extraction @kind logic */
import { drawShield } from './draw-shield';
import { POSITIONS } from './extract-drop-shield-fire.constants';
import type { DropSheets } from '../drop-sprite-assembly';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { SpritePalettes } from '../receipt-palettes';
import type { ShieldTiles } from './drop-decoder.type';

const extractDropShieldFire = (shield: ShieldTiles, paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer =>
  drawShield({ shield, paletteIdx, spritePalettes, dropSheets, positions: POSITIONS });

export { extractDropShieldFire };
