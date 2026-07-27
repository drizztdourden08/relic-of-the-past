/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

static uint8 g_overworld_guard_spawns_buf[1 + 16 * 4];

// ─── Navigation Grid Exports ───
// Builds a 64×64 collision attr grid on demand for any overworld screen.
// Used by the unified navigation engine (same code path: widget + offline).
// The indoor equivalent lives in state_queries_room_grid.c.

static uint8 g_nav_overworld_grid[64 * 64];

EMSCRIPTEN_KEEPALIVE
int WasmBuildOverworldAttrGrid(int screen_idx) {
  // Use a 64-wide uint16 buffer (stride matches what DecompressAndDrawOneQuadrant expects).
  // The function writes 32×32 Map16 tile IDs with row stride 64.
  static uint16 nav_map16_buf[64 * 32];

  map16_decode_last = 0xffff;
  Overworld_DecompressAndDrawOneQuadrant(nav_map16_buf, screen_idx);

  // Convert 32×32 Map16 → 64×64 collision attrs
  const uint16 *map16ToMap8 = GetMap16toMap8Table();
  const uint8 *map8ToAttr = GetMap8toTileAttr();

  for (int row16 = 0; row16 < 32; row16++) {
    for (int col16 = 0; col16 < 32; col16++) {
      uint16 tile16 = nav_map16_buf[row16 * 64 + col16];
      int base = tile16 * 4;
      int gr = row16 * 2, gc = col16 * 2;

      uint16 m8_tl = map16ToMap8[base + 0];
      uint16 m8_tr = map16ToMap8[base + 1];
      uint16 m8_bl = map16ToMap8[base + 2];
      uint16 m8_br = map16ToMap8[base + 3];

      uint8 a_tl = map8ToAttr[m8_tl & 0x1FF];
      uint8 a_tr = map8ToAttr[m8_tr & 0x1FF];
      uint8 a_bl = map8ToAttr[m8_bl & 0x1FF];
      uint8 a_br = map8ToAttr[m8_br & 0x1FF];

      // Propagate priority bit for deep grass/water (0x10..0x1B range)
      if (a_tl >= 0x10 && a_tl < 0x1C) a_tl |= (m8_tl >> 14) & 1;
      if (a_tr >= 0x10 && a_tr < 0x1C) a_tr |= (m8_tr >> 14) & 1;
      if (a_bl >= 0x10 && a_bl < 0x1C) a_bl |= (m8_bl >> 14) & 1;
      if (a_br >= 0x10 && a_br < 0x1C) a_br |= (m8_br >> 14) & 1;

      g_nav_overworld_grid[(gr + 0) * 64 + gc + 0] = a_tl;
      g_nav_overworld_grid[(gr + 0) * 64 + gc + 1] = a_tr;
      g_nav_overworld_grid[(gr + 1) * 64 + gc + 0] = a_bl;
      g_nav_overworld_grid[(gr + 1) * 64 + gc + 1] = a_br;
    }
  }

  return (int)g_nav_overworld_grid;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldGuardSpawns(void) {
  // Buffer format:
  // [0] = count (0..16)
  // then per entry 4 bytes: xLo, xHi, yLo, yHi
  g_overworld_guard_spawns_buf[0] = 0;

  if (player_is_indoors)
    return (int)g_overworld_guard_spawns_buf;

  // The overworld engine proximity-loads sprites into sprite_state[].
  // For flood-fill we also need static guard spawn locations even when unloaded.
  uint8 count = 0;
  const uint8 base_x_hi = HIBYTE(sprcoll_x_base);
  const uint8 base_y_hi = HIBYTE(sprcoll_y_base);
  const uint8 chunks_x = (uint8)(sprcoll_x_size >> 8);
  const uint8 chunks_y = (uint8)(sprcoll_y_size >> 8);

  for (uint8 cy = 0; cy < chunks_y && count < 16; cy++) {
    for (uint8 cx = 0; cx < chunks_x && count < 16; cx++) {
      const uint8 r1 = (uint8)(cy * 4 + cx);
      for (uint16 cell = 0; cell < 256 && count < 16; cell++) {
        const uint16 blk = ((uint16)r1 << 8) | cell;
        const uint8 spawn = sprite_where_in_overworld[blk];
        if (!spawn || spawn >= 0xF4)
          continue; // empty / overlord

        const uint8 type = (uint8)(spawn - 1);
        if (type != 0x3F && type != 0x40)
          continue;

        const uint8 x_lo = (uint8)((blk << 4) & 0xF0);
        const uint8 y_lo = (uint8)(blk & 0xF0);
        const uint8 x_hi = (uint8)((blk >> 8 & 3) + base_x_hi);
        const uint8 y_hi = (uint8)((blk >> 10) + base_y_hi);

        int o = 1 + count * 4;
        g_overworld_guard_spawns_buf[o + 0] = x_lo;
        g_overworld_guard_spawns_buf[o + 1] = x_hi;
        g_overworld_guard_spawns_buf[o + 2] = y_lo;
        g_overworld_guard_spawns_buf[o + 3] = y_hi;
        count++;
      }
    }
  }

  g_overworld_guard_spawns_buf[0] = count;
  return (int)g_overworld_guard_spawns_buf;
}
