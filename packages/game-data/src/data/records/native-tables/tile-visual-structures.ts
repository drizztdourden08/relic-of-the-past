/* @layer shared-game @kind data */
import type { TileVisual } from '../../types/tile-attrs-types';
import type { AttrGroup } from '../../native-tables/attr-group.type';

const STRUCTURE_VISUAL_GROUPS: readonly AttrGroup<TileVisual>[] = [
  { attrs: [{ from: 0x70, to: 0x7f }], value: 'pushable-block' },

  { attrs: [0x80, 0x81, { from: 0x84, to: 0x8d }], value: 'door-frame' },
  { attrs: [0x82, 0x83], value: 'door-frame' },
  { attrs: [0x8e, 0x8f], value: 'entrance-mat' },
  { attrs: [{ from: 0x90, to: 0x97 }], value: 'shutter' },
  { attrs: [{ from: 0x98, to: 0x9f }, { from: 0xa8, to: 0xaf }], value: 'shutter' },
  { attrs: [0xa0, 0xa1, 0xa4, 0xa5], value: 'door-frame' },
  { attrs: [0xa2, 0xa3], value: 'shutter' },
  { attrs: [{ from: 0xc0, to: 0xcf }], value: 'torch-sconce' },
  { attrs: [{ from: 0xf0, to: 0xff }], value: 'flaggable-wall' },
];

export { STRUCTURE_VISUAL_GROUPS };
