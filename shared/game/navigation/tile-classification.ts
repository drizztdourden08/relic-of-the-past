import type { TilePassability } from './types';

/**
 * Classify a raw Map8 collision attribute into a TilePassability.
 * This is the single source of truth for all navigation modules.
 *
 * Lift levels (1-indexed, there is NO lift.0):
 *   lift.1 = Bushes, signs, light stones. Link has this from the start.
 *            Still tracked as a requirement for randomizer (may not be available).
 *   lift.2 = Dark rocks. Requires Titan's Mitt (gloves level 2).
 *
 * Attr ranges (from zelda3 source / disassembly):
 *   0x00       = free (standard ground)
 *   0x01–0x03  = walls/collision
 *   0x04       = tall grass (walkable)
 *   0x05–0x07  = floor variants (walkable)
 *   0x08       = deep water (flippers)
 *   0x09       = shallow water (walkable)
 *   0x0A       = shallow water variant (walkable)
 *   0x0B       = deep water variant (flippers)
 *   0x0C       = grass/ground (walkable)
 *   0x10,0x12,0x18,0x1A = cliff faces (blocked, turned to ledges by preprocessing)
 *   0x11,0x13,0x19,0x1B = slopes (walkable)
 *   0x20       = pit/hole
 *   0x21–0x25  = floor tiles (walkable)
 *   0x26       = wall
 *   0x27       = hookshot target post (blocks walk, hookshot can grab)
 *   0x28–0x2F  = cliff triggers (blocked, turned to ledges by preprocessing)
 *   0x30–0x3C  = various floor/stair tiles (walkable)
 *   0x40       = thick grass / bush variant (lift.1)
 *   0x41       = floor (walkable)
 *   0x43       = wall
 *   0x44       = diggable ground (walkable)
 *   0x45       = floor (walkable)
 *   0x46       = wall
 *   0x47       = floor (walkable)
 *   0x48       = bush (lift.1 or sword or boomerang)
 *   0x49       = floor (walkable)
 *   0x4A       = light stone (lift.1)
 *   0x4B       = diggable (walkable)
 *   0x50       = bush/sign variant (lift.1)
 *   0x51       = bush/sign variant (lift.1)
 *   0x52       = dark rock (lift.2 — Titan's Mitt)
 *   0x53       = dark rock variant (lift.2)
 *   0x54       = hammer peg (hammer) ← PREVIOUSLY MISLABELED as lift.2
 *   0x55       = dark rock variant (lift.2)
 *   0x56       = dark rock variant (lift.2)
 *   0x57       = bonk rock (boots)
 *   0x5E–0x66  = various floor tiles (walkable)
 *   0x6C–0x6F  = outdoor walkable
 *   0xD0–0xEF  = floor variants (walkable)
 */
export function classifyTileAttr(attr: number): TilePassability {
  // Fast path: common walkable tiles
  switch (attr) {
    case 0x00: case 0x05: case 0x06: case 0x07:
    case 0x09: case 0x0a: case 0x0c:
    case 0x14: case 0x15: case 0x16: case 0x17:
    case 0x21: case 0x22: case 0x23: case 0x24: case 0x25:
    case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37:
    case 0x38: case 0x39: case 0x3a: case 0x3b: case 0x3c:
    case 0x41: case 0x45: case 0x47: case 0x49:
    case 0x5e: case 0x5f: case 0x60: case 0x61: case 0x62: case 0x64: case 0x65: case 0x66:
    case 0xa6: case 0xa7: case 0xbe: case 0xbf:
      return { type: 'free' };
    default:
      if (attr >= 0xd0 && attr <= 0xef) return { type: 'free' };
      break;
  }

  switch (attr) {
    // Thick grass / diggable ground — walkable
    case 0x04: case 0x44: case 0x4b:
      return { type: 'free' };

    // Bushes / signs — liftable (lift.1) or cuttable (sword/boomerang)
    case 0x40: case 0x48: case 0x4a: case 0x50: case 0x51:
      return { type: 'obstacle', req: 'lift.1' };

    // Dark rocks — Titan's Mitt (lift.2)
    case 0x52: case 0x53: case 0x55: case 0x56:
      return { type: 'obstacle', req: 'lift.2' };

    // Hammer pegs — Magic Hammer
    case 0x54:
      return { type: 'obstacle', req: 'hammer' };

    // Bonk rocks — Pegasus Boots
    case 0x57:
      return { type: 'obstacle', req: 'boots' };

    // Deep water — Flippers
    case 0x08: case 0x0b:
      return { type: 'water' };

    // Slopes — walkable (directional movement only)
    case 0x11: case 0x13: case 0x19: case 0x1b:
      return { type: 'free' };

    // Cliff faces — blocked (converted to ledges by cliff preprocessing)
    case 0x10: case 0x18: case 0x12: case 0x1a:
      return { type: 'blocked' };

    // Cliff triggers — blocked (converted to ledges by cliff preprocessing)
    case 0x28: case 0x29: case 0x2a: case 0x2b:
    case 0x2c: case 0x2d: case 0x2e: case 0x2f:
      return { type: 'blocked' };

    // Pit / hole
    case 0x20:
      return { type: 'pit' };

    // Hookshot target post — blocks walk (hookshot can grab from distance)
    case 0x27:
      return { type: 'blocked' };

    // Standard collision (walls, cliffs, barriers)
    case 0x01: case 0x02: case 0x03:
    case 0x26: case 0x43: case 0x46:
      return { type: 'blocked' };

    // Outdoor walkable
    case 0x6c: case 0x6d: case 0x6e: case 0x6f:
      return { type: 'free' };

    default:
      return { type: 'blocked' };
  }
}
