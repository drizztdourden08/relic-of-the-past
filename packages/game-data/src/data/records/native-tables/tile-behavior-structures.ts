/* @layer shared-game @kind data */
import type { TileBehavior } from '../../types/tile-attrs-types';
import type { AttrGroup } from '../../native-tables/attr-group.type';

const STRUCTURE_BEHAVIOR_GROUPS: readonly AttrGroup<TileBehavior>[] = [
  { attrs: [{ from: 0x70, to: 0x7f }], value: 'manipulably-replaced' },

  { attrs: [0x80, 0x81, { from: 0x84, to: 0x8d }], value: 'indoor-door-80' },
  { attrs: [0x82, 0x83], value: 'indoor-door-82' },
  { attrs: [0x8e, 0x8f], value: 'entrance' },

  { attrs: [{ from: 0x90, to: 0x97 }], value: 'layer-toggle-shutter' },

  {
    attrs: [{ from: 0x98, to: 0x9f }, { from: 0xa8, to: 0xaf }],
    value: 'layer-dungeon-toggle-shutter',
  },

  { attrs: [0xa0, 0xa1, 0xa4, 0xa5], value: 'dungeon-toggle-manual-door' },
  { attrs: [0xa2, 0xa3], value: 'dungeon-toggle-shutter' },
  { attrs: [{ from: 0xc0, to: 0xcf }], value: 'lightable-torch' },
  { attrs: [{ from: 0xf0, to: 0xff }], value: 'flaggable-door' },
];

export { STRUCTURE_BEHAVIOR_GROUPS };
