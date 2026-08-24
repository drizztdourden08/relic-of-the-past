/* @layer shared-asset-extraction @kind logic */
/**
 * The full vocabulary of what the engine can draw, enumerated live through the probe.
 *
 * One stamp per (subtype, index, size, layer, state): the cells the object writes relative to
 * a fixed origin, flattened into typed arrays so the solver can scan millions of candidate
 * placements without allocation. Objects are drawn at origin (8,8) so every shape fits; a
 * stamp's placement bounds are precomputed from its own extents.
 *
 * State 0x800 twins that draw identically to their state-0 sibling are marked so the solver
 * can skip them: a few objects branch on the room's saved switches and draw a second shape.
 */
import { DOOR_TYPES, DRAWABLE_SUBTYPE_1, DRAWABLE_SUBTYPE_2, DRAWABLE_SUBTYPE_3, STAIR_INDICES } from './drawable-objects';
import { encodeObject } from './object-codec';
import type { ProbeCell, RoomDrawProbe } from './probe.type';

/** The probe origin every stamp is drawn at. */
const ORIGIN = 8;
/** The priority bit is stripped everywhere: the baked format never carried it. */
const WORD_MASK = 0xffff & ~0x2000;
/** The two room states objects can branch on: nothing thrown, and a switch thrown. */
const PROBE_STATES = [0, 0x800] as const;

interface StampCatalogue {
  count: number;
  /** Cell run per stamp: [off[i], off[i+1]) indexes into the three parallel cell arrays. */
  off: Int32Array;
  cCell: Int32Array;
  cLayer: Uint8Array;
  cWord: Uint16Array;
  kind: Uint8Array;
  index: Uint8Array;
  w: Uint8Array;
  h: Uint8Array;
  upper: Uint8Array;
  state: Uint16Array;
  minCol: Int16Array;
  maxCol: Int16Array;
  minRow: Int16Array;
  maxRow: Int16Array;
  /** 1 when a state-0x800 stamp draws identically to its state-0 twin. */
  sameAsState0: Uint8Array;
  /** 1 when drawing this stamp registers a staircase. */
  isStair: Uint8Array;
}

interface RawStamp {
  kind: number; index: number; w: number; h: number; upper: number; state: number; cells: ProbeCell[];
}

const enumerateStamps = (probe: RoomDrawProbe): RawStamp[] => {
  const out: RawStamp[] = [];
  for (let upper = 0; upper < 2; upper++) {
    for (const state of PROBE_STATES) {
      for (const index of DRAWABLE_SUBTYPE_1) {
        for (let h = 0; h < 4; h++) {
          for (let w = 0; w < 4; w++) {
            const [b0, b1] = encodeObject(1, index, w, h, ORIGIN, ORIGIN);
            const cells = probe.drawObject(b0 | (b1 << 8), index, upper, state);
            if (cells.length) out.push({ kind: 1, index, w, h, upper, state, cells });
          }
        }
      }
      for (const index of DRAWABLE_SUBTYPE_3) {
        const w = index & 3;
        const h = (index >> 2) & 3;
        const [b0, b1, b2] = encodeObject(3, index, w, h, ORIGIN, ORIGIN);
        const cells = probe.drawObject(b0 | (b1 << 8), b2, upper, state);
        if (cells.length) out.push({ kind: 3, index, w, h, upper, state, cells });
      }
      for (const index of DRAWABLE_SUBTYPE_2) {
        const [b0, b1, b2] = encodeObject(2, index, 0, 0, ORIGIN, ORIGIN);
        const cells = probe.drawObject(b0 | (b1 << 8), b2, upper, state);
        if (cells.length) out.push({ kind: 2, index, w: 0, h: 0, upper, state, cells });
      }
    }
  }
  return out;
};

