/* @layer shared-asset-extraction @kind logic */
/**
 * Solves one room: search floor/layout combinations and peel strategies for the stream whose
 * replay differs least from the baked map, then complete its staircases.
 *
 * Staircase completion exists because drawing a staircase is what REGISTERS it, and the
 * original stream carried one per header stair slot even where later objects paint over most
 * of its art. Every stair-registering placement whose art is still visibly present is offered
 * a slot at the very front of section A — the earliest thing drawn, so everything already in
 * the cover keeps painting over it — and kept only if the replay comes out no worse.
 */
import { findClean, inBounds } from './clean-cover';
import { attempt, rankCombos, replay } from './room-attempt';
import type { FloorPatterns } from './base-map';
import type { AttemptResult, DoorPlacement, FloorCombo, StreamSection, Templates } from './room-attempt';
import type { StampCatalogue } from './stamp-catalogue';

interface SolveInputs {
  st: StampCatalogue;
  floors: FloorPatterns;
  templates: Templates;
  /** Both baked maps as one 8192-word array, priority stripped. */
  tw: Uint16Array;
  /** 0 where the word is filler the original authors never meant (blank tiles). */
  care: Uint8Array;
  doors: DoorPlacement[];
  /** How many header stair slots name a room inside the dungeon. */
  stairSlotsWanted: number;
  /** Floor/layout combinations to try, from the ranked list's head. */
  tries: number;
}

interface SolvedRoom extends AttemptResult {
  stairCount: number;
}

const measure = (
  st: StampCatalogue, floors: FloorPatterns, templates: Templates,
  tw: Uint16Array, care: Uint8Array, combo: FloorCombo, sections: StreamSection[],
): number => {
  const map = replay(st, floors, templates, combo, sections);
  let mism = 0;
  for (let i = 0; i < 8192; i++) if (care[i] && map[i] !== tw[i]) mism++;
  return mism;
};

/** Offer stair-registering placements whose art is present until the header's slots are filled. */
const stairPass = (inputs: SolveInputs, result: AttemptResult): number => {
  const { st, floors, templates, tw, care, stairSlotsWanted } = inputs;
  const placed: { col: number; row: number }[] = [];
  for (const section of result.sections) {
    for (const o of section.objects) if (st.isStair[o.id]) placed.push({ col: o.col, row: o.row });
  }
  const byWord = new Map<number, number[]>();
  for (let i = 0; i < 8192; i++) {
    if (!care[i]) continue;
    const key = (i >> 12) * 65536 + tw[i];
    let bucket = byWord.get(key);
    if (!bucket) byWord.set(key, bucket = []);
    bucket.push(i & 4095);
  }
  const candidates: { id: number; col: number; row: number; good: number; bad: number }[] = [];
  const mark = new Int32Array(127 * 127);
  let gen = 0;
  for (let si = 0; si < st.count; si++) {
    if (!st.isStair[si] || st.state[si] !== 0) continue;
    const a = st.off[si];
    const b = st.off[si + 1];
    if (b - a < 6) continue;
    gen++;
    for (let k = a; k < b; k++) {
      const bucket = byWord.get(st.cLayer[k] * 65536 + st.cWord[k]);
      if (!bucket) continue;
      const cc = st.cCell[k] & 63;
      const cr = st.cCell[k] >> 6;
      for (const r of bucket) {
        const dc = (r & 63) - cc;
        const dr = (r >> 6) - cr;
        if (!inBounds(st, si, dc, dr)) continue;
        const mi = (dr + 63) * 127 + (dc + 63);
        if (mark[mi] === gen) continue;
        mark[mi] = gen;
        const delta = dr * 64 + dc;
        let good = 0, bad = 0;
        for (let q = a; q < b; q++) {
          const i2 = st.cLayer[q] * 4096 + st.cCell[q] + delta;
          if (!care[i2]) continue;
          if (tw[i2] === st.cWord[q]) good++; else bad++;
        }
        if (good >= 6) candidates.push({ id: si, col: 8 + dc, row: 8 + dr, good, bad });
      }
    }
  }
  candidates.sort((x, y) => y.good - x.good || x.bad - y.bad || x.row - y.row || x.col - y.col);
  const taken = new Set(placed.map(o => `${o.col},${o.row}`));
  let count = placed.length;
  let baseline = measure(st, floors, templates, tw, care, result.combo, result.sections);
  for (const c of candidates) {
    if (count >= stairSlotsWanted) break;
    const key = `${c.col},${c.row}`;
    if (taken.has(key)) continue;
    result.sections[0].objects.unshift({ id: c.id, col: c.col, row: c.row });
    const m = measure(st, floors, templates, tw, care, result.combo, result.sections);
    if (m <= baseline) { taken.add(key); baseline = m; count++; } else result.sections[0].objects.shift();
  }
  result.mism = baseline;
  return count;
};

const solveRoom = (inputs: SolveInputs): SolvedRoom => {
  const { st, floors, templates, tw, care, doors, tries } = inputs;
  const cleanSet = findClean(st, tw, care);
  const combos = rankCombos(floors, templates, tw, care);
  const pool = combos.slice(0, tries);
  const fullSize = combos.find(c => c.ly === 7);
  if (fullSize && !pool.includes(fullSize)) pool.push(fullSize);

  let best: (AttemptResult & { n: number; stateObjects: number }) | null = null;
  for (const combo of pool) {
    for (const cleanFirst of [true, false]) {
      for (const allowRepair of [true, false]) {
        for (const allowState2048 of [false, true]) {
          for (const preferBig of [true, false]) {
            for (const stairBonus of [1, 0]) {
              const opt = { preferBig, allowState2048, stairBonus, allowRepair, cleanFirst };
              const r = attempt(st, floors, templates, tw, care, cleanSet, combo, doors, opt);
              const n = r.sections.reduce((total, s) => total + s.objects.length, 0);
              const stateObjects = r.sections.reduce(
                (total, s) => total + s.objects.filter(o => st.state[o.id] !== 0).length, 0);
              const cand = { ...r, n, stateObjects };
              if (!best || cand.mism < best.mism
                || (cand.mism === best.mism && cand.stateObjects < best.stateObjects)
                || (cand.mism === best.mism && cand.stateObjects === best.stateObjects && cand.n < best.n)) {
                best = cand;
              }
              if (r.mism === 0 && !allowState2048) {
                const stairCount = stairPass(inputs, best);
                return { ...best, stairCount };
              }
            }
          }
        }
      }
    }
  }
  const stairCount = stairPass(inputs, best!);
  return { ...best!, stairCount };
};

export { solveRoom };
export type { SolveInputs, SolvedRoom };
