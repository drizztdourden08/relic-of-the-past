/* @layer shared-game @kind data */
import type { TileVisual } from '../../types/tile-attrs-types';
import type { AttrGroup } from '../../native-tables/attr-group.type';

const TERRAIN_VISUAL_GROUPS: readonly AttrGroup<TileVisual>[] = [
  {
    attrs: [
      0x00, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17, 0x21, 0x23, 0x24, 0x25,
      0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x41, 0x45, 0x47, 0x49, 0x5e, 0x5f, 0x61,
      0x62, 0x64, 0x65, 0x66, 0xa6, 0xa7, 0xbe, 0xbf, { from: 0xd0, to: 0xef },
    ],
    value: 'ground',
    interior: 'floor',
  },
  { attrs: [0x01, 0x02, 0x03, 0x26, 0x43], value: 'wall' },

  { attrs: [{ from: 0x6c, to: 0x6f }], value: 'ground', interior: 'wall' },
  { attrs: [0x04], value: 'thick-grass', interior: 'wall' },
  { attrs: [0x0b], value: 'deep-water', interior: 'wall' },

  { attrs: [0x08], value: 'deep-water' },
  { attrs: [0x09], value: 'shallow-water' },
  { attrs: [0x0a], value: 'water-ladder' },
  { attrs: [0x0c], value: 'stair-steps' },
  { attrs: [0x1c], value: 'stair-steps' },
  { attrs: [0x0d], value: 'spikes' },
  { attrs: [0x0e, 0x0f], value: 'ice' },

  { attrs: [{ from: 0x10, to: 0x13 }], value: 'cliff-face' },
  { attrs: [{ from: 0x18, to: 0x1b }], value: 'cliff-edge' },

  { attrs: [0x1d], value: 'stair-steps' },
  { attrs: [0x1e, 0x1f], value: 'stair-steps' },
  { attrs: [0x22, { from: 0x30, to: 0x37 }], value: 'stair-steps' },
  { attrs: [{ from: 0x3d, to: 0x3f }], value: 'stair-steps' },

  { attrs: [0x20, { from: 0xb0, to: 0xbd }], value: 'pit' },
  { attrs: [0x27], value: 'hookshot-post' },

  { attrs: [{ from: 0x28, to: 0x2f }], value: 'ledge' },

  { attrs: [0x40], value: 'thick-grass' },
  { attrs: [0x44], value: 'spikes' },
  { attrs: [0x46], value: 'plaque' },
  { attrs: [0x48, 0x4a], value: 'diggable-patch' },
  { attrs: [0x4b], value: 'warp-tile' },

  { attrs: [0x50, 0x51], value: 'bush' },
  { attrs: [0x54], value: 'sign' },
  { attrs: [0x52, 0x55], value: 'light-rock' },
  { attrs: [0x53, 0x56], value: 'dark-rock' },

  { attrs: [0x57], value: 'bonk-rock' },
  { attrs: [{ from: 0x58, to: 0x5d }], value: 'chest' },
  { attrs: [0x63], value: 'chest' },

  { attrs: [0x60], value: 'ground', interior: 'rupee-floor' },

  { attrs: [0x67], value: 'crystal-peg' },
  { attrs: [{ from: 0x68, to: 0x6b }], value: 'conveyor' },

  { attrs: [0x42], value: 'gravestone', interior: 'floor' },
  { attrs: [0x4c, 0x4d], value: 'ledge', interior: 'floor' },
  { attrs: [0x4e, 0x4f], value: 'ledge', interior: 'floor' },
];

export { TERRAIN_VISUAL_GROUPS };
