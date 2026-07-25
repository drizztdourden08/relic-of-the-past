/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// Room-addressable state queries for the gameplay simulator. Each export packs a
// count-prefixed record list into a static buffer and returns its address; the TS
// bridge parses the documented layout. Chest/door open-state reads live bits when
// |room_id| is the room Link currently occupies, otherwise the SRAM room word.

// Live chest-open masks (bits 8-13); SRAM form is these >> 4 (bits 4-9).
static const uint16 kSimChestMasks[6] = { 0x100, 0x200, 0x400, 0x800, 0x1000, 0x2000 };

// Door boundary tilemap byte offsets per position slot (0-11), mirrored from the
// dungeon room loader. Index 6-11 target the room's lower page.
static const uint16 kSimDoorOffs_Up[12]    = { 0x21c, 0x23c, 0x25c, 0x39c, 0x3bc, 0x3dc, 0x121c, 0x123c, 0x125c, 0x139c, 0x13bc, 0x13dc };
static const uint16 kSimDoorOffs_Down[12]  = { 0xd1c, 0xd3c, 0xd5c, 0xb9c, 0xbbc, 0xbdc, 0x1d1c, 0x1d3c, 0x1d5c, 0x1b9c, 0x1bbc, 0x1bdc };
static const uint16 kSimDoorOffs_Left[12]  = { 0x784, 0xf84, 0x1784, 0x78a, 0xf8a, 0x178a, 0x7c4, 0xfc4, 0x17c4, 0x7ca, 0xfca, 0x17ca };
static const uint16 kSimDoorOffs_Right[12] = { 0x7b4, 0xfb4, 0x17b4, 0x7ae, 0xfae, 0x17ae, 0x7f4, 0xff4, 0x17f4, 0x7ee, 0xfee, 0x17ee };

static int SimRoomCount(void) { return (int)(kDungeonRoomOffs_SIZE / 2); }

static int SimRoomValid(int room_id) { return room_id >= 0 && room_id < SimRoomCount(); }

// Chest/door open flags read live for the occupied room, SRAM otherwise.
static int SimIsCurrentRoom(int room_id) {
  return player_is_indoors && (int)dungeon_room_index == room_id;
}

// ─── Chests ───
// Layout: [count(1), pad(1)] then count records of 7 bytes:
//   [chestIndex(1), isBig(1), itemId(1), isOpen(1), posKnown(1), col(1), row(1)]
// chestIndex 0-5 = order within the room's chest table (also the open-bit index).
// Tile position comes from live dung_chest_locations for the occupied room, and
// from the room's static object data (the chest object's draw position) for any
// other room — so remote chests are position-known too; col/row index the
// 64-wide dungeon tilemap (row spans pages for tall rooms).
static uint8 g_sim_chests_buf[2 + 6 * 7];

// Walk one room-object list layer starting at byte |off|, counting drawn chest
// objects (recording each one's draw-position tile) and returning the offset of
// its 0xffff terminator. Mirrors the loader's RoomDraw_DrawAllObjects /
// RoomData_DrawObject (dungeon.c:2664,2695) without any drawing or live-state
// writes: 3-byte object entries until 0xffff, with a 0xfff0 marker switching to
// a 2-byte door sub-list (doors draw no chest).
static int SimScanChestObjects(const uint8 *p, int off, int *chests, uint8 *cols, uint8 *rows) {
  for (;;) {
    uint16 d = *(const uint16 *)(p + off);
    if (d == 0xffff) return off;
    if (d == 0xfff0) break;
    // Subtype-3 dispatch (RoomData_DrawObject dungeon.c:2700-2711): a full-index
    // object ((d & 0xfc) != 0xfc) whose type byte is >= 0xf8 selects
    // LoadType1ObjectSubtype3 with the recomputed sub-index below, where 0x19 is a
    // chest and 0x31 a big chest (dungeon.c:1706,1886) — the objects that stamp the
    // 0x58+ordinal chest tile and bump dung_num_chests_x2.
    uint8 idx = p[off + 2];
    if ((d & 0xfc) != 0xfc && idx >= 0xf8) {
      uint8 sub = (uint8)(((idx & 7) << 4) | (((d >> 8) & 3) << 2) | (d & 3));
      if (sub == 0x19 || sub == 0x31) {
        // Draw position, decoded exactly like the full-index object branch of
        // RoomData_DrawObject: x = low byte >> 2, y = top 6 bits (dst = y*64+x).
        if (*chests < 6) {
          cols[*chests] = (uint8)((d & 0xff) >> 2);
          rows[*chests] = (uint8)((d >> 10) & 0x3f);
        }
        (*chests)++;
      }
    }
    off += 3;
  }
  // Door sub-list: skip the 0xfff0 marker, then 2-byte door words until 0xffff.
  for (;;) {
    off += 2;
    if (*(const uint16 *)(p + off) == 0xffff) return off;
  }
}

