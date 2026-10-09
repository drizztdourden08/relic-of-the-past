/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const OUTDOOR_SHEETS = [58, 59, 60, 61, 83, 77, 62, 91];
const OUTDOOR_UPPER = [0, 3, 4, 5];
const OUTDOOR_MODE = 0;
const OUTDOOR_AUX = [0, 0, 7];

const INDOOR_SHEETS = [0, 1, 16, 6, 14, 31, 24, 15];
const INDOOR_UPPER = [0, 1, 2, 3];

const GROUND_TILE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'ground-grass',
    label: 'Grass',
    category: 'ground',
    extract: {
      method: 'bg-tile', sheets: OUTDOOR_SHEETS, upper: OUTDOOR_UPPER, tiles: [0x488b, 0x08aa, 0x088b, 0x488b],
      paletteSet: 'overworld', palette: OUTDOOR_MODE, paletteAux: OUTDOOR_AUX,
    },
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
    extract: {
      method: 'bg-tile', sheets: OUTDOOR_SHEETS, upper: OUTDOOR_UPPER, tiles: [0x0caa, 0x0caa, 0x0c8c, 0x0c9e],
      paletteSet: 'overworld', palette: OUTDOOR_MODE, paletteAux: OUTDOOR_AUX,
    },
  },
  {
    file: 'ground-water-shallow',
    label: 'Shallow water',
    category: 'ground',
    extract: {
      method: 'bg-tile', sheets: OUTDOOR_SHEETS, upper: OUTDOOR_UPPER, tiles: [0x1db4, 0x1dd7, 0x1dd7, 0x1db4],
      paletteSet: 'overworld', palette: OUTDOOR_MODE, paletteAux: OUTDOOR_AUX,
    },
  },
  {
    file: 'ground-water-deep',
    label: 'Deep water',
    category: 'ground',
    extract: {
      method: 'bg-tile', sheets: OUTDOOR_SHEETS, upper: OUTDOOR_UPPER, tiles: [0x1dcd, 0x5dcd, 0x1dc9, 0x5dc9],
      paletteSet: 'overworld', palette: OUTDOOR_MODE, paletteAux: OUTDOOR_AUX,
    },
  },
];

export { GROUND_TILE_SPRITE_DEFINITIONS };
