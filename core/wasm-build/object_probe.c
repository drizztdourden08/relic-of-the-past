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
