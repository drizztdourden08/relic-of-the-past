/* @layer shared-asset-extraction @kind types */
interface AttrOverlayCell {
  layer: 0 | 1;
  cell: number;
  attr: number;
}

type CellColumnRow = readonly [number, number];

type RoomCellPairs = Readonly<Record<number, readonly CellColumnRow[]>>;

export type { AttrOverlayCell, RoomCellPairs };
