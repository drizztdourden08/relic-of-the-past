/* @layer core-wasm-build @kind native */
/**
 * Build-time probe over the engine's own room-object drawer.
 *
 * Rebuilding an object stream from a pre-expanded tilemap needs a catalogue of what every
 * object draws: which cells it touches, on which layer, with which tile words. That catalogue
 * lives in a two-hundred-case switch inside the game, so the only honest way to get it is to
 * ask the game. This draws exactly one object into a scratch pair of tilemaps and reports the
 * cells it wrote, so a harness can enumerate the whole vocabulary once and cache it.
 *
 * Nothing in gameplay calls this. It writes to the live tilemaps and restores WRAM around the
 * call, the same discipline WasmBuildRoomAttrGrid uses.
 */
#include <stdint.h>
#include <string.h>
#include <emscripten.h>

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/dungeon.h"

/** Both layers in full — the widest objects fill a whole room, so nothing is truncated. */
enum { kMaxProbeCells = 0x2000 };
/** A cell no object writes, so "was written" needs no second pass over a clean copy. */
enum { kUnwritten = 0xffff };
/** The two destinations the row-pointer block selects: g_ram 0x2000 and 0x4000. */
enum { kLowerBase = 0x2000, kUpperBase = 0x4000 };
/** Bytes of row pointers the drawer consumes, and the stride of one entry. */
enum { kRowPointerBytes = 33, kRowPointerStride = 3 };

static uint8 g_probe_ram_backup[sizeof(g_ram)];
/** [count][pad] then per cell: [cellLo, cellHi, layer, pad, wordLo, wordHi] */
static uint8 g_probe_cells[4 + kMaxProbeCells * 6];

/**
 * Point the drawer's row-pointer block at one layer.
 *
 * The two blocks the game keeps differ only in the bank byte of each entry, so the upper one
 * is the lower one plus 0x20 rather than a second copy transcribed here.
 */
static void SelectLayer(int upper) {
  uint8 *block = &g_ram[0xbf];
  for (int i = 1; i < kRowPointerBytes; i += kRowPointerStride)
    block[i] = (uint8)((block[i] & 0x0f) | (upper ? 0x40 : 0x20));
}

static void RecordCells(void) {
  uint16 count = 0;
  for (int layer = 0; layer < 2; layer++) {
    const uint16 *map = (const uint16 *)&g_ram[layer ? kUpperBase : kLowerBase];
    for (int cell = 0; cell < 0x1000; cell++) {
      if (map[cell] == kUnwritten || count >= kMaxProbeCells)
        continue;
      uint8 *out = &g_probe_cells[4 + count * 6];
      out[0] = (uint8)cell;
      out[1] = (uint8)(cell >> 8);
      out[2] = (uint8)layer;
      out[3] = 0;
      out[4] = (uint8)map[cell];
      out[5] = (uint8)(map[cell] >> 8);
      count++;
    }
  }
  g_probe_cells[0] = (uint8)count;
  g_probe_cells[1] = (uint8)(count >> 8);
  g_probe_cells[2] = g_probe_cells[3] = 0;
}

/**
 * Draw one object and report the cells it wrote.
 *
 * `word` and `index` are the three bytes of a stream entry: the little-endian word followed by
 * the object index. `upper` selects the destination layer. Returns a pointer to the cell list.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawObjectInState(int word, int index, int upper, int state_bits);

EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawObject(int word, int index, int upper) {
  return WasmProbeDrawObjectInState(word, index, upper, 0);
}

/**
 * As above, with the room's saved state bits forced.
 *
 * A few objects branch on them — a switch already thrown draws differently from one that is
 * not — so a catalogue taken in a single state is missing shapes rather than wrong.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawObjectInState(int word, int index, int upper, int state_bits) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));
  dung_savegame_state_bits = (uint16)state_bits;

  // A stream the drawer can read: the entry, then a terminator so nothing walks past it.
  uint8 stream[8] = {
    (uint8)word, (uint8)(word >> 8), (uint8)index, 0xff, 0xff, 0xff, 0xff, 0xff,
  };
  // Both maps filled with a value no object writes, so every touched cell is identifiable.
  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  // The floor pass is what installs the row-pointer block; borrow it, then retarget.
  static const uint8 kFloorStream[] = { 0x00, 0x00 };
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(kFloorStream);
  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  SelectLayer(upper);

  dung_load_ptr_offs = 0;
  RoomData_DrawObject((uint16)(stream[0] | (stream[1] << 8)), stream);

  RecordCells();
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_cells;
}

/**
 * Draw one of the eight shared layout templates and report only its own cells.
 *
 * The floor pass runs first because it is what installs the row-pointer block the template
 * draws through, but both maps are cleared again afterwards so what comes back is the
 * template alone. Floors are a tiled pattern a caller can reproduce without the engine.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawTemplate(int layout) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));

  static const uint8 kFloorStream[] = { 0x00, 0x00 };
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(kFloorStream);

  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  dung_load_ptr_offs = 0;
  RoomDraw_DrawAllObjects(GetDefaultRoomLayout(layout & 7));

  RecordCells();
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_cells;
}

/**
 * Draw one door record and report the cells it wrote.
 *
 * Doors are not objects: the drawer reaches them past a marker in the stream and reads them as
 * two-byte records rather than three, so they need their own enumeration. `word` is that record
 * — type in the high byte, position in bits 4-7, direction in bits 0-1.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawDoor(int word, int upper) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));

  static const uint8 kFloorStream[] = { 0x00, 0x00 };
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(kFloorStream);

  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  SelectLayer(upper);
  // A door registers itself as it draws, so the slot cursor and its records are reset first.
  dung_cur_door_idx = 0;
  for (int i = 0; i < 16; i++) {
    dung_door_tilemap_address[i] = 0;
    door_type_and_slot[i] = 0;
    dung_door_direction[i] = 0;
  }
  RoomData_DrawObject_Door((uint16)word);

  RecordCells();
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_cells;
}

/** Staging area for a whole candidate stream, and the attribute table it produces. */
enum { kMaxStreamBytes = 2048 };
static uint8 g_probe_stream[kMaxStreamBytes];
static uint8 g_probe_attrs[0x2000];
/** Both tilemaps as the engine drew them for the staged stream: lower then upper. */
static uint8 g_probe_maps[0x4000];