const buildStampCatalogue = (probe: RoomDrawProbe): StampCatalogue => {
  const raw = enumerateStamps(probe);
  const count = raw.length;
  const total = raw.reduce((sum, s) => sum + s.cells.length, 0);
  const off = new Int32Array(count + 1);
  const cCell = new Int32Array(total);
  const cLayer = new Uint8Array(total);
  const cWord = new Uint16Array(total);
  const kind = new Uint8Array(count);
  const index = new Uint8Array(count);
  const w = new Uint8Array(count);
  const h = new Uint8Array(count);
  const upper = new Uint8Array(count);
  const state = new Uint16Array(count);
  const minCol = new Int16Array(count);
  const maxCol = new Int16Array(count);
  const minRow = new Int16Array(count);
  const maxRow = new Int16Array(count);
  const isStair = new Uint8Array(count);

  let at = 0;
  raw.forEach((stamp, i) => {
    off[i] = at;
    kind[i] = stamp.kind;
    index[i] = stamp.index;
    w[i] = stamp.w;
    h[i] = stamp.h;
    upper[i] = stamp.upper;
    state[i] = stamp.state;
    isStair[i] = (STAIR_INDICES[stamp.kind] ?? []).includes(stamp.index) ? 1 : 0;
    let mnC = 64, mxC = -1, mnR = 64, mxR = -1;
    for (const cell of stamp.cells) {
      cCell[at] = cell.cell;
      cLayer[at] = cell.layer;
      cWord[at] = cell.word & WORD_MASK;
      const col = cell.cell & 63;
      const row = cell.cell >> 6;
      if (col < mnC) mnC = col;
      if (col > mxC) mxC = col;
      if (row < mnR) mnR = row;
      if (row > mxR) mxR = row;
      at++;
    }
    minCol[i] = mnC; maxCol[i] = mxC; minRow[i] = mnR; maxRow[i] = mxR;
  });
  off[count] = at;

  // Mark state-0x800 stamps that draw exactly like their state-0 twin.
  const sameAsState0 = new Uint8Array(count);
  const byTwin = new Map<string, number>();
  const twinKey = (i: number): string => `${kind[i]}:${index[i]}:${w[i]}:${h[i]}:${upper[i]}`;
  for (let i = 0; i < count; i++) if (state[i] === 0) byTwin.set(twinKey(i), i);
  for (let i = 0; i < count; i++) {
    if (state[i] === 0) continue;
    const j = byTwin.get(twinKey(i));
    if (j === undefined) continue;
    const [a, b, c, d] = [off[i], off[i + 1], off[j], off[j + 1]];
    let same = b - a === d - c;
    for (let k = 0; same && k < b - a; k++) {
      same = cCell[a + k] === cCell[c + k] && cLayer[a + k] === cLayer[c + k] && cWord[a + k] === cWord[c + k];
    }
    sameAsState0[i] = same ? 1 : 0;
  }

  return { count, off, cCell, cLayer, cWord, kind, index, w, h, upper, state, minCol, maxCol, minRow, maxRow, sameAsState0, isStair };
};

/** Door stamps keyed by `type/position/direction`; cells are absolute, not translatable. */
const buildDoorCatalogue = (probe: RoomDrawProbe): Map<string, ProbeCell[]> => {
  const doors = new Map<string, ProbeCell[]>();
  for (const type of DOOR_TYPES) {
    for (let position = 0; position < 16; position++) {
      for (let direction = 0; direction < 4; direction++) {
        const cells = probe.drawDoor((type << 8) | (position << 4) | direction, 0);
        if (cells.length) doors.set(`${type}/${position}/${direction}`, cells);
      }
    }
  }
  return doors;
};

/** The eight shared layout templates; every one draws to the lower map only. */
const buildTemplates = (probe: RoomDrawProbe): { cells: Int32Array; words: Uint16Array }[] => {
  const templates: { cells: Int32Array; words: Uint16Array }[] = [];
  for (let layout = 0; layout < 8; layout++) {
    const raw = probe.drawTemplate(layout);
    const cells = new Int32Array(raw.length);
    const words = new Uint16Array(raw.length);
    raw.forEach((cell, i) => {
      if (cell.layer !== 0) throw new Error('a layout template wrote the upper map');
      cells[i] = cell.cell;
      words[i] = cell.word & WORD_MASK;
    });
    templates[layout] = { cells, words };
  }
  return templates;
};

export { ORIGIN, WORD_MASK, buildDoorCatalogue, buildStampCatalogue, buildTemplates };
export type { StampCatalogue };
