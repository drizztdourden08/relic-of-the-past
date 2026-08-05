/* @layer shared-game @kind data */
/**
 * Collision-attribute byte → mechanical behavior, transcribed group-for-group from
 * `TileDetect_ExecuteInner` (core/zelda3/src/tile_detect.c:261-525). Each entry
 * cites the `case` line it comes from, and the grouping is the switch's grouping:
 * where the engine puts two bytes in one case they share a behavior here, and where
 * it splits adjacent bytes across cases they are split here too.
 *
 * That dispatcher's only context input is `bool is_indoors`, so `OVERWORLD_TILE_BEHAVIOR`
 * and `INTERIOR_TILE_BEHAVIOR` are the complete keying — nothing else affects behavior.
 * Seven of the switch's eight `is_indoors` branches change the behavior class and show
 * up below as an `interior` value (C:271, 277, 284, 424, 506, 512, 518). The eighth,
 * C:263, only sets or omits an outdoor bookkeeping bit inside the same inert class, so
 * it carries no override.
 *
 * All 256 bytes are covered: the switch ends in `assert(0)` at C:523 rather than a real
 * `default:`, so anything missing here would be a byte the engine treats as impossible.
 */
import type { TileBehavior } from '../types/tile-attrs-types';
import type { AttrGroup } from './attr-group-map';
import { buildAttrMaps, range } from './attr-group-map';
import { STRUCTURE_BEHAVIOR_GROUPS } from './tile-behavior-structures';

