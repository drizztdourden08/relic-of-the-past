/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"


// Simulator trigger writes: door unlock/close and virtual enemy kills. These
// mutate the same SRAM room words the game persists, so a rebuilt attr grid
// (WasmBuildRoomAttrGrid) and the live room agree with the simulated state.

static int SimTrigRoomValid(int room_id) {
  return room_id >= 0 && room_id < (int)(kDungeonRoomOffs_SIZE / 2);
}

static int SimTrigIsCurrentRoom(int room_id) {
  return player_is_indoors && (int)dungeon_room_index == room_id;
}

// ─── Door unlock ───
// Sets a door's open bit exactly like the game does when the player spends a
// small key on it: the room's SRAM word slot, plus the live word when the room
// is loaded. `consume` spends one of the player's keys — the counterpart record
// of the SAME physical doorway in the adjacent room is opened with consume=0.
EMSCRIPTEN_KEEPALIVE
void WasmSimUnlockDoor(int room_id, int door_index, int consume) {
  if (!SimMutateGate()) return;
  if (!SimTrigRoomValid(room_id) || door_index < 0 || door_index > 3) return;
  // Door-open bits are REVERSE-ordered: slot 0 = 0x8000 (kUpperBitmasks).
  uint16 bit = (uint16)(0x8000 >> door_index);
  save_dung_info[room_id] |= bit;
  if (SimTrigIsCurrentRoom(room_id)) dung_door_opened |= bit;
  if (consume && link_num_keys > 0 && link_num_keys != 0xff) link_num_keys -= 1;
}

// ─── Door close ───
// Clears a door's open bit — trap shutters slam shut again behind the player on
// walking into a section that still holds live kill-trigger enemies. Only ever
// meaningful for shutter (kind 4) doors; key doors stay open once unlocked.
EMSCRIPTEN_KEEPALIVE
void WasmSimCloseDoor(int room_id, int door_index) {
  if (!SimMutateGate()) return;
  if (!SimTrigRoomValid(room_id) || door_index < 0 || door_index > 3) return;
  uint16 bit = (uint16)(0x8000 >> door_index);
  save_dung_info[room_id] &= ~bit;
  if (SimTrigIsCurrentRoom(room_id)) dung_door_opened &= ~bit;
}

// ─── Cell locks (big-key locks) ───
// Room object 0x18 "Cell Lock" (dungeon.c:1696) is the keyhole plate sealing a
// jail cell — the captive princess's door. It carries NO door-table record: the
// drawer records it in dung_chest_locations, and the attr post-pass
// (dungeon.c:4041) marks it with 0x8000, which is what OpenChestForItem reads to
// treat the tile as a big-key lock rather than a chest (dungeon.c:5715). Opening
// one needs the dungeon's big key and sets the slot's chest-open bit;
// `case 0x18` then draws nothing, so the tiles stay plain floor.
//
// Slots come from the room's static object data — read exactly like the chest
// scan (sim_queries.c) so remote rooms work and NO loaded-room state is touched;
// rebuilding a room here would clobber the live dungeon globals every other
// query reads. A chest bumps both counters (dungeon.c:1710) while a cell lock
// advances only dung_num_bigkey_locks_x2 (dungeon.c:1697), so both walk one
// shared slot sequence — mirrored below to recover each lock's slot.
// Layout: status(1) then [count(1), pad(1)] then count records of 4 bytes:
//   [slot(1), row(1), col(1), opened(1)]
// Leading status byte: see WasmGetRoomChests in sim_queries.c (1 = gate open and room in range).
static const uint16 kSimChestOpenMasks[6] = { 0x100, 0x200, 0x400, 0x800, 0x1000, 0x2000 };
static uint8 g_sim_locks_buf[1 + 2 + 6 * 4];

// Walk one object layer, tracking the draw-order counters, and record every
// Cell Lock (sub-index 0x18). Returns the offset of the layer's terminator.
static int SimScanLockObjects(const uint8 *p, int off, int *chests_x2, int *locks_x2,
                              uint8 *slots, uint8 *rows, uint8 *cols, int *n) {
  for (;;) {
    uint16 d = *(const uint16 *)(p + off);
    if (d == 0xffff) return off;
    if (d == 0xfff0) break;
    uint8 idx = p[off + 2];
    if ((d & 0xfc) != 0xfc && idx >= 0xf8) {
      uint8 sub = (uint8)(((idx & 7) << 4) | (((d >> 8) & 3) << 2) | (d & 3));
      if (sub == 0x19 || sub == 0x31) {
        *chests_x2 += 2;
        *locks_x2 = *chests_x2;
      } else if (sub == 0x18) {
        if (*n < 6) {
          slots[*n] = (uint8)(*locks_x2 >> 1);
          cols[*n] = (uint8)((d & 0xff) >> 2);
          rows[*n] = (uint8)((d >> 10) & 0x3f);
          (*n)++;
        }
        *locks_x2 += 2;
      }
    }
    off += 3;
  }
  for (;;) {
    off += 2;
    if (*(const uint16 *)(p + off) == 0xffff) return off;
  }
}

