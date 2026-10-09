/* @layer shared-asset-extraction @kind data */
import type { FontSource } from './font-data.type';

const FONT_TILE_COUNT = 256;

const FONT_TILE_2BPP_BYTES = 16;

const FONT_TILE_BYTES = FONT_TILE_COUNT * FONT_TILE_2BPP_BYTES;

const kFontTypes: Record<string, FontSource> = {
  us: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  de: { tileAddr: 0xcc6e8, widthAddr: 0x8cdecf, widthCount: 112 },
  fr: { tileAddr: 0xcc6e8, widthAddr: 0x8cdeaf, widthCount: 112 },
  'fr-c': { tileAddr: 0xcd078, widthAddr: 0x8ce83f, widthCount: 112 },
  en: { tileAddr: 0x8e8000, widthAddr: 0x8ecaff, widthCount: 102 },
  es: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  pl: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  pt: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 121 },
  redux: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  nl: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  sv: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
};

export { FONT_TILE_BYTES, FONT_TILE_COUNT, kFontTypes };
export type { FontSource } from './font-data.type';
