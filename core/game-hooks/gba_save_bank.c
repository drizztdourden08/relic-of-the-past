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
  /* Written at the head of a block this code has actually stored, and checked before the block
     is believed. Save RAM that nothing has written reads as 0xff throughout, and a room word of
     0xffff does not decode as an empty room - it decodes as a finished one, every door opened,
     every chest taken and the boss dead. A dungeon whose bank had never been stored therefore
     came up already completed: bosses despawned on the frame they spawned, and the shutters they
     were meant to open were open on arrival. There is no format migration to do, because a block
     without this word is one nothing ever wrote. */
  kBankStoredMagic = 0x5242,
  kBankSavedRoomsMax = (kBankSramSlotStride - 2) / 2,
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
  dst[0] = (uint8)kBankStoredMagic;
  dst[1] = (uint8)(kBankStoredMagic >> 8);
  const uint16 *rooms;
  int count = BankRoomList(&rooms);
  for (int i = 0; i < count; i++) {
    uint16 word = *SaveDungInfoFor(rooms[i]);
    dst[2 + i * 2] = (uint8)word;
    dst[3 + i * 2] = (uint8)(word >> 8);
  }
}

void GameHook_BankSaveLoad(int sram_offset) {
  if (!GbaAlttp_IsBankRoom(kBankFirstRoom))
    return;
  /* The whole bank clears first: a slot that never visited the dungeon must not inherit
     another slot's progress through leftover WRAM. */
  memset(save_dung_info_bank1, 0, kBankRooms * sizeof(uint16));
  const uint8 *src = g_zenv.sram + kBankSramBase + (sram_offset / 0x500) * kBankSramSlotStride;
  if ((uint16)(src[0] | (src[1] << 8)) != kBankStoredMagic)
    return;  /* nothing ever stored this slot's bank, so the cleared array is the truth */
  const uint16 *rooms;
  int count = BankRoomList(&rooms);
  for (int i = 0; i < count; i++)
    *SaveDungInfoFor(rooms[i]) = (uint16)(src[2 + i * 2] | (src[3 + i * 2] << 8));
}

/**
 * Undo the same reading of unwritten memory inside an already-recorded snapshot.
 *
 * A save state carries the bank as it stood in WRAM, so one taken while the all-0xff block was
 * being believed has the finished-dungeon words baked into it, and loading it brings them back
 * however the block itself is fixed. A word of 0xffff is not a room anyone can be standing in -
 * it claims every door open and every chest taken in a room whose quadrants were never even
 * entered - so it is read here as the absence of a record rather than as a record.
 */
void GbaAlttp_SanitizeSaveBank(void) {
  if (!GbaAlttp_IsBankRoom(kBankFirstRoom))
    return;
  for (int i = 0; i < kBankRooms; i++) {
    if (save_dung_info_bank1[i] == 0xffff)
      save_dung_info_bank1[i] = 0;
  }
}
