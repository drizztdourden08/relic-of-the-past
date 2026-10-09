/* @layer shared-game @kind constants */
import type { DungeonPiece } from './receipt-item-class.type';

const PIECE_BY_BASE: Readonly<Record<string, DungeonPiece>> = {
  'Small Key': 'small-key',
  'Big Key': 'big-key',
  Map: 'map',
  Compass: 'compass',
};

export { PIECE_BY_BASE };
