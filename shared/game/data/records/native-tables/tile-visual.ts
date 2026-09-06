/* @layer shared-game @kind data */
/**
 * Collision-attribute byte → descriptive visual identity: what a tile IS, for a label a
 * person reads. Grouped from the same `case` groups as the behavior table
 * (`TileDetect_ExecuteInner`, core/zelda3/src/tile_detect.c:261-525), so a label can
 * never imply a distinction the engine does not make. Two consequences worth knowing:
 *
 * - Cases coalesce here. Many distinct behaviors look like the same thing (every door
 *   case that is not a shutter reads as a door frame), so labels repeat freely.
 * - One case is subdivided: C:391 `TileBehavior_Liftable` covers 0x50-0x56, which the
 *   engine itself distinguishes downstream via `kTile50data` and
 *   `kGetBestActionToPerformOnTile_a` (player.c:5553). That is what tells us which byte
 *   is a bush and which is a rock, so the split is derived, not guessed.
 *
 * Because the dispatcher's only context input is `bool is_indoors`, these two maps are
 * the complete keying. All 256 bytes are covered; the switch ends in `assert(0)` at
 * C:523 instead of a real `default:`.
 */
import type { TileVisual } from '@shared/game/data/types/tile-attrs-types';
import type { AttrGroup } from '@shared/game/data/native-tables/attr-group-map';
import { buildAttrMaps, range } from '@shared/game/data/native-tables/attr-group-map';
import { STRUCTURE_VISUAL_GROUPS } from './tile-visual-structures';