const TERRAIN_BEHAVIOR_GROUPS: readonly AttrGroup<TileBehavior>[] = [
  // C:262 TileBehavior_NothingOW — inert. Outdoors it also raises the plain-walkable
  // bit; indoors the case body is skipped entirely. Same class either way.
  {
    attrs: [
      0x00, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17, 0x21, 0x23, 0x24, 0x25,
      0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x41, 0x45, 0x47, 0x49, 0x5e, 0x5f, 0x61,
      0x62, 0x64, 0x65, 0x66, 0xa6, 0xa7, 0xbe, 0xbf, ...range(0xd0, 0xef),
    ],
    value: 'nothing',
  },
  { attrs: [0x01, 0x02, 0x03, 0x26, 0x43], value: 'standard-collision' }, // C:266

  // C:270 — an unnamed case: solid indoors, inert outdoors.
  { attrs: range(0x6c, 0x6f), value: 'nothing', interior: 'standard-collision' },
  // C:276 — tall grass outdoors, plain collision indoors.
  { attrs: [0x04], value: 'thick-grass', interior: 'standard-collision' },
  // C:283 — an unnamed second deep-water byte (high-nibble flag), solid indoors.
  { attrs: [0x0b], value: 'deep-water', interior: 'standard-collision' },

  { attrs: [0x08], value: 'deep-water' }, // C:291 TileBehavior_DeepWater
  { attrs: [0x09], value: 'shallow-water' }, // C:294 TileBehavior_ShallowWater
  { attrs: [0x0a], value: 'short-water-ladder' }, // C:297 TileBehavior_ShortWaterLadder
  { attrs: [0x0c], value: 'moving-floor' }, // C:300 TileBehavior_OverlayMask_0C
  { attrs: [0x0d], value: 'spike-floor' }, // C:303 TileBehavior_SpikeFloor
  { attrs: [0x0e], value: 'ganon-ice' }, // C:307 TileBehavior_GanonIce
  { attrs: [0x0f], value: 'palace-ice' }, // C:310 TileBehavior_PalaceIce

  // C:313 / C:317 — the low two bits pick one of four diagonal directions within each
  // case, so all four bytes of a run share the case's behavior.
  { attrs: range(0x10, 0x13), value: 'slope' }, // TileBehavior_Slope
  { attrs: range(0x18, 0x1b), value: 'slope-outer' }, // TileBehavior_SlopeOuter

  { attrs: [0x1c], value: 'water-staircase' }, // C:322 TileBehavior_OverlayMask_1C
  { attrs: [0x1d], value: 'stairs-single-layer' }, // C:325 TileBehavior_NorthSingleLayerStairs
  { attrs: [0x1e, 0x1f], value: 'stairs-swap-layer' }, // C:330 TileBehavior_NorthSwapLayerStairs

  // C:335 TileBehavior_Pit — 0x20 and the 0xb0-0xbd run are ONE case.
  { attrs: [0x20, ...range(0xb0, 0xbd)], value: 'pit' },
  // C:339 TileHandlerIndoor_22 — raises only the visible-stair flag, no transition.
  { attrs: [0x22, ...range(0x30, 0x37)], value: 'stairs-visible' },

  { attrs: [0x27], value: 'hookshottable' }, // C:342 TileBehavior_Hookshottables
  { attrs: [0x28], value: 'ledge-north' }, // C:346 TileBehavior_Ledge_North
  { attrs: [0x29], value: 'ledge-south' }, // C:350 TileBehavior_Ledge_South
  { attrs: [0x2a, 0x2b], value: 'ledge-east-west' }, // C:354 TileBehavior_Ledge_EastWest
  // C:358 / C:362 — the two diagonal cases interleave: even bytes north, odd bytes south.
  { attrs: [0x2c, 0x2e], value: 'ledge-north-diagonal' }, // TileBehavior_Ledge_NorthDiagonal
  { attrs: [0x2d, 0x2f], value: 'ledge-south-diagonal' }, // TileBehavior_Ledge_SouthDiagonal

  // C:366 TileHandlerIndoor_3E — the fifth staircase case, distinct from C:325/C:330:
  // it raises the in-room staircase flag in the high nibble, which selects a different
  // submodule (player.c:4297).
  { attrs: range(0x3d, 0x3f), value: 'indoor-stairs-3e' },

  { attrs: [0x40], value: 'thick-grass' }, // C:371 TileBehavior_ThickGrass
  { attrs: [0x44], value: 'spike' }, // C:374 TileBehavior_Spike — damage, not diggable
  { attrs: [0x46], value: 'hylian-plaque' }, // C:380 TileBehavior_HylianPlaque
  { attrs: [0x48, 0x4a], value: 'diggable-ground' }, // C:384 TileBehavior_DiggableGround
  { attrs: [0x4b], value: 'warp' }, // C:388 TileBehavior_Warp — 0x49 is NOT part of this
  { attrs: range(0x50, 0x56), value: 'liftable' }, // C:391 TileBehavior_Liftable
  { attrs: [0x57], value: 'bonk-rocks' }, // C:406 TileBehavior_BonkRocks
  { attrs: range(0x58, 0x5d), value: 'chest' }, // C:410 TileBehavior_Chest

  // C:423 TileBehavior_RupeeTile — only indoors; outdoors the byte is plain walkable.
  { attrs: [0x60], value: 'nothing', interior: 'rupee-tile' },

  { attrs: [0x63], value: 'minigame-chest' }, // C:434 TileBehavior_MinigameChest
  { attrs: [0x67], value: 'crystal-peg-up' }, // C:440 TileBehavior_CrystalPeg_Up
  { attrs: [0x68], value: 'conveyor-up' }, // C:445 TileBehavior_Conveyor_Upwards
  { attrs: [0x69], value: 'conveyor-down' }, // C:448 TileBehavior_Conveyor_Downwards
  { attrs: [0x6a], value: 'conveyor-left' }, // C:451 TileBehavior_Conveyor_Leftwards
  { attrs: [0x6b], value: 'conveyor-right' }, // C:454 TileBehavior_Conveyor_Rightwards

  // C:505-522 — the switch's tail: three outdoor-only cases whose bodies are wrapped in
  // `if (!is_indoors)`, so indoors they do nothing whatsoever (not even collision).
  { attrs: [0x42], value: 'gravestone', interior: 'nothing' }, // C:505 TileBehavior_GraveStone
  { attrs: [0x4c, 0x4d], value: 'unused-corner', interior: 'nothing' }, // C:511
  { attrs: [0x4e, 0x4f], value: 'eastern-ruins-corner', interior: 'nothing' }, // C:517
];

const behaviorMaps = buildAttrMaps<TileBehavior>([
  ...TERRAIN_BEHAVIOR_GROUPS,
  ...STRUCTURE_BEHAVIOR_GROUPS,
]);

const OVERWORLD_TILE_BEHAVIOR: Readonly<Record<number, TileBehavior>> = behaviorMaps.overworld;
const INTERIOR_TILE_BEHAVIOR: Readonly<Record<number, TileBehavior>> = behaviorMaps.interior;

export { OVERWORLD_TILE_BEHAVIOR, INTERIOR_TILE_BEHAVIOR };
