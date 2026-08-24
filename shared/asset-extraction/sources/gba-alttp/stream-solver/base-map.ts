/* @layer shared-asset-extraction @kind logic */
/**
 * What a room looks like before its objects draw: floor fill plus layout template.
 *
 * The floor pass tiles a 4x2 block per nibble of the stream's floor byte — lower map from the
 * low nibble, upper from the high — and the pattern data is the engine's own, read back out of
 * the compiled base container by name. The layout template then draws on top of the lower map.
 */
import { readNamedAsset } from './container-reader';
import { WORD_MASK } from './stamp-catalogue';

/** The engine's predefined tile data; the first 16 8-word entries are the floor patterns. */
const FLOOR_SOURCE_ASSET = 'kPredefinedTileData';
const FLOOR_PATTERNS = 16;
const WORDS_PER_PATTERN = 8;

type FloorPatterns = Uint16Array[];

const readFloorPatterns = (baseContainer: Buffer): FloorPatterns => {
  const data = readNamedAsset(baseContainer, FLOOR_SOURCE_ASSET);
  const patterns: FloorPatterns = [];
  for (let nibble = 0; nibble < FLOOR_PATTERNS; nibble++) {
    const pattern = new Uint16Array(WORDS_PER_PATTERN);
    for (let k = 0; k < WORDS_PER_PATTERN; k++) {
      pattern[k] = data.readUInt16LE((nibble * WORDS_PER_PATTERN + k) * 2) & WORD_MASK;
    }
    patterns.push(pattern);
  }
  return patterns;
};

/**
 * Both maps as one 8192-word array (lower 0..4095, upper 4096..8191), floor-filled and with
 * the layout template applied — the state every stream starts drawing from.
 */
const buildBase = (
  floors: FloorPatterns,
  templates: { cells: Int32Array; words: Uint16Array }[],
  lowNibble: number,
  highNibble: number,
  layout: number,
): Uint16Array => {
  const base = new Uint16Array(8192);
  const lower = floors[lowNibble];
  const upper = floors[highNibble];
  for (let row = 0; row < 64; row++) {
    const phase = (row & 1) * 4;
    for (let col = 0; col < 64; col++) {
      base[row * 64 + col] = lower[phase + (col & 3)];
      base[4096 + row * 64 + col] = upper[phase + (col & 3)];
    }
  }
  const template = templates[layout];
  for (let k = 0; k < template.cells.length; k++) base[template.cells[k]] = template.words[k];
  return base;
};

export { buildBase, readFloorPatterns };
export type { FloorPatterns };
