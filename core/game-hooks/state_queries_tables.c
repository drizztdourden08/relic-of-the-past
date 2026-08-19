/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Navigation Table Exports ───
// Expose static game tables for the navigation system (entrance positions,
// exit mapping, area heads, entrance→room mapping). Each export packs a
// count-prefixed list via the BufW append cursor (see wasm_buf.h).

// Overworld entrances: area(u16) + pos(u16) + id(u8) per entry, count prefix.
// 129 entries max → 2 + 129*5 = 647 bytes.
static uint8 g_ow_entrances_buf[2 + 129 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldEntrances(void) {
  if (!NavQueryGate()) {
    memset(g_ow_entrances_buf, 0, sizeof(g_ow_entrances_buf));
    return (int)g_ow_entrances_buf;
  }
  uint16 count = kOverworld_Entrance_Area_SIZE / 2;
  if (count > 129) count = 129;
  BufW b = BufW_Init(g_ow_entrances_buf);
  BufW_U16(&b, count);
  for (uint16 i = 0; i < count; i++) {
    BufW_U16(&b, kOverworld_Entrance_Area[i]);
    BufW_U16(&b, kOverworld_Entrance_Pos[i]);
    BufW_U8(&b, kOverworld_Entrance_Id[i]);
  }
  return (int)g_ow_entrances_buf;
}

// Fall holes: area(u16) + pos(u16) + entranceId(u8) per entry, count prefix.
// 19 entries max → 2 + 19*5 = 97 bytes.
static uint8 g_fall_holes_buf[2 + 19 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetFallHoles(void) {
  if (!NavQueryGate()) {
    memset(g_fall_holes_buf, 0, sizeof(g_fall_holes_buf));
    return (int)g_fall_holes_buf;
  }
  uint16 count = kFallHole_Area_SIZE / 2;
  if (count > 19) count = 19;
  BufW b = BufW_Init(g_fall_holes_buf);
  BufW_U16(&b, count);
  for (uint16 i = 0; i < count; i++) {
    BufW_U16(&b, kFallHole_Area[i]);
    BufW_U16(&b, kFallHole_Pos[i]);
    BufW_U8(&b, kFallHole_Entrances[i]);
  }
  return (int)g_fall_holes_buf;
}

// Area heads: fixed 64-byte array (kOverworldAreaHeads).
// Duplicated here because it's static const in overworld.c.
static const uint8 g_area_heads[64] = {
  0,  0,  2,  3,  3,  5,  5,  7,
  0,  0, 10,  3,  3,  5,  5, 15,
  16, 17, 18, 19, 20, 21, 22, 23,
  24, 24, 26, 27, 27, 29, 30, 30,
  24, 24, 34, 27, 27, 37, 30, 30,
  40, 41, 42, 43, 44, 45, 46, 47,
  48, 48, 50, 51, 52, 53, 53, 55,
  48, 48, 58, 59, 60, 53, 53, 63,
};

// Exit screen map: roomId(u16) + screenIndex(u8) per entry, count prefix.
// Max ~79 exits → 2 + 79*3 = 239 bytes. Use 128 for safety.
static uint8 g_exit_screen_buf[2 + 128 * 3];

EMSCRIPTEN_KEEPALIVE
int WasmGetExitScreenMap(void) {
  if (!NavQueryGate()) {
    memset(g_exit_screen_buf, 0, sizeof(g_exit_screen_buf));
    return (int)g_exit_screen_buf;
  }
  uint16 count = kExitData_ScreenIndex_SIZE;
  if (count > 128) count = 128;
  BufW b = BufW_Init(g_exit_screen_buf);
  BufW_U16(&b, count);
  for (uint16 i = 0; i < count; i++) {
    uint16 room = kExitDataRooms[i];
    uint8  scr  = kExitData_ScreenIndex[i];
    // For big screens, resolve area head to correct sub-screen using exit coordinates
    if (scr < 64 && g_area_heads[scr] == scr) {
      int is_big = 0;
      for (int j = 0; j < 64; j++) {
        if (g_area_heads[j] == scr && j != scr) { is_big = 1; break; }
      }
      if (is_big) {
        uint16 exit_x = kExitData_XCoord[i];
        uint16 exit_y = kExitData_YCoord[i];
        uint8 head_col = scr & 7;
        uint8 head_row = scr >> 3;
        uint8 sub_col = (exit_x >= (uint16)((head_col + 1) * 512)) ? 1 : 0;
        uint8 sub_row = (exit_y >= (uint16)((head_row + 1) * 512)) ? 1 : 0;
        scr = ((head_row + sub_row) << 3) | (head_col + sub_col);
      }
    }
    BufW_U16(&b, room);
    BufW_U8(&b, scr);
  }
  return (int)g_exit_screen_buf;
}


// g_area_heads above is `const`, so a closed gate can't memset it in place; stand in a zeroed
// mutable scratch buffer of the same 64-byte shape instead.
static uint8 g_area_heads_zero_buf[64];

EMSCRIPTEN_KEEPALIVE
int WasmGetAreaHeads(void) {
  if (!NavQueryGate()) {
    memset(g_area_heads_zero_buf, 0, sizeof(g_area_heads_zero_buf));
    return (int)g_area_heads_zero_buf;
  }
  return (int)g_area_heads;
}

// Entrance rooms: entrance ID → dungeon room (uint16 per entry), count prefix.
// The cap was 133 — the count of front-door entrances — which silently dropped
// every entry past it. The table does not stop there: the secondary entries that
// follow are the only way into a handful of rooms, so a room like the village
// hideout (0x11D) had no entrance at all and read as unreachable while every
// neighbour of it had one. Sized from the entrance count the assets declare.
#define SIM_MAX_ENTRANCES 192
static uint8 g_entrance_rooms_buf[2 + SIM_MAX_ENTRANCES * 2];

EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceRooms(void) {
  if (!NavQueryGate()) {
    memset(g_entrance_rooms_buf, 0, sizeof(g_entrance_rooms_buf));
    return (int)g_entrance_rooms_buf;
  }
  uint16 count = kEntranceData_rooms_SIZE / 2;
  if (count > SIM_MAX_ENTRANCES) count = SIM_MAX_ENTRANCES;
  BufW b = BufW_Init(g_entrance_rooms_buf);
  BufW_U16(&b, count);
  for (uint16 i = 0; i < count; i++) {
    BufW_U16(&b, kEntranceData_rooms[i]);
  }
  return (int)g_entrance_rooms_buf;
}

// Entrance spawn positions: playerX(u16) + playerY(u16) + startingBg(u8) per
// entry, count prefix. Same cap as the room table so ids line up across both.
static uint8 g_entrance_spawn_buf[2 + SIM_MAX_ENTRANCES * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceSpawns(void) {
  if (!NavQueryGate()) {
    memset(g_entrance_spawn_buf, 0, sizeof(g_entrance_spawn_buf));
    return (int)g_entrance_spawn_buf;
  }
  uint16 count = kEntranceData_playerX_SIZE / 2;
  if (count > SIM_MAX_ENTRANCES) count = SIM_MAX_ENTRANCES;
  BufW b = BufW_Init(g_entrance_spawn_buf);
  BufW_U16(&b, count);
  for (uint16 i = 0; i < count; i++) {
    BufW_U16(&b, kEntranceData_playerX[i]);
    BufW_U16(&b, kEntranceData_playerY[i]);
    BufW_U8(&b, kEntranceData_startingBg[i]);
  }
  return (int)g_entrance_spawn_buf;
}
