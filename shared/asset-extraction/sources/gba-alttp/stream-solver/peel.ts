/* @layer shared-asset-extraction @kind logic */
/**
 * Stage two of the solve: the placements the clean cover cannot reach.
 *
 * Cells only reachable by objects that later get overdrawn are peeled from the end: repeatedly
 * take the placement covering the most still-missing cells while writing only cells already
 * accounted for by something drawn later. Peeled objects are prepended, so they land in the
 * sections that draw before the clean cover — one peel phase per section, in draw order
 * A(lower), B(upper), C(lower).
 */
import { inBounds } from './clean-cover';
import type { StampCatalogue } from './stamp-catalogue';

interface PeelOptions {
  preferBig: boolean;
  allowState2048: boolean;
  stairBonus: number;
  allowRepair: boolean;
  cleanFirst: boolean;
}

interface PeeledObject {
  id: number;
  col: number;
  row: number;
}

interface PeelResult {
  residual: number;
  picked: PeeledObject[][];
  repairCells: Set<number>;
}

/** Which layer each peel phase draws to: sections A, B, C in stream order. */
const PHASE_UPPER = [0, 1, 0] as const;
const ORIGIN = 8;

const peel = (
  st: StampCatalogue,
  tw: Uint16Array,
  free: Uint8Array,
  need0: Uint8Array,
  restorable: Uint8Array,
  opt: PeelOptions,
): PeelResult => {
  const { preferBig, allowState2048, stairBonus, allowRepair } = opt;
  const repairCells = new Set<number>();
  const need = Uint8Array.from(need0);
  let needCount = 0;
  for (let i = 0; i < 8192; i++) if (need[i]) needCount++;
  const picked: PeeledObject[][] = [[], [], []];
  const mark = new Int32Array(127 * 127);
  let gen = 0;
  for (let phase = 0; phase < 3; phase++) {
    const wantUpper = PHASE_UPPER[phase];
    for (;;) {
      if (!needCount) break;
      const buckets = new Map<number, number[]>();
      for (let i = 0; i < 8192; i++) {
        if (!need[i]) continue;
        const key = (i >> 12) * 65536 + tw[i];
        let bucket = buckets.get(key);
        if (!bucket) buckets.set(key, bucket = []);
        bucket.push(i & 4095);
      }
      let bestGain = 0, bestId = -1, bestDelta = 0, bestKey = -1, bestDc = 0, bestDr = 0, bestRep = Infinity;
      for (let si = 0; si < st.count; si++) {
        if (st.upper[si] !== wantUpper) continue;
        if (st.state[si] !== 0 && (!allowState2048 || st.sameAsState0[si])) continue;
        const a = st.off[si];
        const b = st.off[si + 1];
        if (b === a) continue;
        gen++;
        for (let k = a; k < b; k++) {
          const bucket = buckets.get(st.cLayer[k] * 65536 + st.cWord[k]);
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
            let gain = 0, ok = true, rep = 0;
            for (let q = a; q < b; q++) {
              const i2 = st.cLayer[q] * 4096 + st.cCell[q] + delta;
              if (free[i2]) continue;
              if (tw[i2] === st.cWord[q]) { if (need[i2]) gain++; continue; }
              if (allowRepair && restorable[i2]) { rep++; continue; }
              ok = false;
              break;
            }
            if (!ok || !gain) continue;
            const cellCount = b - a;
            const tiebreak = (st.isStair[si] ? stairBonus : 0) * 100000 + (preferBig ? cellCount : 5000 - cellCount);
            if (gain > bestGain || (gain === bestGain && rep < bestRep)
              || (gain === bestGain && rep === bestRep && tiebreak > bestKey)) {
              bestGain = gain; bestId = si; bestDelta = delta; bestKey = tiebreak; bestDc = dc; bestDr = dr; bestRep = rep;
            }
          }
        }
      }
      if (bestId < 0) break;
      const a = st.off[bestId];
      const b = st.off[bestId + 1];
      for (let q = a; q < b; q++) {
        const i2 = st.cLayer[q] * 4096 + st.cCell[q] + bestDelta;
        if (!free[i2] && tw[i2] !== st.cWord[q]) repairCells.add(i2);
        if (need[i2]) { need[i2] = 0; needCount--; }
        free[i2] = 1;
      }
      picked[phase].push({ id: bestId, col: ORIGIN + bestDc, row: ORIGIN + bestDr });
    }
  }
  return { residual: needCount, picked, repairCells };
};

export { peel };
export type { PeelOptions, PeelResult, PeeledObject };