// Room-addressable scan of the chest objects a room actually draws — count plus
// each chest's draw-position tile — derived from its static object data. No
// loaded-room state required, so it is valid for remote queries. The room's own
// objects live in three consecutive layers starting at byte 2 (Dungeon_LoadRoom
// dungeon.c:2621-2631; byte 0 is the floor, byte 1 the layout); each layer ends
// in 0xffff, +2 reaches the next. The shared wall-shell template
// (dungeon.c:2614-2619) is structural and never carries chests, so it is not scanned.
static int SimRoomScanChests(int room_id, uint8 *cols, uint8 *rows) {
  const uint8 *p = GetDungeonRoomLayout(room_id);
  int chests = 0;
  int off = 2;
  for (int layer = 0; layer < 3; layer++) {
    off = SimScanChestObjects(p, off, &chests, cols, rows);
    off += 2;
  }
  return chests;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomChests(int room_id) {
  memset(g_sim_chests_buf, 0, sizeof(g_sim_chests_buf));
  if (!SimRoomValid(room_id)) return (int)g_sim_chests_buf;

  int current = SimIsCurrentRoom(room_id);
  // Only the first |drawn| chest-table entries for a room are backed by a real
  // chest object: each drawn chest bumps a counter and takes draw-order slot ==
  // its ordinal (cases 0x19/0x31, dungeon.c:1709-1710,1887), so table order tracks
  // the slot and open-bit index even past cell locks, which advance the separate
  // dung_num_bigkey_locks_x2 (dungeon.c:1697) and never shift a chest's slot.
  // Entries beyond |drawn| are vestigial dev leftovers with no chest object drawn
  // — e.g. room 0x55, the Hyrule Castle Secret Passage (a connector whose layout
  // draws no chest) still carries a leftover Lamp entry duplicating Link's House
  // (room 0x104). OpenChestForItem yields nothing for them (there is no 0x58+slot
  // chest tile, dungeon.c:5738-5799), so capping at |drawn| drops the phantom.
  // For the loaded room dung_num_chests_x2>>1 is that count directly; remote rooms
  // (the live counter only describes the loaded room) parse the static object data
  // room-addressably so the cap — and the 0x55 suppression — holds off-screen too.
  uint8 scan_cols[6] = { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };
  uint8 scan_rows[6] = { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };
  int drawn = current ? (int)(dung_num_chests_x2 >> 1)
                      : SimRoomScanChests(room_id, scan_cols, scan_rows);
  uint16 sram = save_dung_info[room_id];
  const uint8 *cd = kDungeonRoomChests;
  uint8 count = 0;
  for (int i = 0; i < (int)kDungeonRoomChests_SIZE && count < 6; i += 3, cd += 3) {
    uint16 chest_room = *(const uint16 *)cd;
    if ((chest_room & 0x7fff) != room_id) continue;
    if (count >= drawn) continue;

    uint16 mask = kSimChestMasks[count];
    uint8 is_open = current ? ((dung_savegame_state_bits & mask) ? 1 : 0)
                            : ((sram & (mask >> 4)) ? 1 : 0);

    uint8 pos_known = 0, col = 0xFF, row = 0xFF;
    if (current) {
      uint16 loc = dung_chest_locations[count];
      if (loc != 0) {
        uint16 pos = (loc & 0x7fff) >> 1;
        col = (uint8)(pos & 0x3f);
        row = (uint8)(pos >> 6);
        pos_known = 1;
      }
    } else if (scan_cols[count] != 0xFF) {
      // Remote room: the chest object's draw position (same slot order — each
      // drawn chest takes slot == its scan ordinal, matching the live decode).
      col = scan_cols[count];
      row = scan_rows[count];
      pos_known = 1;
    }

    int o = 2 + count * 7;
    g_sim_chests_buf[o + 0] = count;
    g_sim_chests_buf[o + 1] = (chest_room & 0x8000) ? 1 : 0;
    g_sim_chests_buf[o + 2] = cd[2];
    g_sim_chests_buf[o + 3] = is_open;
    g_sim_chests_buf[o + 4] = pos_known;
    g_sim_chests_buf[o + 5] = col;
    g_sim_chests_buf[o + 6] = row;
    count++;
  }
  g_sim_chests_buf[0] = count;
  return (int)g_sim_chests_buf;
}

// ─── Static sprite spawns ───
// Layout: [count(1), sortSetting(1)] then count records of 4 bytes:
//   [spriteType(1), col(1), row(1), flags(1)]
// col/row are 8px-tile positions within the 64x64 room grid. flags: bit0 =
// floor (y>>7), bit1 = drops a small key on death, bit2 = drops the big key —
// from the 0xe4/0xfe|0xfd die-action marker that FOLLOWS the carrier's entry
// (Dungeon_LoadSingleSprite, sprite.c:3662). Overlords (x>=0xe0) and the
// markers themselves are omitted — only spawn sprites are listed.
static uint8 g_sim_sprites_buf[2 + 32 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomSpriteSpawns(int room_id) {
  memset(g_sim_sprites_buf, 0, sizeof(g_sim_sprites_buf));
  if (!SimRoomValid(room_id)) return (int)g_sim_sprites_buf;

  const uint8 *src = kDungeonSprites + kDungeonSpriteOffs[room_id];
  g_sim_sprites_buf[1] = *src++;
  uint8 count = 0;
  for (; *src != 0xff && count < 32; src += 3) {
    uint8 y = src[0], x = src[1], type = src[2];
    if (type == 0xe4 && (y == 0xfe || y == 0xfd)) {
      if (count > 0) g_sim_sprites_buf[2 + (count - 1) * 4 + 3] |= (y == 0xfe) ? 2 : 4;
      continue;
    }
    if (x >= 0xe0) continue;

    int o = 2 + count * 4;
    g_sim_sprites_buf[o + 0] = type;
    g_sim_sprites_buf[o + 1] = (uint8)((x & 0x1f) << 1);
    g_sim_sprites_buf[o + 2] = (uint8)((y & 0x1f) << 1);
    g_sim_sprites_buf[o + 3] = (uint8)(y >> 7);
    count++;
  }
  g_sim_sprites_buf[0] = count;
  return (int)g_sim_sprites_buf;
}

// Native door type → sim kind: 0 normal, 1 small-key, 2 big-key, 3 bombable,
// 4 shutter (clear/curtain gated), 5 switch, 6 trap/one-way. Switch (5) is not
// derivable from the door word alone (floor-switch links live in room objects).
static uint8 SimDoorKind(uint8 t) {
  switch (t) {
    case 0x1c: case 0x20: case 0x22: case 0x24: case 0x26: return 1;
    case 0x1e:                                             return 2;
    case 0x28: case 0x30:                                  return 3;
    case 0x18: case 0x32: case 0x36: case 0x38: case 0x44: return 4;
    case 0x48: case 0x4a:                                  return 6;
    default:                                               return 0;
  }
}

// ─── Doors ───
// Layout: [count(1), pad(1)] then count records of 7 bytes:
//   [direction(1), col(1), row(1), kind(1), nativeType(1), isOpen(1), layer(1)]
// direction 0=N,1=S,2=W,3=E. col/row index the 64-wide dungeon tilemap.
// isOpen: door-open bit (slots 0-3) from the live word for the occupied room or
// the SRAM room word otherwise; always-open doorways (types 0/2) read open.
// layer: 0 = upper/BG2, 1 = lower/BG1 — door position slots 6-11 are the
// lower-layer positions (RoomDraw_NormalRangedDoors_*, dungeon.c:3068).
static uint8 g_sim_doors_buf[2 + 16 * 7];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomDoorInfo(int room_id) {
  memset(g_sim_doors_buf, 0, sizeof(g_sim_doors_buf));
  if (!SimRoomValid(room_id)) return (int)g_sim_doors_buf;

  int current = SimIsCurrentRoom(room_id);
  uint16 open_bits = current ? dung_door_opened : (save_dung_info[room_id] & 0xf000);
  const uint16 *dp = GetRoomDoorInfo(room_id);
  uint8 count = 0;
  for (int i = 0; dp[i] != 0xffff && count < 16; i++) {
    uint16 a = dp[i];
    uint8 dir = (uint8)(a & 3);
    uint8 pos = (uint8)((a >> 4) & 0xf);
    if (pos > 11) pos = 11;
    uint8 type = (uint8)(a >> 8);

    const uint16 *tab = (dir == 0) ? kSimDoorOffs_Up : (dir == 1) ? kSimDoorOffs_Down
                      : (dir == 2) ? kSimDoorOffs_Left : kSimDoorOffs_Right;
    uint16 addr = tab[pos] & 0x1fff;

    uint8 is_open = (type == 0 || type == 2) ? 1
                  : (count < 4 && (open_bits & (0x8000 >> count))) ? 1 : 0;

    int o = 2 + count * 7;
    g_sim_doors_buf[o + 0] = dir;
    g_sim_doors_buf[o + 1] = (uint8)((addr % 128) / 2);
    g_sim_doors_buf[o + 2] = (uint8)(addr / 128);
    g_sim_doors_buf[o + 3] = SimDoorKind(type);
    g_sim_doors_buf[o + 4] = type;
    g_sim_doors_buf[o + 5] = is_open;
    g_sim_doors_buf[o + 6] = (pos >= 6) ? 1 : 0;
    count++;
  }
  g_sim_doors_buf[0] = count;
  return (int)g_sim_doors_buf;
}

// (Door unlock/close and enemy-kill trigger writes live in sim_triggers.c.)

// ─── Overworld static sprite spawns ───
// Layout: [count(1), pad(1)] then count records of 3 bytes:
//   [spriteType(1), col(1), row(1)]
// col/row are 8px-tile positions within the area's 64x64 screen grid, decoded
// from the same 3-byte OW sprite entries the loader reads (Overworld_LoadSprites,
// core/zelda3/src/sprite.c:3743) via the block index the game builds there and
// unpacks into world coordinates in Overworld_LoadProximaSpriteIfAlive
// (sprite.c:3877). The active per-area table is phase-dependent:
// GetOverworldSpritePtr (overworld.c:302) selects the beginning (progress 0/1) /
// first-part (2) / second-part (3) sprite list from the live sram_progress_indicator,
// so calling it reproduces the loader's table choice exactly. Overlord and marker
// entries (type >= 0xf3, i.e. spawn id >= 0xf4) are omitted — only real spawn
// sprites are listed, matching the dungeon query's overlord filter.
static uint8 g_sim_ow_sprites_buf[2 + 48 * 3];

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldSpriteSpawns(int screen_index) {
  memset(g_sim_ow_sprites_buf, 0, sizeof(g_sim_ow_sprites_buf));
  if (screen_index < 0 || screen_index >= 144) return (int)g_sim_ow_sprites_buf;

  const uint8 *src = GetOverworldSpritePtr(screen_index);
  if (!src) return (int)g_sim_ow_sprites_buf;

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

    int o = 2 + count * 3;
    g_sim_ow_sprites_buf[o + 0] = type;
    g_sim_ow_sprites_buf[o + 1] = (uint8)(x_px >> 3);
    g_sim_ow_sprites_buf[o + 2] = (uint8)(y_px >> 3);
    count++;
  }
  g_sim_ow_sprites_buf[0] = count;
  return (int)g_sim_ow_sprites_buf;
}
