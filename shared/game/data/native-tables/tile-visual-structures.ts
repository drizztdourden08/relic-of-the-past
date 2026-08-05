/* @layer shared-game @kind data */
/**
 * Visual identity for the structural half of the collision switch
 * (core/zelda3/src/tile_detect.c:457-503). Split out of `tile-visual.ts` only to keep
 * both files inside the line budget; `tile-visual.ts` concatenates the two lists.
 *
 * The engine names the difference these labels lean on: a case called `...ShutterDoor`
 * also raises the second collision nibble (a door that has to be opened for you), while
 * `...ManualDoor` and the two `TileHandlerIndoor_8x` cases do not. Nothing here branches
 * on `is_indoors`, so no group carries an `interior` value.
 */
import type { TileVisual } from '../types/tile-attrs-types';
import type { AttrGroup } from './attr-group-map';
import { range } from './attr-group-map';

const STRUCTURE_VISUAL_GROUPS: readonly AttrGroup<TileVisual>[] = [
  // C:457 TileBehavior_ManipulablyReplaced — the engine draws no line inside this run,
  // so neither do we: one label for all sixteen bytes.
  { attrs: range(0x70, 0x7f), value: 'pushable-block' },

  { attrs: [0x80, 0x81, ...range(0x84, 0x8d)], value: 'door-frame' }, // C:463
  { attrs: [0x82, 0x83], value: 'door-frame' }, // C:467 — separate case, same look
  { attrs: [0x8e, 0x8f], value: 'entrance-mat' }, // C:471 TileBehavior_Entrance
  { attrs: range(0x90, 0x97), value: 'shutter' }, // C:476 LayerToggleShutterDoor
  { attrs: [...range(0x98, 0x9f), ...range(0xa8, 0xaf)], value: 'shutter' }, // C:481
  { attrs: [0xa0, 0xa1, 0xa4, 0xa5], value: 'door-frame' }, // C:486 ...ManualDoor
  { attrs: [0xa2, 0xa3], value: 'shutter' }, // C:491 DungeonToggleShutterDoor
  { attrs: range(0xc0, 0xcf), value: 'torch-sconce' }, // C:496 LightableTorch
  { attrs: range(0xf0, 0xff), value: 'flaggable-wall' }, // C:500 FlaggableDoor
];

export { STRUCTURE_VISUAL_GROUPS };
