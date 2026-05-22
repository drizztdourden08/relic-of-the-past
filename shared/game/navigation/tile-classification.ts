import type { TilePassability } from './types';

/**
 * Classify a raw Map8 collision attribute into a TilePassability.
 * This is the single source of truth for all navigation modules.
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

    // Bushes — liftable with bare hands (lift.0)
    case 0x40: case 0x48: case 0x4a: case 0x50: case 0x51:
      return { type: 'obstacle', req: 'lift.0' };

    // Grey rocks — Power Glove (lift.1)
    case 0x52: case 0x53: case 0x54: case 0x55: case 0x56:
      return { type: 'obstacle', req: 'lift.1' };

    // Bonk pegs — Pegasus Boots
    case 0x57:
      return { type: 'obstacle', req: 'boots' };

    // Deep water — Flippers
    case 0x08: case 0x0b:
      return { type: 'water' };

    // Slopes — walkable (directional movement only)
    case 0x11: case 0x13: case 0x19: case 0x1b:
      return { type: 'free' };

    // Cliff tiles — blocked (converted to ledges by cliff preprocessing)
    case 0x10: case 0x18: case 0x12: case 0x1a:
      return { type: 'blocked' };

    // Cliff triggers — blocked (converted to ledges by cliff preprocessing)
    case 0x28: case 0x29: case 0x2a: case 0x2b:
    case 0x2c: case 0x2d: case 0x2e: case 0x2f:
      return { type: 'blocked' };

    // Pit / hole
    case 0x20:
      return { type: 'pit' };

    // Hookshottable / fence posts — blocks walk
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
