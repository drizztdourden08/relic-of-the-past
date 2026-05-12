/**
 * Overworld event flags for checks tracked via save_ow_event_info[].
 * save_ow_event_info is uint8[128], indexed by overworld screen number.
 * Bit 0x40 indicates the item on that screen has been collected.
 *
 * Source: Archipelago ALTTPR client location_table_ow
 */

export interface OverworldFlagEntry {
  screen: number;
  mask: number;
}

/**
 * Checks detected via save_ow_event_info[screen] & mask.
 * Covers standing items, dig spots, and events on the overworld.
 */
export const CHECK_OVERWORLD_FLAGS: Record<string, OverworldFlagEntry> = {
  // ═══════════════════════════════════════════
  // Standing items (overworld)
  // ═══════════════════════════════════════════
  'Mushroom': { screen: 0x00, mask: 0x40 },
  "Zora's Ledge": { screen: 0x81, mask: 0x40 },
  'Library': { screen: 0x29, mask: 0x40 },
  'Lake Hylia Island': { screen: 0x35, mask: 0x40 },
  'Maze Race': { screen: 0x28, mask: 0x40 },
  'Desert Ledge': { screen: 0x30, mask: 0x40 },
  'Ether Tablet': { screen: 0x03, mask: 0x40 },
  'Spectacle Rock': { screen: 0x03, mask: 0x40 },
  'Master Sword Pedestal': { screen: 0x80, mask: 0x40 },
  'Floating Island': { screen: 0x05, mask: 0x40 },
  'Pyramid': { screen: 0x5b, mask: 0x40 },
  'Bombos Tablet': { screen: 0x6c, mask: 0x40 },
  'Dark Blacksmith Ruins': { screen: 0x63, mask: 0x40 },
  'Bumper Cave Ledge': { screen: 0x4a, mask: 0x40 },

  // ═══════════════════════════════════════════
  // Dig spots
  // ═══════════════════════════════════════════
  'Flute Spot': { screen: 0x2a, mask: 0x40 },
  'Digging Game': { screen: 0x68, mask: 0x40 },

  // ═══════════════════════════════════════════
  // Events
  // ═══════════════════════════════════════════
  'Sunken Treasure': { screen: 0x3b, mask: 0x40 },
};
