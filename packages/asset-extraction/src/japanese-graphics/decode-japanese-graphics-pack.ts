/* @layer shared-asset-extraction @kind logic */
import { JA_GFX_ENTRY_HEADER_BYTES, JA_GFX_PACK_MAGIC } from './japanese-graphics.constants';
import type { JapaneseGraphicEntry } from './japanese-graphics.type';

const decodeJapaneseGraphicsPack = (pack: Uint8Array): JapaneseGraphicEntry[] => {
  if (pack.length < 8) return [];
  const view = new DataView(pack.buffer, pack.byteOffset, pack.byteLength);
  if (view.getUint32(0, true) !== JA_GFX_PACK_MAGIC) return [];
  const entries: JapaneseGraphicEntry[] = [];
  let at = 8;
  for (let i = 0, count = view.getUint32(4, true); i < count; i += 1) {
    if (at + JA_GFX_ENTRY_HEADER_BYTES > pack.length) break;
    const length = view.getUint32(at + 4, true);
    const start = at + JA_GFX_ENTRY_HEADER_BYTES;
    if (start + length > pack.length) break;
    entries.push({ id: view.getUint32(at, true), bytes: pack.subarray(start, start + length) });
    at = start + length;
  }
  return entries;
};

export { decodeJapaneseGraphicsPack };
