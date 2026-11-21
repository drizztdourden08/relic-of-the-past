/* @layer renderer-stores @kind logic */
import type { JapaneseGraphicEntry } from '@rotp/asset-extraction';
import { JA_ENDING_IDS, JA_MENUS_IDS, JA_PAUSE_IDS } from './japanese-pieces.constants';
import type { JapanesePieces } from './japanese-graphics-store.type';

const hasEntry = (entries: readonly JapaneseGraphicEntry[], id: number): boolean =>
  entries.some((entry) => entry.id === id && entry.bytes.length > 0);

const hasAll = (entries: readonly JapaneseGraphicEntry[], ids: readonly number[]): boolean =>
  ids.every((id) => hasEntry(entries, id));

const japanesePiecesOf = (entries: readonly JapaneseGraphicEntry[]): JapanesePieces => ({
  menus: hasAll(entries, JA_MENUS_IDS),
  pause: hasAll(entries, JA_PAUSE_IDS),
  ending: hasAll(entries, JA_ENDING_IDS),
});

export { japanesePiecesOf };
