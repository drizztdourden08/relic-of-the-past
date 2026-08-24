/* @layer core-game-hooks @kind native */
/**
 * Bank 1 of the per-room save words.
 *
 * The room grid's save array is 320 words wedged between other save data, so it cannot grow
 * in place. Rooms in the dungeon page (ids 0x200-0x2FF) keep their words in a second array placed in
 * unclaimed WRAM inside g_ram - save states snapshot it automatically, so their format does
 * not change. Bank-0 ids fall through to the original array untouched.
 *
 * SRAM persistence: the base block's three slots fill the cartridge layout completely, so the
 * bank's words live in the unused tail past the mirror copies. Only the dungeon's own rooms
 * are stored - the rest of the bank is empty by construction - which keeps a slot's extension
 * to one small fixed block.
 */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"

#define save_dung_info_bank1 ((uint16 *)(g_ram + 0xE200))

enum {
  kBankFirstRoom = 0x200,
  kBankEndRoom = 0x300,
  kBankRooms = kBankEndRoom - kBankFirstRoom,
  /* Per-slot extension block in the SRAM tail, past the third slot's mirror. */
  kBankSramBase = 0x1E00,
  kBankSramSlotStride = 0x40,
  kBankSavedRoomsMax = kBankSramSlotStride / 2,
};

uint16 *SaveDungInfoFor(int room) {
  // Gated on the same predicate as every bank behaviour: with the dungeon absent or disabled,
  // every id - including glitched out-of-range ones - indexes the original array exactly as
  // vanilla does, out-of-bounds quirks and all.
  if (GbaAlttp_IsBankRoom((uint16)room))
    return &save_dung_info_bank1[room - kBankFirstRoom];
  return &save_dung_info[room];
}

/** The dungeon's room list, so a slot stores only words that can ever be non-zero. */
static int BankRoomList(const uint16 **rooms) {
  MemBlk ids = GbaAlttpAsset(kGbaAssetRoomIds);
  *rooms = (const uint16 *)ids.ptr;
  int count = (int)(ids.size / sizeof(uint16));
  return count > kBankSavedRoomsMax ? kBankSavedRoomsMax : count;
}

void GameHook_BankSaveStore(int sram_offset) {
  // Fully inert when the dungeon is absent or disabled: no write anywhere, so a vanilla
  // profile's SRAM image is byte-identical to one produced without this code.
  if (!GbaAlttp_IsBankRoom(kBankFirstRoom))
    return;
  uint8 *dst = g_zenv.sram + kBankSramBase + (sram_offset / 0x500) * kBankSramSlotStride;
  memset(dst, 0, kBankSramSlotStride);
  const uint16 *rooms;
  int count = BankRoomList(&rooms);
  for (int i = 0; i < count; i++) {
    uint16 word = *SaveDungInfoFor(rooms[i]);
    dst[i * 2] = (uint8)word;
    dst[i * 2 + 1] = (uint8)(word >> 8);
  }
}

void GameHook_BankSaveLoad(int sram_offset) {
  if (!GbaAlttp_IsBankRoom(kBankFirstRoom))
    return;
  /* The whole bank clears first: a slot that never visited the dungeon must not inherit
     another slot's progress through leftover WRAM. */
  memset(save_dung_info_bank1, 0, kBankRooms * sizeof(uint16));
  const uint8 *src = g_zenv.sram + kBankSramBase + (sram_offset / 0x500) * kBankSramSlotStride;
  const uint16 *rooms;
  int count = BankRoomList(&rooms);
  for (int i = 0; i < count; i++)
    *SaveDungInfoFor(rooms[i]) = (uint16)(src[i * 2] | (src[i * 2 + 1] << 8));
}