const TERRAIN_VISUAL_GROUPS: readonly AttrGroup<TileVisual>[] = [
  // C:262 TileBehavior_NothingOW is inert either way. The outdoor branch is what marks it
  // plain walkable ground, so indoors it reads as interior floor.
  {
    attrs: [
      0x00, 0x05, 0x06, 0x07, 0x14, 0x15, 0x16, 0x17, 0x21, 0x23, 0x24, 0x25,
      0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x41, 0x45, 0x47, 0x49, 0x5e, 0x5f, 0x61,
      0x62, 0x64, 0x65, 0x66, 0xa6, 0xa7, 0xbe, 0xbf, ...range(0xd0, 0xef),
    ],
    value: 'ground',
    interior: 'floor',
  },
  { attrs: [0x01, 0x02, 0x03, 0x26, 0x43], value: 'wall' }, // C:266 StandardCollision

  // C:270 / C:276 / C:283 are three cases that are terrain outdoors and solid indoors. The
  // attribute alone cannot say what the indoor graphic is, so 'wall' records only that it
  // blocks.
  { attrs: range(0x6c, 0x6f), value: 'ground', interior: 'wall' },
  { attrs: [0x04], value: 'thick-grass', interior: 'wall' },
  { attrs: [0x0b], value: 'deep-water', interior: 'wall' },

  { attrs: [0x08], value: 'deep-water' }, // C:291 DeepWater
  { attrs: [0x09], value: 'shallow-water' }, // C:294 ShallowWater
  { attrs: [0x0a], value: 'water-ladder' }, // C:297 ShortWaterLadder
  // C:300 / C:322 are the two overlay-mask cases. Both feed the same pair of layer-change
  // flags (player.c:4206-4218), one per level, so both read as steps between layers.
  { attrs: [0x0c], value: 'stair-steps' }, // OverlayMask_0C
  { attrs: [0x1c], value: 'stair-steps' }, // OverlayMask_1C
  { attrs: [0x0d], value: 'spikes' }, // C:303 SpikeFloor
  { attrs: [0x0e, 0x0f], value: 'ice' }, // C:307 GanonIce and C:310 PalaceIce look the same

  // In C:313 / C:317, 'Slope' is the cliff face proper and 'SlopeOuter' the outer corner
  // variant. Within each case the low two bits pick a direction, NOT a face/edge split.
  { attrs: range(0x10, 0x13), value: 'cliff-face' },
  { attrs: range(0x18, 0x1b), value: 'cliff-edge' },

  // Four staircase cases at C:325 / C:330 / C:339 / C:366, one staircase graphic.
  { attrs: [0x1d], value: 'stair-steps' },
  { attrs: [0x1e, 0x1f], value: 'stair-steps' },
  { attrs: [0x22, ...range(0x30, 0x37)], value: 'stair-steps' },
  { attrs: range(0x3d, 0x3f), value: 'stair-steps' },

  { attrs: [0x20, ...range(0xb0, 0xbd)], value: 'pit' }, // C:335 Pit is one case
  { attrs: [0x27], value: 'hookshot-post' }, // C:342 Hookshottables

  // Five ledge cases at C:346-C:365, one ledge graphic. Direction lives in the behavior.
  { attrs: range(0x28, 0x2f), value: 'ledge' },

  { attrs: [0x40], value: 'thick-grass' }, // C:371 ThickGrass
  { attrs: [0x44], value: 'spikes' }, // C:374 Spike covers spikes/cactus, NOT a dig patch
  { attrs: [0x46], value: 'plaque' }, // C:380 HylianPlaque
  { attrs: [0x48, 0x4a], value: 'diggable-patch' }, // C:384 DiggableGround
  { attrs: [0x4b], value: 'warp-tile' }, // C:388 Warp

  // C:391 TileBehavior_Liftable, subdivided by the engine's own downstream tables.
  // `kTile50data` (tile_detect.c:392) maps byte → group index i, and
  // `kGetBestActionToPerformOnTile_a[i]` (player.c:5553) is the glove level compared
  // against `link_item_gloves` (player.c:5588): 0 bare hands, 1 first glove, 2 second.
  // 0x50/0x51 additionally raise the dashable flag, and i == 0 (0x54) is the byte the
  // read action keys off (player.c:5582), giving bush, bush, sign.
  { attrs: [0x50, 0x51], value: 'bush' }, // i = 2, 3 → level 0, dashable
  { attrs: [0x54], value: 'sign' }, // i = 0 → level 0, readable facing up
  { attrs: [0x52, 0x55], value: 'light-rock' }, // i = 1, 5 → level 1
  { attrs: [0x53, 0x56], value: 'dark-rock' }, // i = 4, 6 → level 2

  { attrs: [0x57], value: 'bonk-rock' }, // C:406 BonkRocks
  { attrs: range(0x58, 0x5d), value: 'chest' }, // C:410 Chest
  { attrs: [0x63], value: 'chest' }, // C:434 MinigameChest is a separate case with the same look

  // C:423 RupeeTile applies indoors only. Outdoors the byte is plain walkable ground.
  { attrs: [0x60], value: 'ground', interior: 'rupee-floor' },

  { attrs: [0x67], value: 'crystal-peg' }, // C:440 CrystalPeg_Up is a crystal switch peg
  { attrs: range(0x68, 0x6b), value: 'conveyor' }, // C:445-454, four direction cases

  // C:505-522 are outdoor-only cases. Indoors the body is skipped, leaving inert floor.
  { attrs: [0x42], value: 'gravestone', interior: 'floor' }, // C:505 GraveStone
  // C:511 / C:517 both feed the ledge-hop checks alongside the real ledge flags
  // (player.c:5182), so they read as ledges instead of unknown terrain.
  { attrs: [0x4c, 0x4d], value: 'ledge', interior: 'floor' },
  { attrs: [0x4e, 0x4f], value: 'ledge', interior: 'floor' },
];

const visualMaps = buildAttrMaps<TileVisual>([
  ...TERRAIN_VISUAL_GROUPS,
  ...STRUCTURE_VISUAL_GROUPS,
]);

const OVERWORLD_TILE_VISUAL: Readonly<Record<number, TileVisual>> = visualMaps.overworld;
const INTERIOR_TILE_VISUAL: Readonly<Record<number, TileVisual>> = visualMaps.interior;

export { OVERWORLD_TILE_VISUAL, INTERIOR_TILE_VISUAL };
