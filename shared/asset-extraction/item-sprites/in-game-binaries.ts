/* @layer shared-asset-extraction @kind logic */
/**
 * The binaries an extraction emits beside the PNGs: pictures the core draws itself,
 * each quantized to one fixed sprite palette row and encoded as 4bpp tiles. One
 * builder per family; each one runs only when the definitions name every picture
 * it needs, and reports a picture that came out missing or the wrong size instead
 * of writing a short file.
 */
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';
import { buildCapacityIconsFile, CAPACITY_ICON_FAMILIES, CAPACITY_ICONS_FILE } from './capacity-icons';
import { buildCurrencySymbolsFile, CURRENCY_SYMBOL_FILES, CURRENCY_SYMBOLS_FILE } from './currency-symbols';
import { buildGearIconsFile, GEAR_ICON_FILES, GEAR_ICONS_FILE } from './gear-icons';
import { buildQuiverIconFile, QUIVER_ICON_FILE, QUIVER_ICON_SPRITE } from './quiver-icon';

type Pictures = ReadonlyMap<string, ImageBuffer>;
type PaletteRows = readonly (readonly RGBA[])[];
type Builder = (pictures: Pictures, paletteRows: PaletteRows) => Uint8Array | null;

interface InGameBinary {
  name: string;
  /** The definition file names it needs; it is skipped when any is not defined. */
  files: readonly string[];
  build: Builder;
  /** What went wrong when a defined picture still did not yield a file. */
  failure: string;
}

const IN_GAME_BINARIES: readonly InGameBinary[] = [
  // The capacity upgrade icons: one binary from the four composites (capacity-icons.ts).
  {
    name: CAPACITY_ICONS_FILE, files: CAPACITY_ICON_FAMILIES, build: buildCapacityIconsFile,
    failure: 'an upgrade sprite is missing or not 16×16',
  },
  // The gear pictures, whose receipt colours the game otherwise takes from the
  // player's own equipment (gear-icons.ts).
  {
    name: GEAR_ICONS_FILE, files: GEAR_ICON_FILES, build: buildGearIconsFile,
    failure: 'a gear sprite is missing or not 16×16',
  },
  // The quiver's own picture, which the retro bow otherwise shows as an arrow (quiver-icon.ts).
  {
    name: QUIVER_ICON_FILE, files: [QUIVER_ICON_SPRITE], build: buildQuiverIconFile,
    failure: 'the quiver sprite is missing or not 16×16',
  },
  // The shop price symbols, drawn beside a randomized shelf's digits (currency-symbols.ts).
  {
    name: CURRENCY_SYMBOLS_FILE, files: CURRENCY_SYMBOL_FILES, build: buildCurrencySymbolsFile,
    failure: 'a currency sprite is missing or larger than 16×8',
  },
];

interface BinaryBuffers {
  buffers: { name: string; bytes: Uint8Array }[];
  errors: string[];
}

/** Every binary whose pictures `defined` names, from the extracted pictures and the ROM's rows. */
const buildInGameBinaries = (
  pictures: Pictures, defined: ReadonlySet<string>, paletteRows: PaletteRows,
): BinaryBuffers => {
  const result: BinaryBuffers = { buffers: [], errors: [] };
  for (const binary of IN_GAME_BINARIES) {
    if (!binary.files.every((file) => defined.has(file))) continue;
    const bytes = binary.build(pictures, paletteRows);
    if (bytes) result.buffers.push({ name: binary.name, bytes });
    else result.errors.push(`${binary.name}: not built, ${binary.failure}`);
  }
  return result;
};

/** The binaries' file names, for the storage layer's list of what an extraction writes. */
const IN_GAME_BINARY_FILES: readonly string[] = IN_GAME_BINARIES.map((binary) => binary.name);

export { buildInGameBinaries, IN_GAME_BINARY_FILES };
