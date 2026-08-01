/* @layer shared-game @kind data */
/**
 * Native ROM tile-attribute tables — the static collision/behavior byte maps.
 * `OVERWORLD_TILE_ATTRS` is the base map read by outdoor screens; `INTERIOR_ATTRS`
 * layers the indoor overrides (reverse-engineered from TileDetect_ExecuteInner's
 * is_indoors logic) on top of it. Consumers live in `navigation/overworld-attrs.ts`
 * and `navigation/interior-attrs.ts`, which keep the accessor functions.
 */
import type { TileAttrDef } from '../../navigation/tile-attrs-types';

const OVERWORLD_TILE_ATTRS: Readonly<Record<number, TileAttrDef>> = {
  // ═══ Ground / Walkable ═══════════════════════════════════════════════════════
  0x00: { pass: 'free', labels: ['ground'],                           cat: 'ground' },
  0x04: { pass: 'free', labels: ['tall grass', 'cuttable'],           cat: 'ground' },
  0x05: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x06: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x07: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x09: { pass: 'free', labels: ['shallow water'],                    cat: 'ground' },
  0x0A: { pass: 'free', labels: ['water ladder'],                     cat: 'ground' },
  0x0C: { pass: 'free', labels: ['ground overlay'],                   cat: 'ground' },
  0x14: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x15: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x16: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x17: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x1C: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x1D: { pass: 'blocked', labels: ['stair'],                          cat: 'stairs' },
  0x1E: { pass: 'blocked', labels: ['stair'],                          cat: 'stairs' },
  0x1F: { pass: 'blocked', labels: ['stair'],                          cat: 'stairs' },
  0x21: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x22: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x23: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x24: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x25: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x30: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x31: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x32: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x33: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x34: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x35: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x36: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x37: { pass: 'free', labels: ['stair'],                            cat: 'ground' },
  0x38: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x39: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x3A: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x3B: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x3C: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x3D: { pass: 'blocked', labels: ['stair'],                          cat: 'stairs' },
  0x3E: { pass: 'blocked', labels: ['stair'],                          cat: 'stairs' },
  0x3F: { pass: 'blocked', labels: ['stair'],                          cat: 'stairs' },
  0x40: { pass: 'free', labels: ['thick grass', 'cuttable'],          cat: 'ground' },
  0x41: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x44: { pass: 'free', labels: ['diggable', 'shovel target'],        cat: 'ground' },
  0x45: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x47: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x48: { pass: 'free', labels: ['diggable', 'shovel target'],        cat: 'ground' },
  0x49: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x4A: { pass: 'free', labels: ['diggable', 'shovel target'],        cat: 'ground' },
  0x4B: { pass: 'free', labels: ['diggable'],                         cat: 'ground' },
  0x5E: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x5F: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x60: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x61: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x62: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x64: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x65: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x66: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0x6C: { pass: 'free', labels: ['outdoor ground'],                   cat: 'ground' },
  0x6D: { pass: 'free', labels: ['outdoor ground'],                   cat: 'ground' },
  0x6E: { pass: 'free', labels: ['outdoor ground'],                   cat: 'ground' },
  0x6F: { pass: 'free', labels: ['outdoor ground'],                   cat: 'ground' },
  0xA6: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0xA7: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0xBE: { pass: 'free', labels: ['floor'],                            cat: 'ground' },
  0xBF: { pass: 'free', labels: ['floor'],                            cat: 'ground' },

  // ═══ Slopes / Cliff Edges (all impassable — cliff jumps extend through them) ═
  0x11: { pass: 'blocked', labels: ['cliff edge south'],              cat: 'slope' },
  0x13: { pass: 'blocked', labels: ['cliff edge north'],              cat: 'slope' },
  0x19: { pass: 'blocked', labels: ['cliff edge east'],               cat: 'slope' },
  0x1B: { pass: 'blocked', labels: ['cliff edge west'],               cat: 'slope' },

  // ═══ Walls ═══════════════════════════════════════════════════════════════════
  0x01: { pass: 'blocked', labels: ['wall'],                          cat: 'wall' },
  0x02: { pass: 'blocked', labels: ['wall'],                          cat: 'wall' },
  0x03: { pass: 'blocked', labels: ['wall'],                          cat: 'wall' },
  0x26: { pass: 'blocked', labels: ['wall'],                          cat: 'wall' },
  0x43: { pass: 'blocked', labels: ['wall'],                          cat: 'wall' },
  0x46: { pass: 'blocked', labels: ['wall', 'plaque'],                cat: 'wall' },

  // ═══ Cliff Faces (blocked — converted to ledges by cliff preprocessing) ════
  0x10: { pass: 'blocked', labels: ['cliff face south'],              cat: 'cliff-face' },
  0x12: { pass: 'blocked', labels: ['cliff face north'],              cat: 'cliff-face' },
  0x18: { pass: 'blocked', labels: ['cliff face east'],               cat: 'cliff-face' },
  0x1A: { pass: 'blocked', labels: ['cliff face west'],               cat: 'cliff-face' },

  // ═══ Cliff Triggers (blocked — directional ledge jump tiles) ════════════════
  0x28: { pass: 'blocked', labels: ['ledge y axis'],                  cat: 'cliff-trigger' },
  0x29: { pass: 'blocked', labels: ['ledge y axis'],                  cat: 'cliff-trigger' },
  0x2A: { pass: 'blocked', labels: ['ledge x axis'],                  cat: 'cliff-trigger' },
  0x2B: { pass: 'blocked', labels: ['ledge x axis'],                  cat: 'cliff-trigger' },
  0x2C: { pass: 'blocked', labels: ['ledge NE'],                      cat: 'cliff-trigger' },
  0x2D: { pass: 'blocked', labels: ['ledge SE'],                      cat: 'cliff-trigger' },
  0x2E: { pass: 'blocked', labels: ['ledge NW'],                      cat: 'cliff-trigger' },
  0x2F: { pass: 'blocked', labels: ['ledge SW'],                      cat: 'cliff-trigger' },

  // ═══ Water ═══════════════════════════════════════════════════════════════════
  0x08: { pass: 'water', req: 'flippers', labels: ['deep water'],     cat: 'water' },
  0x0B: { pass: 'water', req: 'flippers', labels: ['deep water'],     cat: 'water' },

  // ═══ Pit ═════════════════════════════════════════════════════════════════════
  0x20: { pass: 'pit', labels: ['pit', 'hole'],                       cat: 'pit' },

  // ═══ Special ═════════════════════════════════════════════════════════════════
  0x27: { pass: 'blocked', labels: ['hookshot-grabbable', 'grapple point'], cat: 'special', hookTarget: true },

  // ═══ Liftable / Clearable Obstacles ══════════════════════════════════════════
  // ⚠️ lift.1 IS a real requirement — NEVER remove it. It gates BFS and must show pink on overlay.
  0x50: { pass: 'obstacle', req: 'lift.1', labels: ['bush', 'sign', 'pot'],    cat: 'liftable', hookTarget: true },
  0x51: { pass: 'obstacle', req: 'lift.1', labels: ['bush', 'sign'],           cat: 'liftable', hookTarget: true },
  0x52: { pass: 'obstacle', req: 'lift.2', labels: ['light rock'],             cat: 'liftable', hookTarget: true },
  0x53: { pass: 'obstacle', req: 'lift.3', labels: ['dark rock'],              cat: 'liftable', hookTarget: true },
  0x54: { pass: 'obstacle', req: 'hammer',  labels: ['hammer peg'],            cat: 'liftable', hookTarget: true },
  0x55: { pass: 'obstacle', req: 'lift.2', labels: ['light rock'],             cat: 'liftable', hookTarget: true },
  0x56: { pass: 'obstacle', req: 'lift.3', labels: ['dark rock'],              cat: 'liftable', hookTarget: true },
  0x57: { pass: 'obstacle', req: 'boots',  labels: ['bonk rock', 'dash target'], cat: 'liftable' },
};

