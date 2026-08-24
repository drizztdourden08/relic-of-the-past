/* @layer shared-asset-extraction @kind logic */
/**
 * One complete attempt at a room: pick a floor/layout, run the clean cover and the peel, put
 * back what the peel overdrew, and replay the resulting stream to count what still differs.
 *
 * Draw order the stream replays as: floor, template, A(lower), B(upper), C(lower), doors.
 */
import { buildBase } from './base-map';
import { cleanCover } from './clean-cover';
import { peel } from './peel';
import { decodeObject, encodeObject } from './object-codec';
import type { FloorPatterns } from './base-map';
import type { CleanSet } from './clean-cover';
import type { PeelOptions, PeeledObject } from './peel';
import type { StampCatalogue } from './stamp-catalogue';

interface DoorPlacement {
  word: number;
  cells: [number, number][];
}

interface StreamSection {
  objects: PeeledObject[];
  doors: DoorPlacement[];
}

interface FloorCombo {
  ln: number;
  hn: number;
  ly: number;
  hard: number;
  soft: number;
}

interface AttemptResult {
  combo: FloorCombo;
  sections: StreamSection[];
  mism: number;
}

type Templates = { cells: Int32Array; words: Uint16Array }[];

/** Every floor-nibble and layout combination, ranked by how much of the room it already explains. */
const rankCombos = (floors: FloorPatterns, templates: Templates, tw: Uint16Array, care: Uint8Array): FloorCombo[] => {
  const combos: FloorCombo[] = [];
  for (let ln = 0; ln < 16; ln++) {
    for (let hn = 0; hn < 16; hn++) {
      for (let ly = 0; ly < 8; ly++) {
        const base = buildBase(floors, templates, ln, hn, ly);
        let hard = 0, soft = 0;
        for (let i = 0; i < 8192; i++) {
          if (base[i] === tw[i]) continue;
          soft++;
          if (care[i]) hard++;
        }
        combos.push({ ln, hn, ly, hard, soft });
      }
    }
  }
  combos.sort((a, b) => a.hard - b.hard || a.soft - b.soft || Number(b.ly === 7) - Number(a.ly === 7));
  return combos;
};

/** Redraw the stream's effect the way the engine would, for mismatch counting. */
const replay = (
  st: StampCatalogue, floors: FloorPatterns, templates: Templates,
  combo: FloorCombo, sections: StreamSection[],
): Uint16Array => {
  const map = buildBase(floors, templates, combo.ln, combo.hn, combo.ly);
  for (const section of sections) {
    for (const o of section.objects) {
      const a = st.off[o.id];
      const b = st.off[o.id + 1];
      const delta = (o.row - 8) * 64 + (o.col - 8);
      for (let q = a; q < b; q++) map[st.cLayer[q] * 4096 + st.cCell[q] + delta] = st.cWord[q];
    }
    for (const door of section.doors) for (const [i, word] of door.cells) map[i] = word;
  }
  return map;
};

/** The stream as the engine reads it; every object round-trips through the decoder first. */
const buildBytes = (st: StampCatalogue, combo: FloorCombo, sections: StreamSection[]): number[] => {
  const bytes = [(combo.hn << 4) | combo.ln, combo.ly << 2];
  for (const section of sections) {
    for (const o of section.objects) {
      const si = o.id;
      const e = encodeObject(st.kind[si], st.index[si], st.w[si], st.h[si], o.col, o.row);
      const d = decodeObject(e[0], e[1], e[2]);
      if (d.kind !== st.kind[si] || d.index !== st.index[si] || d.col !== o.col || d.row !== o.row
        || (st.kind[si] !== 2 && (d.w !== st.w[si] || d.h !== st.h[si]))) {
        throw new Error(`object round-trip failed: kind ${st.kind[si]} index ${st.index[si]} at ${o.col},${o.row}`);
      }
      const word = e[0] | (e[1] << 8);
      if (word === 0xffff || word === 0xfff0) throw new Error('object encoding collides with a stream terminator');
      bytes.push(e[0], e[1], e[2]);
    }
    if (section.doors.length) {
      bytes.push(0xf0, 0xff);
      for (const door of section.doors) bytes.push(door.word & 0xff, door.word >> 8);
    }
    bytes.push(0xff, 0xff);
  }
  return bytes;
};

const attempt = (
  st: StampCatalogue, floors: FloorPatterns, templates: Templates,
  tw: Uint16Array, care: Uint8Array, cleanSet: CleanSet,
  combo: FloorCombo, doors: DoorPlacement[], opt: PeelOptions,
): AttemptResult => {
  const { clean, restorable } = cleanSet;
  const base = buildBase(floors, templates, combo.ln, combo.hn, combo.ly);
  const need = new Uint8Array(8192);
  for (let i = 0; i < 8192; i++) if (care[i] && base[i] !== tw[i]) need[i] = 1;
  // Doors draw last of all and every door cell already matches the baked map, so they settle first.
  const doorCells = new Uint8Array(8192);
  for (const door of doors) for (const [i] of door.cells) { doorCells[i] = 1; need[i] = 0; }

  const chosenIdx = opt.cleanFirst ? cleanCover(clean, need) : [];
  const used = new Set(chosenIdx);
  const free = new Uint8Array(8192);
  for (let i = 0; i < 8192; i++) if (!care[i] || doorCells[i]) free[i] = 1;
  for (const p of chosenIdx) for (const c of clean[p].covers) free[c] = 1;

  const { picked, repairCells } = peel(st, tw, free, need, restorable, opt);

  // Whatever the peel had to overdraw is put back by clean objects appended at the tail.
  const remaining = new Set(repairCells);
  const extra: number[] = [];
  while (remaining.size) {
    let best = -1, bestN = 0;
    for (let p = 0; p < clean.length; p++) {
      if (used.has(p)) continue;
      let n = 0;
      for (const c of clean[p].covers) if (remaining.has(c)) n++;
      if (n > bestN) { bestN = n; best = p; }
    }
    if (best < 0) break;
    used.add(best);
    extra.push(best);
    for (const c of clean[best].covers) remaining.delete(c);
  }

  const cleanLower: PeeledObject[] = [];
  const cleanUpper: PeeledObject[] = [];
  for (const p of [...chosenIdx, ...extra]) {
    const o = clean[p];
    (st.upper[o.id] === 1 ? cleanUpper : cleanLower).push({ id: o.id, col: o.col, row: o.row });
  }
  const sections: StreamSection[] = [
    { objects: picked[2].slice().reverse(), doors: [] },
    { objects: [...picked[1].slice().reverse(), ...cleanUpper], doors: [] },
    { objects: [...picked[0].slice().reverse(), ...cleanLower], doors },
  ];
  const map = replay(st, floors, templates, combo, sections);
  let mism = 0;
  for (let i = 0; i < 8192; i++) if (care[i] && map[i] !== tw[i]) mism++;
  return { combo, sections, mism };
};

export { attempt, buildBytes, rankCombos, replay };
export type { AttemptResult, DoorPlacement, FloorCombo, StreamSection, Templates };
