/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Navigation Table Exports ───
// Expose static game tables for the navigation system (entrance positions,
// exit mapping, area heads, entrance→room mapping).

// Overworld entrances: area(u16) + pos(u16) + id(u8) per entry, count prefix.
// 129 entries max → 2 + 129*5 = 647 bytes.
static uint8 g_ow_entrances_buf[2 + 129 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldEntrances(void) {
  uint16 count = kOverworld_Entrance_Area_SIZE / 2;
  if (count > 129) count = 129;
  g_ow_entrances_buf[0] = count & 0xFF;
  g_ow_entrances_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 5;
    uint16 area = kOverworld_Entrance_Area[i];
    uint16 pos  = kOverworld_Entrance_Pos[i];
    uint8  id   = kOverworld_Entrance_Id[i];
    g_ow_entrances_buf[o + 0] = area & 0xFF;
    g_ow_entrances_buf[o + 1] = (area >> 8) & 0xFF;
    g_ow_entrances_buf[o + 2] = pos & 0xFF;
    g_ow_entrances_buf[o + 3] = (pos >> 8) & 0xFF;
    g_ow_entrances_buf[o + 4] = id;
  }
  return (int)g_ow_entrances_buf;
}

// Fall holes: area(u16) + pos(u16) + entranceId(u8) per entry, count prefix.
// 19 entries max → 2 + 19*5 = 97 bytes.
static uint8 g_fall_holes_buf[2 + 19 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetFallHoles(void) {
  uint16 count = kFallHole_Area_SIZE / 2;
  if (count > 19) count = 19;
  g_fall_holes_buf[0] = count & 0xFF;
  g_fall_holes_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 5;
    uint16 area = kFallHole_Area[i];
    uint16 pos  = kFallHole_Pos[i];
    uint8  eid  = kFallHole_Entrances[i];
    g_fall_holes_buf[o + 0] = area & 0xFF;
    g_fall_holes_buf[o + 1] = (area >> 8) & 0xFF;
    g_fall_holes_buf[o + 2] = pos & 0xFF;
    g_fall_holes_buf[o + 3] = (pos >> 8) & 0xFF;
    g_fall_holes_buf[o + 4] = eid;
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
  uint16 count = kExitData_ScreenIndex_SIZE;
  if (count > 128) count = 128;
  g_exit_screen_buf[0] = count & 0xFF;
  g_exit_screen_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 3;
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
    g_exit_screen_buf[o + 0] = room & 0xFF;
    g_exit_screen_buf[o + 1] = (room >> 8) & 0xFF;
    g_exit_screen_buf[o + 2] = scr;
  }
  return (int)g_exit_screen_buf;
}


EMSCRIPTEN_KEEPALIVE
int WasmGetAreaHeads(void) {
  return (int)g_area_heads;
}

// Entrance rooms: entrance ID → dungeon room (uint16 per entry), count prefix.
// 133 entries max → 2 + 133*2 = 268 bytes.
static uint8 g_entrance_rooms_buf[2 + 133 * 2];

EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceRooms(void) {
  uint16 count = kEntranceData_rooms_SIZE / 2;
  if (count > 133) count = 133;
  g_entrance_rooms_buf[0] = count & 0xFF;
  g_entrance_rooms_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 2;
    uint16 room = kEntranceData_rooms[i];
    g_entrance_rooms_buf[o + 0] = room & 0xFF;
    g_entrance_rooms_buf[o + 1] = (room >> 8) & 0xFF;
  }
  return (int)g_entrance_rooms_buf;
}

// Entrance spawn positions: playerX(u16) + playerY(u16) per entry, count prefix.
// 133 entries max → 2 + 133*4 = 534 bytes.
static uint8 g_entrance_spawn_buf[2 + 133 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceSpawns(void) {
  uint16 count = kEntranceData_playerX_SIZE / 2;
  if (count > 133) count = 133;
  g_entrance_spawn_buf[0] = count & 0xFF;
  g_entrance_spawn_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 5;
    uint16 px = kEntranceData_playerX[i];
    uint16 py = kEntranceData_playerY[i];
    g_entrance_spawn_buf[o + 0] = px & 0xFF;
    g_entrance_spawn_buf[o + 1] = (px >> 8) & 0xFF;
    g_entrance_spawn_buf[o + 2] = py & 0xFF;
    g_entrance_spawn_buf[o + 3] = (py >> 8) & 0xFF;
    g_entrance_spawn_buf[o + 4] = kEntranceData_startingBg[i];
  }
  return (int)g_entrance_spawn_buf;
}
