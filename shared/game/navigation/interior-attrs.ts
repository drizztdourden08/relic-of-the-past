/* @layer shared-game @kind logic */
/** Interior tile attribute overrides + context → map selector. */
import type { TileAttrDef, TileAttrContext } from './tile-attrs-types';
import { OVERWORLD_TILE_ATTRS } from './overworld-attrs';

const buildInteriorAttrs = (): Readonly<Record<number, TileAttrDef>> => {
  const t = { ...(OVERWORLD_TILE_ATTRS as Record<number, TileAttrDef>) };

  // Indoors overrides (reverse-engineered from TileDetect_ExecuteInner is_indoors logic)
  t[0x04] = { pass: 'blocked', labels: ['wall'], cat: 'wall' }; // thick grass outdoors, blocked indoors
  t[0x0B] = { pass: 'blocked', labels: ['wall'], cat: 'wall' }; // deep water outdoors, blocked indoors
  t[0x6C] = { pass: 'blocked', labels: ['wall'], cat: 'wall' };
  t[0x6D] = { pass: 'blocked', labels: ['wall'], cat: 'wall' };
  t[0x6E] = { pass: 'blocked', labels: ['wall'], cat: 'wall' };
  t[0x6F] = { pass: 'blocked', labels: ['wall'], cat: 'wall' };

  // Indoor-only interactive/structural tiles
  t[0x58] = { pass: 'blocked', labels: ['wall'], cat: 'special' }; // chest / lock tile family
  t[0x59] = { pass: 'blocked', labels: ['wall'], cat: 'special' };
  t[0x5A] = { pass: 'blocked', labels: ['wall'], cat: 'special' };
  t[0x5B] = { pass: 'blocked', labels: ['wall'], cat: 'special' };
  t[0x5C] = { pass: 'blocked', labels: ['wall'], cat: 'special' };
  t[0x5D] = { pass: 'blocked', labels: ['wall'], cat: 'special' };
  t[0x63] = { pass: 'blocked', labels: ['wall'], cat: 'special' }; // mini chest behavior
  t[0x67] = { pass: 'blocked', labels: ['hammer peg'], cat: 'special' }; // crystal peg up

  // Dynamic/manipulated set.
  // 0x70-0x72 are liftable pot variants indoors (TileBehavior_ManipulablyReplaced).
  t[0x70] = { pass: 'obstacle', req: 'lift.1', labels: ['pot'], cat: 'liftable' };
  t[0x71] = { pass: 'obstacle', req: 'lift.1', labels: ['pot'], cat: 'liftable' };
  t[0x72] = { pass: 'obstacle', req: 'lift.1', labels: ['pot'], cat: 'liftable' };
  for (let attr = 0x73; attr <= 0x7F; attr++) {
    t[attr] = { pass: 'blocked', labels: ['wall'], cat: 'special' };
  }
  // 0x80-0x8D are door passage tiles stamped by Dungeon_LoadDoorAttribute().
  // They mark open doorways between rooms and must be passable for flood fill.
  for (let attr = 0x80; attr <= 0x8D; attr++) {
    t[attr] = { pass: 'free', labels: ['door passage'], cat: 'ground' };
  }
  // 0x8E-0x8F are interior entrance/staircase tiles (TileBehavior_Entrance).
  t[0x8E] = { pass: 'free', labels: ['entrance'], cat: 'ground' };
  t[0x8F] = { pass: 'free', labels: ['entrance'], cat: 'ground' };
  // 0x90-0x97: TileBehavior_LayerToggleShutterDoor — passable doors that toggle Link's layer.
  // These are shutter doors (opened by killing enemies). They do NOT set collision bits.
  for (let attr = 0x90; attr <= 0x97; attr++) {
    t[attr] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  }
  // 0x98-0x9F, 0xA8-0xAF: TileBehavior_LayerAndDungeonToggleShutterDoor — toggles layer + dungeon.
  for (let attr = 0x98; attr <= 0x9F; attr++) {
    t[attr] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  }
  // 0xA0-0xA1, 0xA4-0xA5: TileBehavior_DungeonToggleManualDoor — dungeon toggle only.
  t[0xA0] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  t[0xA1] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  t[0xA4] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  t[0xA5] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  // 0xA2-0xA3: TileBehavior_DungeonToggleShutterDoor — dungeon shutter.
  t[0xA2] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  t[0xA3] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  // 0xA6-0xA7: TileBehavior_NothingOW — completely inert indoors (no collision, no behavior).
  t[0xA6] = { pass: 'free', labels: ['ground'], cat: 'ground' };
  t[0xA7] = { pass: 'free', labels: ['ground'], cat: 'ground' };
  // 0xA8-0xAF: LayerAndDungeonToggleShutterDoor (same as 0x98-0x9F).
  for (let attr = 0xA8; attr <= 0xAF; attr++) {
    t[attr] = { pass: 'free', labels: ['shutter door'], cat: 'ground' };
  }
  // 0xC0-0xCF: TileBehavior_LightableTorch — solid until lit (R14 |= bits).
  for (let attr = 0xC0; attr <= 0xCF; attr++) {
    t[attr] = { pass: 'blocked', labels: ['torch'], cat: 'special' };
  }
  // 0xF0-0xFF: TileBehavior_FlaggableDoor — solid until flag set (R14 |= bits).
  for (let attr = 0xF0; attr <= 0xFF; attr++) {
    t[attr] = { pass: 'blocked', labels: ['flaggable door'], cat: 'special' };
  }

  return t;
};

// Shared instance — all interior contexts use the same map until they diverge.
const INTERIOR_ATTRS: Readonly<Record<number, TileAttrDef>> = buildInteriorAttrs();
const INTERIOR_HOUSE_TILE_ATTRS = INTERIOR_ATTRS;
const INTERIOR_CAVE_TILE_ATTRS = INTERIOR_ATTRS;
const INTERIOR_DUNGEON_TILE_ATTRS = INTERIOR_ATTRS;

const getTileAttrsMap = (context: TileAttrContext = 'overworld'): Readonly<Record<number, TileAttrDef>> => {
  switch (context) {
    case 'interior-house': return INTERIOR_HOUSE_TILE_ATTRS;
    case 'interior-cave': return INTERIOR_CAVE_TILE_ATTRS;
    case 'interior-dungeon': return INTERIOR_DUNGEON_TILE_ATTRS;
    case 'overworld':
    default: return OVERWORLD_TILE_ATTRS;
  }
};

export { INTERIOR_HOUSE_TILE_ATTRS, INTERIOR_CAVE_TILE_ATTRS, INTERIOR_DUNGEON_TILE_ATTRS, getTileAttrsMap };