// ─── Range-based free tiles (0xD0–0xEF) ─────────────────────────────────────
// These are all walkable floor variants in dungeons. Registered programmatically.
for (let attr = 0xD0; attr <= 0xEF; attr++) {
  (OVERWORLD_TILE_ATTRS as Record<number, TileAttrDef>)[attr] = { pass: 'free', labels: ['floor'], cat: 'ground' };
}

/** Builds the interior overlay once, on top of the overworld base map. */
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
  // 0x73-0x7F share TileBehavior_ManipulablyReplaced with the pots above, but carry
  // pushable blocks: Link shoves them aside with no item, so they never block navigation.
  for (let attr = 0x73; attr <= 0x7F; attr++) {
    t[attr] = { pass: 'free', labels: ['pushable block'], cat: 'liftable' };
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
  // 0xF0-0xFF: TileBehavior_FlaggableDoor — solid until a flag is set. In practice these are
  // the bombable/cracked walls whose flag is set by blasting them open, so Link passes once he
  // has bombs. Model them as a bomb-gated obstacle rather than a permanent wall.
  for (let attr = 0xF0; attr <= 0xFF; attr++) {
    t[attr] = { pass: 'obstacle', req: 'bombs', labels: ['bombable wall'], cat: 'special' };
  }

  return t;
};

// Shared instance — all interior contexts use the same map until they diverge.
const INTERIOR_ATTRS: Readonly<Record<number, TileAttrDef>> = buildInteriorAttrs();

export { OVERWORLD_TILE_ATTRS, INTERIOR_ATTRS };
