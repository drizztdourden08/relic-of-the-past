/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/dungeon.h"

/**
 * This dungeon's collision bank.
 *
 * It cannot live in the base blob: that blob must be byte-identical whether or not the second
 * cartridge is present, and these 128 bytes come from the cartridge. And it cannot borrow a
 * base-game bank either — the closest one agrees on only 81 of its 128 entries. So the bank
 * ships in the supplement and is handed to the engine here, at the point the engine would
 * otherwise read the base table.
 */
bool GbaAlttp_ApplyDungeonTileAttr(void) {
  if (!GbaAlttp_IsPalaceActive())
    return false;
  MemBlk bank = GbaAlttpAsset(kGbaAssetTileAttributes);
  if (bank.size != 0x80)
    return false;
  memcpy(&attributes_for_tile[0x140], bank.ptr, 0x80);
  return true;
}

/**
 * Keep this dungeon's aux tiles through an in-dungeon transition.
 *
 * A door or staircase transition does not rerun the full tileset load: the engine
 * re-decompresses only the four aux sheets into a staging buffer and lets the NMI upload
 * them over VRAM 0x2c00-0x3bff - straight through the middle of the block this dungeon
 * uploads whole. Patching the staging buffer instead of VRAM lets the engine's own upload
 * machinery carry the right pixels, in its own order, on its own frames.
 *
 * The dungeon's sheet block mirrors VRAM words 0x2000-0x3fff, so the aux region sits at
 * byte offset (0x2c00 - 0x2000) * 2 within it.
 */
void GbaAlttp_PatchTransAuxStaging(void) {
  enum { kStaging = 0x10000, kAuxByteOffset = (0x2c00 - 0x2000) * 2, kAuxBytes = 4 * 0x800 };
  if (!GbaAlttp_IsPalaceActive())
    return;
  if (g_gba_alttp_asset_sizes[kGbaAssetBgGfxSnes4bpp] != 512 * 32)
    return;
  memcpy(&g_ram[kStaging], g_gba_alttp_asset_ptrs[kGbaAssetBgGfxSnes4bpp] + kAuxByteOffset, kAuxBytes);
}

void GbaAlttp_ApplyDungeonPalette(void) {
  // Indoors-gated: this runs at the tail of the shared palette load, which also feeds the
  // overworld, and the room id still reads as ours after leaving — so a room-only test would
  // repaint the overworld in this dungeon's colours.
  if (!GbaAlttp_IsPalaceActive())
    return;
  // One record per room, so nothing has to match on the header's palette byte — that byte now
  // names an appended entry in the engine's own palette-set table instead.
  int index = GbaAlttpFindRoom(dungeon_room_index);
  if (index < 0)
    return;
  MemBlk palette = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetBgPalettes), index);
  if (palette.size != 6 * 16 * sizeof(uint16))
    return;
  memcpy(main_palette_buffer + 32, palette.ptr, palette.size);
  memcpy(aux_palette_buffer + 32, palette.ptr, palette.size);
}

/**
 * Choose this room's enemy sheets.
 *
 * Sprite graphics are picked by the room header's enemy blockset, which the engine turns into
 * an index into its own table of sheet quartets. This dungeon's blockset ids mean nothing in
 * that table, so the engine picks a base-game quartet and the right enemies appear wearing the
 * wrong art.
 *
 * What the cartridge contributes is the quartet, not the pixels: measured, 19 of the 21 sheets
 * it references are byte-identical to a base game sheet, and the extraction already translates
 * its ids into the engine's. So this only replaces the four subset numbers and lets the engine
 * load them the way it loads everyone else's — which matters, because enemies draw from tile
 * numbers baked into the sprite code that assume the base game's sheet in each slot.
 */
void GbaAlttp_SelectDungeonSpriteSheets(uint8 *slot0, uint8 *slot1, uint8 *slot2, uint8 *slot3) {
  enum { kSlots = 4, kUnchanged = 0xff };
  if (!GbaAlttp_IsPalaceActive())
    return;
  const uint8 *header = GbaAlttp_GetRoomHeader(dungeon_room_index);
  if (!header)
    return;

  MemBlk blocksets = GbaAlttpAsset(kGbaAssetEnemyBlocksets);
  int tileset = -1;
  for (uint32 i = 0; i < blocksets.size; i++) {
    if (blocksets.ptr[i] == header[3]) {
      tileset = (int)i;
      break;
    }
  }
  if (tileset < 0)
    return;

  MemBlk wanted = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetSpriteTilesets), (size_t)tileset);
  if (wanted.size < kSlots)
    return;
  uint8 *slots[kSlots] = { slot0, slot1, slot2, slot3 };
  for (int i = 0; i < kSlots; i++) {
    if (wanted.ptr[i] != kUnchanged)
      *slots[i] = wanted.ptr[i];
  }
}
