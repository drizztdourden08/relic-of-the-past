/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/assets.h"
#include "src/dungeon.h"

/**
 * Give this dungeon's rooms their lightable torches.
 *
 * The engine does not read a torch out of a room's picture. It walks a table of
 * [room, position..., terminator] entries at load and registers what it finds, and that same
 * table is where the game remembers which torches are burning - the position word's high bit.
 * A room with no entry therefore has no torch to light, whatever its art shows, and its lit
 * count can never leave zero.
 *
 * The cartridge ships that table as the base game's with its own dungeon's entries appended
 * past the point the base game stops scanning at, so the fix is the cartridge's own data in
 * the cartridge's own place: copy the appended entries in behind the base ones and move the
 * scan's end past them. Everything after that - registration, drawing, lighting, the lit
 * count, the save of which ones are burning - is the engine's existing machinery, untouched.
 */

enum {
  /* Where the base table ends, in bytes, and the engine's own scan bound. */
  kBaseTableBytes = 0x120,
  /* The engine's buffer continues past the base table with a region nothing reads. */
  kTorchDataBytes = 0x180,
};

static uint16 g_torch_scan_end = kBaseTableBytes;

void GbaAlttp_AppendTorchData(void) {
  g_torch_scan_end = kBaseTableBytes;
  if (!GbaAlttp_IsAvailable())
    return;
  MemBlk entries = GbaAlttpAsset(kGbaAssetTorches);
  if (entries.size == 0 || kBaseTableBytes + entries.size > kTorchDataBytes)
    return;
  memcpy((uint8 *)dung_torch_data + kBaseTableBytes, entries.ptr, entries.size);
  g_torch_scan_end = (uint16)(kBaseTableBytes + entries.size);
}

/**
 * Where a torch's state is written back when it burns out.
 *
 * The engine takes the low byte of the entry's offset, which is exact for the base table it
 * was written for and folds anything past it back onto a base entry - so an appended entry
 * would put this dungeon's torch state on top of a base room's torch positions. Entries in
 * the appended range address themselves; everything else keeps the engine's own arithmetic.
 */
uint16 GbaAlttp_TorchDataOffset(uint16 offset) {
  if (offset >= kBaseTableBytes && offset < g_torch_scan_end)
    return offset;
  return (uint16)(offset & 0xff);
}

/**
 * Register this room's torches, the way the room loader would have.
 *
 * A baked room installs its picture and returns before the loader reaches its object passes,
 * so the torch walk it would have run has to happen here instead. This is that walk, over the
 * same table, ending in the same engine call: the entry's position word carries the lit bit,
 * and the byte offset handed alongside it is what the lighting code writes that bit back
 * through, so the state lands in the table exactly as it does for a base room.
 */
void GbaAlttp_RegisterBakedTorches(uint16 room) {
  dung_index_of_torches = dung_index_of_torches_start = dung_misc_objs_index;
  for (uint16 at = 0; at < g_torch_scan_end;) {
    bool mine = dung_torch_data[at >> 1] == room;
    at += 2;
    while (at < g_torch_scan_end && dung_torch_data[at >> 1] != 0xffff) {
      if (mine)
        DrawObjects_LightableTorch(dung_torch_data[at >> 1], at);
      at += 2;
    }
    at += 2;
    if (mine)
      return;
  }
}
