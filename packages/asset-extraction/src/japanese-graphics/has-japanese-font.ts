/* @layer shared-asset-extraction @kind logic */
import { JA_GFX_DIALOGUE_FONT_ID, JA_GFX_TILEMAP_FONT_ID } from './japanese-graphics.constants';
import type { JapaneseGraphicEntry } from './japanese-graphics.type';

const hasEntry = (entries: readonly JapaneseGraphicEntry[], id: number): boolean =>
  entries.some((entry) => entry.id === id && entry.bytes.length > 0);

const hasJapaneseFont = (entries: readonly JapaneseGraphicEntry[]): boolean =>
  hasEntry(entries, JA_GFX_DIALOGUE_FONT_ID) && hasEntry(entries, JA_GFX_TILEMAP_FONT_ID);

export { hasJapaneseFont };
