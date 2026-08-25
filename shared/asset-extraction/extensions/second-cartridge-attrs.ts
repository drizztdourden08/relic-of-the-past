/* @layer shared-asset-extraction @kind data */
/**
 * Attribute overlay: per-cell corrections applied after a room's collision installs.
 *
 * The port's own collision arrays are the source of truth for the baked rooms, but two kinds
 * of cell need translation into this engine's attribute language: exit doorways (the native
 * doorway stripe value the exit tables key on) and cells the collision conversion still gets
 * wrong (the entrance chamber's side-wall columns — the conversion gap is tracked separately;
 * these records make the correction explicit data instead of code).
 *
 * Format per record: layer byte, cell low byte, cell high byte, attribute byte.
 */

interface AttrOverlayCell {
  layer: 0 | 1;
  cell: number;
  attr: number;
}

const WALL = 0x02;
const DOORWAY_STRIPE = 0x8e;

/** The entrance chamber: side walls the conversion leaves walkable, and the south exit stripe. */
const entranceChamberOverlay = (): AttrOverlayCell[] => {
  const cells: AttrOverlayCell[] = [];
  for (let row = 4; row <= 61; row++) {
    cells.push({ layer: 0, cell: row * 64 + 19, attr: WALL });
    cells.push({ layer: 0, cell: row * 64 + 44, attr: WALL });
  }
  for (let row = 59; row <= 63; row++) {
    cells.push({ layer: 0, cell: row * 64 + 31, attr: DOORWAY_STRIPE });
    cells.push({ layer: 0, cell: row * 64 + 32, attr: DOORWAY_STRIPE });
  }
  return cells;
};

const OVERLAYS: Readonly<Record<number, () => AttrOverlayCell[]>> = {
  0x88: entranceChamberOverlay,
};

const attrOverlayRecord = (gbaRoomId: number): Buffer => {
  const build = OVERLAYS[gbaRoomId];
  if (!build) return Buffer.alloc(0);
  const cells = build();
  const record = Buffer.alloc(cells.length * 4);
  cells.forEach(({ layer, cell, attr }, i) => {
    record[i * 4] = layer;
    record.writeUInt16LE(cell, i * 4 + 1);
    record[i * 4 + 3] = attr;
  });
  return record;
};

export { attrOverlayRecord };
export type { AttrOverlayCell };