// Gated on developer mode — see WasmGetRoomChests in sim_queries.c: the simulator subsystem sits
// entirely behind dev tools, reads included, so the widget can inspect it outside a run too.
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomCellLocks(int room_id) {
  memset(g_sim_locks_buf, 0, sizeof(g_sim_locks_buf));
  if (!SimQueryGate()) return (int)g_sim_locks_buf;
  if (!SimTrigRoomValid(room_id)) return (int)g_sim_locks_buf;
  g_sim_locks_buf[0] = 1;

  uint8 slots[6], rows[6], cols[6];
  int n = 0, chests_x2 = 0, locks_x2 = 0, off = 2;
  const uint8 *p = GetDungeonRoomLayout(room_id);
  for (int layer = 0; layer < 3; layer++) {
    off = SimScanLockObjects(p, off, &chests_x2, &locks_x2, slots, rows, cols, &n);
    off += 2;
  }

  uint16 sram = save_dung_info[room_id];
  uint8 count = 0;
  for (int i = 0; i < n; i++) {
    if (slots[i] > 5) continue;
    uint16 mask = kSimChestOpenMasks[slots[i]];
    uint8 open = (uint8)((sram & (mask >> 4)) ? 1 : 0);
    if (!open && SimTrigIsCurrentRoom(room_id) && (dung_savegame_state_bits & mask)) open = 1;
    int o = 3 + count * 4;
    g_sim_locks_buf[o + 0] = slots[i];
    g_sim_locks_buf[o + 1] = rows[i];
    g_sim_locks_buf[o + 2] = cols[i];
    g_sim_locks_buf[o + 3] = open;
    count++;
  }
  g_sim_locks_buf[1] = count;
  return (int)g_sim_locks_buf;
}

// Open a cell lock the way OpenChestForItem does for a big-key lock: set the
// slot's chest-open bit in the room's SRAM word (and the live copy when the
// room is loaded). Big keys are permanent per dungeon, so nothing is consumed.
EMSCRIPTEN_KEEPALIVE
void WasmSimOpenCellLock(int room_id, int slot) {
  if (!SimMutateGate()) return;
  if (!SimTrigRoomValid(room_id) || slot < 0 || slot > 5) return;
  save_dung_info[room_id] |= (uint16)(kSimChestOpenMasks[slot] >> 4);
  if (SimTrigIsCurrentRoom(room_id)) dung_savegame_state_bits |= kSimChestOpenMasks[slot];
}

// ─── Captive-princess rescue progression ───
// Touching the princess in her cell runs the in-cell sprite handler's case 4
// "TransitionToTagalong" (sprite_main.c:6299): she becomes the player's follower
// and the save's starting point moves to the sewers. The tagalong is what opens
// the throne room's push-wall passage, so the simulator writes the same two values.
EMSCRIPTEN_KEEPALIVE
void WasmSimFollowerAttach(void) {
  if (!SimMutateGate()) return;
  which_starting_point = 2;
  follower_indicator = 1;
}

// The priest scene at the sanctuary runs the entering-sanctuary sprite handler's
// case 1 (sprite_main.c:6337): progress indicator 2 = "rescued", starting point
// back to 1, and she stops following (she stays behind as a room sprite).
EMSCRIPTEN_KEEPALIVE
void WasmSimFollowerRescue(void) {
  if (!SimMutateGate()) return;
  which_starting_point = 1;
  sram_progress_indicator = 2;
  follower_indicator = 0;
}

// ─── Enemy-kill trigger ───
// "Virtually kill" a room's meaningful enemy: marks the room's SRAM word with
// the drop-taken bit (0x400 — key/big-key drops) or the enemies-cleared bit
// (0x800 — shutter triggers, item_id 0xff), and grants the drop through the
// normal receive path so counters/flags update exactly like a real kill.
EMSCRIPTEN_KEEPALIVE
void WasmSimKillDrop(int room_id, int item_id) {
  if (!SimMutateGate()) return;
  if (!SimTrigRoomValid(room_id)) return;
  save_dung_info[room_id] |= (item_id == 0xff) ? 0x800 : 0x400;
  if (item_id != 0xff) {
    item_receipt_method = 0;
    SimCountReceive(3, (uint8)item_id);
    Link_ReceiveItem((uint8)item_id, 0);
  }
}

// ─── Scripted event triggers ───
// Two milestones the run reaches by interacting with a sprite rather than by
// opening anything, so nothing else in the save records them.

// The throne room's movable mantle (Sprite_EE_MovableMantle, sprite_main.c:1335)
// stamps checkpoint 4 the instant the shelf starts sliding, which is also what
// opens the way down to the escape passage. The game additionally demands the
// follower in tow, a lit torch, and enough push velocity; the caller owns those
// preconditions, this records the outcome.
EMSCRIPTEN_KEEPALIVE
void WasmSimPushMantle(void) {
  if (!SimMutateGate()) return;
  which_starting_point = 4;
}

// The first sage's errand (Sprite_Sahasrahla case 1, sprite_main.c:6543). His
// idle handler routes a pendant-less player into the "mark map" branch, which
// raises the map markers; the boots branch (case 2) sets the same byte, so this
// is the outcome either way.
EMSCRIPTEN_KEEPALIVE
void WasmSimMarkMapIcons(void) {
  if (!SimMutateGate()) return;
  savegame_map_icons_indicator = 3;
}
