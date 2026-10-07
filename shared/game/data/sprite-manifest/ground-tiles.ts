/* @layer shared-game @kind data */
/**
 * Five flat ground blocks, for previewing an arrangement on a real surface.
 *
 * The layout editor draws the HUD over a tiled ground instead of a flat colour,
 * because "invisible against the surface it was drawn on" is the defect class
 * this preview exists to catch, such as a dark silhouette on a dark floor or a dimmed
 * chip over grass. So these are the surfaces the HUD actually has to stay
 * legible over: turf, an indoor floor, sand, and water at two depths. Nothing
 * decorative and no scenery, just a single 16x16 block each, tiled by the consumer.
 *
 * Each one is a real map block cut with the `bg-tile` method: the eight
 * background sheets its screen loads, the four tilemap words that compose it,
 * and the palette selection that screen was running. See bg-tile-decoder.ts for
 * the word layout and bg-palettes.ts for why `upper` has to be spelled out.
 */
import type { SpriteDefinition } from './manifest';

/** The outdoor tileset: eight background sheets in VRAM slot order. */
const OUTDOOR_SHEETS = [58, 59, 60, 61, 83, 77, 62, 91];
/** Outdoor slots widened into the upper half of their palette row. */
const OUTDOOR_UPPER = [0, 3, 4, 5];
/** Outdoor palette selection: main mode, then aux1, aux2, aux3. */
const OUTDOOR_MODE = 0;
const OUTDOOR_AUX = [0, 0, 7];

/** The first indoor tileset, and the slots widened into the upper half. */
const INDOOR_SHEETS = [0, 1, 16, 6, 14, 31, 24, 15];
const INDOOR_UPPER = [0, 1, 2, 3];

const outdoor = (tiles: number[]) => ({
  method: 'bg-tile', sheets: OUTDOOR_SHEETS, upper: OUTDOOR_UPPER, tiles,
  paletteSet: 'overworld', palette: OUTDOOR_MODE, paletteAux: OUTDOOR_AUX,
});

const GROUND_TILE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'ground-grass',
    label: 'Grass',
    category: 'ground',
    extract: outdoor([0x488b, 0x08aa, 0x088b, 0x488b]),
  },
  {
    file: 'ground-floor',
    label: 'Indoor floor',
    category: 'ground',
    extract: {
      method: 'bg-tile', sheets: INDOOR_SHEETS, upper: INDOOR_UPPER,
      tiles: [0x0cec, 0x0ced, 0x0cfc, 0x0cfd],
      paletteSet: 'dungeon', palette: 0,
    },
  },
  {
    file: 'ground-sand',
    label: 'Sand',
    category: 'ground',
    extract: outdoor([0x0caa, 0x0caa, 0x0c8c, 0x0c9e]),
  },
  {
    file: 'ground-water-shallow',
    label: 'Shallow water',
    category: 'ground',
    extract: outdoor([0x1db4, 0x1dd7, 0x1dd7, 0x1db4]),
  },
  {
    file: 'ground-water-deep',
    label: 'Deep water',
    category: 'ground',
    extract: outdoor([0x1dcd, 0x5dcd, 0x1dc9, 0x5dc9]),
  },
];

export { GROUND_TILE_SPRITE_DEFINITIONS };
