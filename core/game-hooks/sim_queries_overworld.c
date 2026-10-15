/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Overworld static sprite spawns ───
// Layout: status(1) then [count(1), pad(1)] then count records of 3 bytes:
//   [spriteType(1), col(1), row(1)]
// col/row are 8px-tile positions within the area's 64x64 screen grid, decoded
// from the same 3-byte OW sprite entries the loader reads (Overworld_LoadSprites,
// src/sprite.c:3743) via the block index the game builds there and
// unpacks into world coordinates in Overworld_LoadProximaSpriteIfAlive
// (sprite.c:3877). The active per-area table is phase-dependent:
// GetOverworldSpritePtr (overworld.c:302) selects the beginning (progress 0/1) /
// first-part (2) / second-part (3) sprite list from the live sram_progress_indicator,
// so calling it reproduces the loader's table choice exactly. Overlord and marker
// entries (type >= 0xf3, i.e. spawn id >= 0xf4) are omitted, so only real spawn
// sprites are listed, matching the dungeon query's overlord filter.
//
// Leading status byte: see WasmGetRoomChests in sim_queries.c (1 = gate open and screen in range).
static uint8 g_sim_ow_sprites_buf[1 + 2 + 48 * 3];

// Gated on developer mode, as described at WasmGetRoomChests in sim_queries.c.
EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldSpriteSpawns(int screen_index) {
  memset(g_sim_ow_sprites_buf, 0, sizeof(g_sim_ow_sprites_buf));
  if (!SimQueryGate()) return (int)g_sim_ow_sprites_buf;
  if (screen_index < 0 || screen_index >= 144) return (int)g_sim_ow_sprites_buf;

  const uint8 *src = GetOverworldSpritePtr(screen_index);
  if (!src) return (int)g_sim_ow_sprites_buf;
  g_sim_ow_sprites_buf[0] = 1;

  uint8 count = 0;
  for (; src[0] != 0xff && count < 48; src += 3) {
    uint8 type = src[2];
    if (type >= 0xf3) continue;

    uint8 r2 = (uint8)((src[0] >> 4) << 2);
    uint8 r6 = (uint8)((src[1] >> 4) + r2);
    uint8 r5 = (uint8)((src[1] & 0xf) | (src[0] << 4));
    uint16 blk = (uint16)((r6 << 8) | r5);
    uint16 x_px = (uint16)(((blk >> 8) & 3) << 8) | (uint16)((blk & 0xf) << 4);
    uint16 y_px = (uint16)((blk >> 10) << 8) | (uint16)(blk & 0xf0);

    int o = 3 + count * 3;
    g_sim_ow_sprites_buf[o + 0] = type;
    g_sim_ow_sprites_buf[o + 1] = (uint8)(x_px >> 3);
    g_sim_ow_sprites_buf[o + 2] = (uint8)(y_px >> 3);
    count++;
  }
  g_sim_ow_sprites_buf[1] = count;
  return (int)g_sim_ow_sprites_buf;
}
