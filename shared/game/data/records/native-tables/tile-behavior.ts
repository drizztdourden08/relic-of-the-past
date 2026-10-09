/* @layer shared-game @kind data */
import type { TileBehavior } from '@shared/game/data/types/tile-attrs-types';
import type { AttrGroup } from '@shared/game/data/native-tables/attr-group.type';

const TERRAIN_BEHAVIOR_GROUPS: readonly AttrGroup<TileBehavior>[] = [
  {
    attrs: [
      0x00, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17, 0x21, 0x23, 0x24, 0x25,
      0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x41, 0x45, 0x47, 0x49, 0x5e, 0x5f, 0x61,
      0x62, 0x64, 0x65, 0x66, 0xa6, 0xa7, 0xbe, 0xbf, { from: 0xd0, to: 0xef },
    ],
    value: 'nothing',
  },
  { attrs: [0x01, 0x02, 0x03, 0x26, 0x43], value: 'standard-collision' },

  { attrs: [{ from: 0x6c, to: 0x6f }], value: 'nothing', interior: 'standard-collision' },
  { attrs: [0x04], value: 'thick-grass', interior: 'standard-collision' },
  { attrs: [0x0b], value: 'deep-water', interior: 'standard-collision' },

  { attrs: [0x08], value: 'deep-water' },
  { attrs: [0x09], value: 'shallow-water' },
  { attrs: [0x0a], value: 'short-water-ladder' },
  { attrs: [0x0c], value: 'moving-floor' },
  { attrs: [0x0d], value: 'spike-floor' },
  { attrs: [0x0e], value: 'ganon-ice' },
  { attrs: [0x0f], value: 'palace-ice' },

  { attrs: [{ from: 0x10, to: 0x13 }], value: 'slope' },
  { attrs: [{ from: 0x18, to: 0x1b }], value: 'slope-outer' },

  { attrs: [0x1c], value: 'water-staircase' },
  { attrs: [0x1d], value: 'stairs-single-layer' },
  { attrs: [0x1e, 0x1f], value: 'stairs-swap-layer' },

  { attrs: [0x20, { from: 0xb0, to: 0xbd }], value: 'pit' },
  { attrs: [0x22, { from: 0x30, to: 0x37 }], value: 'stairs-visible' },

  { attrs: [0x27], value: 'hookshottable' },
  { attrs: [0x28], value: 'ledge-north' },
  { attrs: [0x29], value: 'ledge-south' },
  { attrs: [0x2a, 0x2b], value: 'ledge-east-west' },
  { attrs: [0x2c, 0x2e], value: 'ledge-north-diagonal' },
  { attrs: [0x2d, 0x2f], value: 'ledge-south-diagonal' },

  { attrs: [{ from: 0x3d, to: 0x3f }], value: 'indoor-stairs-3e' },

  { attrs: [0x40], value: 'thick-grass' },
  { attrs: [0x44], value: 'spike' },
  { attrs: [0x46], value: 'hylian-plaque' },
  { attrs: [0x48, 0x4a], value: 'diggable-ground' },
  { attrs: [0x4b], value: 'warp' },
  { attrs: [{ from: 0x50, to: 0x56 }], value: 'liftable' },
  { attrs: [0x57], value: 'bonk-rocks' },
  { attrs: [{ from: 0x58, to: 0x5d }], value: 'chest' },

  { attrs: [0x60], value: 'nothing', interior: 'rupee-tile' },

  { attrs: [0x63], value: 'minigame-chest' },
  { attrs: [0x67], value: 'crystal-peg-up' },
  { attrs: [0x68], value: 'conveyor-up' },
  { attrs: [0x69], value: 'conveyor-down' },
  { attrs: [0x6a], value: 'conveyor-left' },
  { attrs: [0x6b], value: 'conveyor-right' },

  { attrs: [0x42], value: 'gravestone', interior: 'nothing' },
  { attrs: [0x4c, 0x4d], value: 'unused-corner', interior: 'nothing' },
  { attrs: [0x4e, 0x4f], value: 'eastern-ruins-corner', interior: 'nothing' },
];

export { TERRAIN_BEHAVIOR_GROUPS };
