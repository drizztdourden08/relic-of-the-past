/* @layer shared-asset-extraction @kind logic */
/**
 * Stage one of the solve: placements that can never damage anything.
 *
 * A placement whose every written cell already equals the room's baked map may be emitted in
 * any order and any quantity. Finding them all, deduplicated by footprint, and then greedily
 * covering the still-needed cells with them recovers almost the whole room order-free.
 */
import type { StampCatalogue } from './stamp-catalogue';

interface CleanPlacement {
  id: number;
  col: number;
  row: number;
  covers: number[];
  rank: number;
}

interface CleanSet {
  clean: CleanPlacement[];
  /** Cells some clean placement can rewrite — the peel may overdraw these and repair after. */
  restorable: Uint8Array;
}

const ORIGIN = 8;

const inBounds = (st: StampCatalogue, si: number, dc: number, dr: number): boolean => {
  const col = ORIGIN + dc;
  const row = ORIGIN + dr;
  const maxX = st.kind[si] === 2 ? 63 : 62;
  if (col < 0 || col > maxX || row < 0 || row > 63) return false;
  if (st.minCol[si] + dc < 0 || st.maxCol[si] + dc > 63) return false;
  return st.minRow[si] + dr >= 0 && st.maxRow[si] + dr <= 63;
};

const findClean = (st: StampCatalogue, tw: Uint16Array, care: Uint8Array): CleanSet => {
  const byWord = new Map<number, number[]>();
  for (let i = 0; i < 8192; i++) {
    if (!care[i]) continue;
    const key = (i >> 12) * 65536 + tw[i];
    let bucket = byWord.get(key);
    if (!bucket) byWord.set(key, bucket = []);
    bucket.push(i & 4095);
  }
  const out: CleanPlacement[] = [];
  const restorable = new Uint8Array(8192);
  const dedupe = new Map<string, number>();
  const mark = new Int32Array(127 * 127);
  let gen = 0;
  for (let si = 0; si < st.count; si++) {
    if (st.state[si] !== 0 && st.sameAsState0[si]) continue;
    const a = st.off[si];
    const b = st.off[si + 1];
    if (b === a) continue;
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
        let ok = true;
        const covers: number[] = [];
        for (let q = a; q < b; q++) {
          const i2 = st.cLayer[q] * 4096 + st.cCell[q] + delta;
          if (!care[i2]) continue;
          if (tw[i2] !== st.cWord[q]) { ok = false; break; }
          covers.push(i2);
        }
        if (!ok || !covers.length) continue;
        for (const c2 of covers) restorable[c2] = 1;
        // Two placements with the same footprint are interchangeable; keep the better one:
        // a stair-registering object, then a state-0 one, wins the tie.
        let hash = 0;
        for (const c2 of covers) hash = (hash * 31 + c2) | 0;
        const key = `${hash}:${covers.length}:${covers[0]}:${covers[covers.length - 1]}`;
        const rank = (st.isStair[si] ? 2 : 0) + (st.state[si] === 0 ? 1 : 0);
        const prev = dedupe.get(key);
        if (prev !== undefined) {
          if (rank > out[prev].rank) out[prev] = { id: si, col: ORIGIN + dc, row: ORIGIN + dr, covers, rank };
          continue;
        }
        dedupe.set(key, out.length);
        out.push({ id: si, col: ORIGIN + dc, row: ORIGIN + dr, covers, rank });
      }
    }
  }
  return { clean: out, restorable };
};

/** Lazy max-heap greedy set cover: gains only shrink, so a stale top is simply re-pushed. */
const cleanCover = (clean: CleanPlacement[], need: Uint8Array): number[] => {
  const heap: { p: number; g: number }[] = [];
  const push = (item: { p: number; g: number }): void => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent].g >= heap[i].g) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };
  const pop = (): { p: number; g: number } => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l].g > heap[m].g) m = l;
        if (r < heap.length && heap[r].g > heap[m].g) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };
  for (let p = 0; p < clean.length; p++) {
    let g = 0;
    for (const c of clean[p].covers) if (need[c]) g++;
    if (g) push({ p, g });
  }
  const chosen: number[] = [];
  while (heap.length) {
    const top = pop();
    let g = 0;
    for (const c of clean[top.p].covers) if (need[c]) g++;
    if (g === 0) continue;
    if (g < top.g) { push({ p: top.p, g }); continue; }
    chosen.push(top.p);
    for (const c of clean[top.p].covers) need[c] = 0;
  }
  return chosen;
};

export { cleanCover, findClean, inBounds };
export type { CleanPlacement, CleanSet };