EMSCRIPTEN_KEEPALIVE
int WasmProbeStreamBuffer(void) { return (int)g_probe_stream; }

/**
 * Draw a whole candidate stream as a room and report the attribute table it derives.
 *
 * A staircase's destination slot is decided by the ORDER stair objects register across the
 * engine's many stair buckets — a cascade a solver should never re-derive. So the solver
 * stages a candidate stream here, the engine draws it exactly the way it draws a real room
 * (floor pass, layout template, three object sections), runs its own attribute passes, and
 * the solver reads the slot attribute each staircase actually received.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeStreamAttrs(void) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));

  // The registration state a real room load resets before drawing.
  dung_num_inter_room_upnorth_stairs = 0;
  dung_num_inter_room_southdown_stairs = 0;
  dung_num_inroom_upnorth_stairs = 0;
  dung_num_inroom_southdown_stairs = 0;
  dung_num_interpseudo_upnorth_stairs = 0;
  dung_num_inroom_upnorth_stairs_water = 0;
  dung_num_activated_water_ladders = 0;
  dung_num_water_ladders = 0;
  dung_some_stairs_unk4 = 0;
  dung_num_stairs_1 = 0;
  dung_num_stairs_2 = 0;
  dung_num_stairs_wet = 0;
  dung_num_inroom_upsouth_stairs_water = 0;
  dung_num_wall_upnorth_spiral_stairs = 0;
  dung_num_wall_downnorth_spiral_stairs = 0;
  dung_num_wall_upnorth_spiral_stairs_2 = 0;
  dung_num_wall_downnorth_spiral_stairs_2 = 0;
  dung_num_inter_room_upnorth_straight_stairs = 0;
  dung_num_inter_room_upsouth_straight_stairs = 0;
  dung_num_inter_room_downnorth_straight_stairs = 0;
  dung_num_inter_room_downsouth_straight_stairs = 0;
  dung_num_star_shaped_switches = 0;
  dung_misc_objs_index = 0;
  dung_index_of_torches = 0;
  dung_num_chests_x2 = 0;
  dung_num_bigkey_locks_x2 = 0;
  dung_cur_door_idx = 0;
  for (int i = 0; i < 16; i++) {
    dung_door_tilemap_address[i] = 0;
    door_type_and_slot[i] = 0;
    dung_door_direction[i] = 0;
    dung_object_pos_in_objdata[i] = 0;
    dung_object_tilemap_pos[i] = 0;
  }

  // The same draw the engine performs on a real room: floor, template, then the three object
  // sections, each to the layer the working streams already draw correctly with in-game.
  const uint8 *stream = g_probe_stream;
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(stream);
  uint16 old_offs = dung_load_ptr_offs;
  dung_layout_and_starting_quadrant = stream[dung_load_ptr_offs];
  dung_load_ptr_offs = 0;
  RoomDraw_DrawAllObjects(GetDefaultRoomLayout(dung_layout_and_starting_quadrant >> 2));
  dung_load_ptr_offs = old_offs + 1;
  SelectLayer(0);
  RoomDraw_DrawAllObjects(stream);
  dung_load_ptr_offs += 2;
  SelectLayer(1);
  RoomDraw_DrawAllObjects(stream);
  dung_load_ptr_offs += 2;
  SelectLayer(0);
  RoomDraw_DrawAllObjects(stream);

  Dungeon_LoadBasicAttribute_full(0x1000);
  Dungeon_LoadObjectAttribute();

  memcpy(g_probe_attrs, dung_bg2_attr_table, sizeof(g_probe_attrs));
  memcpy(g_probe_maps, &g_ram[kLowerBase], 0x2000);
  memcpy(g_probe_maps + 0x2000, &g_ram[kUpperBase], 0x2000);
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_attrs;
}

/** The tilemaps captured by the last WasmProbeStreamAttrs call. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeStreamMaps(void) { return (int)g_probe_maps; }
