/* @layer shared-asset-extraction @kind logic */
/**
 * Raw tile runs: the cells the object vocabulary cannot reproduce.
 *
 * After the solved stream replays, the remaining mismatched cells are covered by rectangles
 * and each rectangle becomes one reserved-slot object (index 0x31) in the stream, plus one
 * entry in the room's run blob: width, height, then width*height tile words in row-major
 * order. The engine's drawing switch consumes blob entries in draw order, so the blob is
 * built section B first (upper layer), then section C (lower layer) — the order the stream
 * draws them. Cells whose tile id has no art in the background block are left out; they wait
 * for the art-injection pass rather than paint garbage.
 */
import { decodeObject, encodeObject } from './object-codec';

interface RawRunPlan {
  /** The stream with the run objects spliced in, ready for the engine. */
  stream: Buffer;
  /** The room's run blob, in draw order. */
  runBlob: Buffer;
  /** Cells still mismatched after the runs (no expressible art). */
  residual: number;
  runCount: number;
}

interface Rect { col: number; row: number; w: number; h: number }

/** Tile ids at and past this have no art in the dungeon's background block yet. */
const ART_LIMIT = 0x200;
const RAW_RUN_INDEX = 0x31;

/** Greedy rectangles over one layer's mismatched cells: row runs, merged downward. */
const coverRects = (fix: Uint8Array): Rect[] => {
  const runs: Rect[] = [];
  for (let row = 0; row < 64; row++) {
    for (let col = 0; col < 64;) {
      if (!fix[row * 64 + col]) { col++; continue; }
      let w = 0;
      while (col + w < 64 && fix[row * 64 + col + w]) w++;
      // A rect starting at column 63 encodes as 0xfc in its first byte, which the engine
      // reads as a subtype-2 marker. Start one cell left instead; the extra word is the
      // target's own, so the write is a no-op there.
      if (col === 63) runs.push({ col: 62, row, w: w + 1, h: 1 });
      else runs.push({ col, row, w, h: 1 });
      col += w;
    }
  }
  const merged: Rect[] = [];
  for (const run of runs) {
    const above = merged.find(r => r.col === run.col && r.w === run.w && r.row + r.h === run.row);
    if (above) above.h++; else merged.push(run);
  }
  return merged;
};

/** Splice `entries` (3-byte objects) into the stream at the end of section `target` (0-2). */
const spliceIntoSection = (stream: number[], target: number, entries: number[]): number[] => {
  let pos = 2;
  for (let section = 0; ; ) {
    const b0 = stream[pos], b1 = stream[pos + 1];
    if ((b0 === 0xff && b1 === 0xff) || (b0 === 0xf0 && b1 === 0xff)) {
      if (section === target) return [...stream.slice(0, pos), ...entries, ...stream.slice(pos)];
      // Doors are two-byte records from the marker to the section terminator.
      if (b0 === 0xf0) {
        pos += 2;
        while (!(stream[pos] === 0xff && stream[pos + 1] === 0xff)) pos += 2;
      }
      pos += 2;
      section++;
      continue;
    }
    pos += 3;
  }
};

/**
 * Plans the raw runs for one room from its target words, care mask and the solved stream's
 * replay, and returns the spliced stream plus the blob the engine will consume.
 */
const planRawRuns = (
  streamBytes: number[], tw: Uint16Array, care: Uint8Array, replayMap: Uint16Array,
): RawRunPlan => {
  const blob: number[] = [];
  let stream = streamBytes;
  let residual = 0;
  let runCount = 0;
  // Draw order: section B is the upper layer, section C the lower.
  for (const { layer, section } of [{ layer: 1, section: 1 }, { layer: 0, section: 2 }]) {
    const fix = new Uint8Array(4096);
    for (let cell = 0; cell < 4096; cell++) {
      const i = layer * 4096 + cell;
      if (!care[i] || replayMap[i] === tw[i]) continue;
      if ((tw[i] & 0x3ff) >= ART_LIMIT) { residual++; continue; }
      fix[cell] = 1;
    }
    const entries: number[] = [];
    for (const rect of coverRects(fix)) {
      const e = encodeObject(1, RAW_RUN_INDEX, 0, 0, rect.col, rect.row);
      const d = decodeObject(e[0], e[1], e[2]);
      if (d.kind !== 1 || d.index !== RAW_RUN_INDEX || d.col !== rect.col || d.row !== rect.row) {
        throw new Error(`raw-run object round-trip failed at ${rect.col},${rect.row}`);
      }
      entries.push(...e);
      blob.push(rect.w, rect.h);
      for (let y = 0; y < rect.h; y++) {
        for (let x = 0; x < rect.w; x++) {
          const word = tw[layer * 4096 + (rect.row + y) * 64 + rect.col + x];
          blob.push(word & 0xff, word >> 8);
        }
      }
      runCount++;
    }
    if (entries.length) stream = spliceIntoSection(stream, section, entries);
  }
  return { stream: Buffer.from(stream), runBlob: Buffer.from(blob), residual, runCount };
};

export { planRawRuns };
export type { RawRunPlan };
