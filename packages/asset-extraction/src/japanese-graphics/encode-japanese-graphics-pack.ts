/* @layer shared-asset-extraction @kind logic */
import { JA_GFX_ENTRY_HEADER_BYTES, JA_GFX_PACK_MAGIC } from './japanese-graphics.constants';
import type { JapaneseGraphicEntry } from './japanese-graphics.type';

const encodeJapaneseGraphicsPack = (entries: readonly JapaneseGraphicEntry[]): Uint8Array => {
  const total = 8 + entries.reduce((sum, entry) => sum + JA_GFX_ENTRY_HEADER_BYTES + entry.bytes.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, JA_GFX_PACK_MAGIC, true);
  view.setUint32(4, entries.length, true);
  let at = 8;
  for (const entry of entries) {
    view.setUint32(at, entry.id, true);
    view.setUint32(at + 4, entry.bytes.length, true);
    out.set(entry.bytes, at + JA_GFX_ENTRY_HEADER_BYTES);
    at += JA_GFX_ENTRY_HEADER_BYTES + entry.bytes.length;
  }
  return out;
};

export { encodeJapaneseGraphicsPack };
