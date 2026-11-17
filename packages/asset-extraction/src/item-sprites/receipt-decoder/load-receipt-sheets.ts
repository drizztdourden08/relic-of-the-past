/* @layer shared-asset-extraction @kind logic */
import type { SpriteSource } from '../sources';
import type { ReceiptSheets } from './receipt-decoder.type';

const loadReceiptSheets = (source: SpriteSource): ReceiptSheets => ({
  base: source.readSheet('spr', 0x5a),
  sheet5B: source.readSheet('spr', 0x5b),
  sheet5C: source.readSheet('spr', 0x5c),
  sheet5D: source.readSheet('spr', 0x5d),
});

export { loadReceiptSheets };
