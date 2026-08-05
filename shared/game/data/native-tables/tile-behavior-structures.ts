/* @layer shared-game @kind data */
/**
 * Behavior groups for the structural half of the collision switch — the doors,
 * shutters, torches and manipulable blocks at core/zelda3/src/tile_detect.c:457-503.
 * Split out of `tile-behavior.ts` only to keep both files inside the line budget;
 * `tile-behavior.ts` concatenates the two lists before building its maps.
 *
 * None of these cases branches on `is_indoors`, so no group here carries an
 * `interior` value: every one of these bytes behaves identically in both contexts,
 * even though in practice only interior screens ever stamp them.
 */
import type { TileBehavior } from '../types/tile-attrs-types';
import type { AttrGroup } from './attr-group-map';
import { range } from './attr-group-map';

const STRUCTURE_BEHAVIOR_GROUPS: readonly AttrGroup<TileBehavior>[] = [
  // C:457 TileBehavior_ManipulablyReplaced — one case for the whole run. The engine
  // makes no distinction between the low and high bytes of it.
  { attrs: range(0x70, 0x7f), value: 'manipulably-replaced' },

  // C:463 TileHandlerIndoor_80 — note the case list SKIPS 0x82 and 0x83.
  { attrs: [0x80, 0x81, ...range(0x84, 0x8d)], value: 'indoor-door-80' },
  { attrs: [0x82, 0x83], value: 'indoor-door-82' }, // C:467 TileHandlerIndoor_82
  { attrs: [0x8e, 0x8f], value: 'entrance' }, // C:471 TileBehavior_Entrance

  // C:476 TileBehavior_LayerToggleShutterDoor
  { attrs: range(0x90, 0x97), value: 'layer-toggle-shutter' },

  // C:481 TileBehavior_LayerAndDungeonToggleShutterDoor — one case spanning two
  // non-adjacent runs, 0x98-0x9f and 0xa8-0xaf.
  {
    attrs: [...range(0x98, 0x9f), ...range(0xa8, 0xaf)],
    value: 'layer-dungeon-toggle-shutter',
  },

  // C:486 TileBehavior_DungeonToggleManualDoor — again skipping 0xa2/0xa3.
  { attrs: [0xa0, 0xa1, 0xa4, 0xa5], value: 'dungeon-toggle-manual-door' },
  { attrs: [0xa2, 0xa3], value: 'dungeon-toggle-shutter' }, // C:491
  { attrs: range(0xc0, 0xcf), value: 'lightable-torch' }, // C:496 TileBehavior_LightableTorch
  { attrs: range(0xf0, 0xff), value: 'flaggable-door' }, // C:500 TileBehavior_FlaggableDoor
];

export { STRUCTURE_BEHAVIOR_GROUPS };
