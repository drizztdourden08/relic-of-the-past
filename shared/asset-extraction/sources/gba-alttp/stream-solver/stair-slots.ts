/* @layer shared-asset-extraction @kind logic */
/**
 * Makes each staircase claim the header slot measured on hardware.
 *
 * The slot a staircase gets is decided by the order stair objects register across the
 * engine's stair buckets — a cascade this side never re-derives. Instead the solver
 * enumerates candidates (each solved staircase kept as-is or swapped for another stair
 * variant that draws acceptably at the same spot) and orderings, stages each candidate
 * stream in the engine, and reads back the slot attribute the engine actually derived.
 * Among configurations whose derived attributes match the measurements, the one whose
 * replay damages the room least wins.
 */
import { replay } from './room-attempt';
import type { FloorPatterns } from './base-map';
import type { FloorCombo, StreamSection, Templates } from './room-attempt';
import type { RoomDrawProbe } from './probe.type';
import type { StampCatalogue } from './stamp-catalogue';
import type { StairSlotRequirement } from '../../../extensions/second-cartridge-stair-slots';

interface StairPlacement {
  section: number;
  position: number;
  object: { id: number; col: number; row: number };
}

interface OrderedResult {
  sections: StreamSection[];
  mism: number;
}

/** How far from the measured centre the slot attribute may sit (the write lands nearby). */
const REGION = 3;
/**
 * Variants tried per staircase. A staircase whose art survives in the baked map keeps a
 * narrow list — its type is essentially known. One whose art is buried under later objects
 * gets a wide one: the original stream carried such stairs for what they REGISTER, their
 * art overdrawn, so its type is only recoverable from the slot the engine must derive.
 * Every candidate draws at the front of section A, before everything else, so wrong art
 * is overdrawn by the rest of the cover and the replay mismatch stays the judge.
 */
const NARROW_VARIANTS = 3;
const WIDE_VARIANTS = 10;
/** Art below this many matching cells marks a staircase as buried, widening its search. */
const BURIED_THRESHOLD = 8;

const collectStairs = (st: StampCatalogue, sections: StreamSection[]): StairPlacement[] => {
  const found: StairPlacement[] = [];
  sections.forEach((section, sectionIndex) => {
    section.objects.forEach((object, position) => {
      if (st.isStair[object.id]) found.push({ section: sectionIndex, position, object });
    });
  });
  return found;
};

/** Every in-bounds stair stamp at this exact placement, best art first; width by burial. */
const variantsAt = (
  st: StampCatalogue, tw: Uint16Array, care: Uint8Array, col: number, row: number,
): number[] => {
  const scored: { id: number; good: number; bad: number }[] = [];
  for (let si = 0; si < st.count; si++) {
    if (!st.isStair[si] || st.state[si] !== 0 || st.upper[si] !== 0) continue;
    const a = st.off[si];
    const b = st.off[si + 1];
    if (b === a) continue;
    const delta = (row - 8) * 64 + (col - 8);
    let good = 0, bad = 0, out = false;
    for (let q = a; q < b; q++) {
      const cell = st.cCell[q] + delta;
      if (cell < 0 || cell >= 4096) { out = true; break; }
      const i2 = st.cLayer[q] * 4096 + cell;
      if (!care[i2]) continue;
      if (tw[i2] === st.cWord[q]) good++; else bad++;
    }
    if (!out) scored.push({ id: si, good, bad });
  }
  scored.sort((x, y) => y.good - x.good || x.bad - y.bad);
  const width = (scored[0]?.good ?? 0) >= BURIED_THRESHOLD ? NARROW_VARIANTS : WIDE_VARIANTS;
  return scored.slice(0, width).map(s => s.id);
};

const permutations = <T>(items: T[]): T[][] => {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(rest => [item, ...rest]));
};

/** The sections with every stair object stripped, and the chosen ones prefixed to section A. */
const withStairs = (
  sections: StreamSection[], stairs: StairPlacement[],
  ordered: { id: number; col: number; row: number }[],
): StreamSection[] => {
  const strip = new Set(stairs.map(s => `${s.section}:${s.position}`));
  const stripped = sections.map((section, sectionIndex) => ({
    doors: section.doors,
    objects: section.objects.filter((_, position) => !strip.has(`${sectionIndex}:${position}`)),
  }));
  return [{ doors: stripped[0].doors, objects: [...ordered, ...stripped[0].objects] }, stripped[1], stripped[2]];
};

const satisfies = (attrs: Uint8Array, spec: readonly StairSlotRequirement[]): boolean =>
  spec.every(({ row, col, attr }) => {
    for (let dr = -REGION; dr <= REGION; dr++) {
      for (let dc = -REGION; dc <= REGION; dc++) {
        if (attrs[(row + dr) * 64 + (col + dc)] === attr) return true;
      }
    }
    return false;
  });

/**
 * Returns re-ordered sections whose engine-derived slot attributes match the measurements —
 * with the replay mismatch of the winner — or null when no candidate configuration does.
 */
const orderStairsToMeasuredSlots = (
  probe: RoomDrawProbe, st: StampCatalogue, floors: FloorPatterns, templates: Templates,
  combo: FloorCombo, tw: Uint16Array, care: Uint8Array, sections: StreamSection[],
  spec: readonly StairSlotRequirement[],
  toBytes: (sections: StreamSection[]) => Uint8Array,
): OrderedResult | null => {
  const stairs = collectStairs(st, sections);
  if (!stairs.length) return null;
  const options = stairs.map(s => variantsAt(st, tw, care, s.object.col, s.object.row));

  const mismatchOf = (candidate: StreamSection[]): number => {
    const map = replay(st, floors, templates, combo, candidate);
    let mism = 0;
    for (let i = 0; i < 8192; i++) if (care[i] && map[i] !== tw[i]) mism++;
    return mism;
  };

  let best: OrderedResult | null = null;
  const consider = (chosen: number[]): void => {
    const placed = chosen.map((id, i) => ({ id, col: stairs[i].object.col, row: stairs[i].object.row }));
    for (const order of permutations(placed)) {
      const candidate = withStairs(sections, stairs, order);
      if (!satisfies(probe.streamAttrs(toBytes(candidate)), spec)) continue;
      const mism = mismatchOf(candidate);
      if (!best || mism < best.mism) best = { sections: candidate, mism };
    }
  };
  const choose = (index: number, chosen: number[]): void => {
    if (index === stairs.length) {
      consider(chosen);
      return;
    }
    for (const id of options[index]) {
      chosen.push(id);
      choose(index + 1, chosen);
      chosen.pop();
    }
  };
  choose(0, []);
  return best;
};

export { orderStairsToMeasuredSlots };
