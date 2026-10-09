/* @layer renderer-hud @kind constants */
import { slotBlockOffset, validSramSlots } from '@rotp/game-core';
import openingMark from '../../assets/title-scene/opening-mark.png';

const FULL = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;
const CANVAS = { width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' } as const;
const DRIFT_PX_PER_SECOND = 0.6;
const SPRITE_SCHEME = 'app-sprite://';
const SRAM_READER = { validSlots: validSramSlots, blockOffset: slotBlockOffset };
const PROMPT_INK = '#ffffff';
const PROMPT_STROKE = '#1c1a3a';
const SWORD_FILES = import.meta.glob('../../assets/title-scene/sword/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const OPENING_MARK_URL: string = openingMark;
const ROM_PICTURE_SCALE = 2;
const BUNDLED_PICTURE_SCALE = 1;
const GAME_CANVAS_ROWS_PER_LINE = 2;

export {
  BUNDLED_PICTURE_SCALE, CANVAS, DRIFT_PX_PER_SECOND, FULL, GAME_CANVAS_ROWS_PER_LINE, OPENING_MARK_URL, PROMPT_INK, PROMPT_STROKE, ROM_PICTURE_SCALE, SPRITE_SCHEME, SRAM_READER,
  SWORD_FILES,
};
