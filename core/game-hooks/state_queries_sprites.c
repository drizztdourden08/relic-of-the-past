/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Indoor Dynamic Blockers (Early-game Uncle) ───

static uint8 g_indoor_uncle_blockers_buf[1 + 2 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmGetIndoorUncleBlockers(void) {
  // Buffer format:
  // [0] = count (0..2)
  // then per entry 4 bytes: xLo, xHi, yLo, yHi
  g_indoor_uncle_blockers_buf[0] = 0;
  if (!player_is_indoors)
    return (int)g_indoor_uncle_blockers_buf;

  uint8 count = 0;
  for (int k = 15; k >= 0 && count < 2; k--) {
    if (!sprite_state[k])
      continue;
    if (sprite_type[k] != 0x73)
      continue; // UncleAndPriest family
    if (sprite_E[k] != 0)
      continue; // only Uncle variant, not priest/mantle

    int o = 1 + count * 4;
    g_indoor_uncle_blockers_buf[o + 0] = sprite_x_lo[k];
    g_indoor_uncle_blockers_buf[o + 1] = sprite_x_hi[k];
    g_indoor_uncle_blockers_buf[o + 2] = sprite_y_lo[k];
    g_indoor_uncle_blockers_buf[o + 3] = sprite_y_hi[k];
    count++;
  }

  g_indoor_uncle_blockers_buf[0] = count;
  return (int)g_indoor_uncle_blockers_buf;
}

static uint8 g_nav_blockers_buf[1 + 16 * 4];

static bool IsOverworldGuardBlockerType(uint8 type) {
  switch (type) {
    case 0x3F: // Tutorial guard/barrier
    case 0x40: // Tutorial guard/barrier
    case 0x41: // Blue guard
    case 0x45: // Spear trooper
    case 0x46: // Blue archer
    case 0x47: // Green bush guard
    case 0x48: // Red javelin guard
    case 0x49: // Red bush guard
    case 0x4A: // Bomb guard
    case 0x4B: // Green knife guard
      return true;
    default:
      return false;
  }
}

EMSCRIPTEN_KEEPALIVE
int WasmGetNavigationBlockers(void) {
  // Buffer format:
  // [0] = count (0..16)
  // then per entry 4 bytes: xLo, xHi, yLo, yHi
  g_nav_blockers_buf[0] = 0;

  uint8 count = 0;
  for (int k = 15; k >= 0 && count < 16; k--) {
    if (!sprite_state[k])
      continue;

    bool include = false;
    const uint8 type = sprite_type[k];

    if (player_is_indoors) {
      // Uncle blocks paths in house/passage until sequence progression.
      if (type == 0x73 && sprite_E[k] == 0) {
        include = true;
      }
    } else {
      // Overworld guard/NPC bodies can physically gate routes.
      if (IsOverworldGuardBlockerType(type)) {
        include = true;
      }
    }

    if (!include)
      continue;

    int o = 1 + count * 4;
    g_nav_blockers_buf[o + 0] = sprite_x_lo[k];
    g_nav_blockers_buf[o + 1] = sprite_x_hi[k];
    g_nav_blockers_buf[o + 2] = sprite_y_lo[k];
    g_nav_blockers_buf[o + 3] = sprite_y_hi[k];
    count++;
  }

  g_nav_blockers_buf[0] = count;
  return (int)g_nav_blockers_buf;
}

static uint8 g_live_sprites_buf[1 + 16 * 10];

EMSCRIPTEN_KEEPALIVE
int WasmGetLiveSprites(void) {
  // Buffer format:
  // [0] = count (0..16)
  // per sprite (10 bytes):
  // [0] slot, [1] type, [2] state, [3] subtype, [4] subtype2, [5] sprite_E,
  // [6] xLo, [7] xHi, [8] yLo, [9] yHi
  g_live_sprites_buf[0] = 0;

  uint8 count = 0;
  for (int k = 15; k >= 0 && count < 16; k--) {
    if (!sprite_state[k])
      continue;

    int o = 1 + count * 10;
    g_live_sprites_buf[o + 0] = (uint8)k;
    g_live_sprites_buf[o + 1] = sprite_type[k];
    g_live_sprites_buf[o + 2] = sprite_state[k];
    g_live_sprites_buf[o + 3] = sprite_subtype[k];
    g_live_sprites_buf[o + 4] = sprite_subtype2[k];
    g_live_sprites_buf[o + 5] = sprite_E[k];
    g_live_sprites_buf[o + 6] = sprite_x_lo[k];
    g_live_sprites_buf[o + 7] = sprite_x_hi[k];
    g_live_sprites_buf[o + 8] = sprite_y_lo[k];
    g_live_sprites_buf[o + 9] = sprite_y_hi[k];
    count++;
  }

  g_live_sprites_buf[0] = count;
  return (int)g_live_sprites_buf;
}
