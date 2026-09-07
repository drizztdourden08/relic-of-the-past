/* @layer core-game-hooks @kind native */
// A dungeon prize's PRESENTATION follows the prize that was ASSIGNED, not the room it falls in.
//
// Vanilla can key every part of the reward ceremony off the room, because in vanilla the room
// decides the prize: Eastern Palace always gives the green pendant, Thieves' Town always gives
// crystal 7. Prize shuffle breaks that one-to-one, and every room-keyed lookup then reads for a
// prize that is not the one being handed over. Three of them are out-of-bounds reads, not just
// wrong answers, because their tables are sized for the dungeons that can reach them in vanilla:
//
//   what                          keyed by                              in a pendant dungeon
//   ---------------------------   -----------------------------------   --------------------
//   falling prize kind            kBossFinishedFallingItem[palace]       spawns the pendant art
//   crystal cutscene tile slot    kBossRooms index - 4  (7 entries)      index -4, reads OOB
//   maiden's message              (cur_palace_index_x2 - 10) >> 1 (9)    index -3, reads OOB
//
// So the three symptoms of a crystal assigned to Eastern Palace: a grey (pendant) prize on the
// floor, the crystal graphic drawn from a garbage tilemap offset, and the maiden's line skipped
// for a garbage message id.
//
// Each seam below answers with the vanilla expression when the gate is down or when nothing is
// assigned here, so an unshuffled seed runs byte-for-byte.
//
// EXTENDING THIS to drop an arbitrary pool item instead of a crystal or pendant: the assigned id
// already arrives here raw (AssignedPrizeItem), and every seam already funnels through it. A new
// family needs its spawn kind in KindOfPrizeItem and its own answers for the two cutscene seams
// For a non-prize item that most likely means "do not run the crystal cutscene at all", a
// decision this file is the right place to own.
//
// Gate: kFeatures3_PrizeShuffle, the gate that lets a prize move between dungeons at all.
#include "game_hooks_internal.h"

// The native receive id each dungeon's OWN vanilla prize carries, by palace index; 0 for the
// dungeons that have no falling prize. Mirrors kBossFinishedFallingItem (dungeon.c) and
// kDungeonCrystalPendantBit (zelda_rtl.c), which agree on which three dungeons hold pendants.
static const uint8 kVanillaPrizeItem[13] = {
  0, 0, 0x37, 0x39, 0, 0x20, 0x20, 0x20, 0x20, 0x20, 0x38, 0x20, 0x20,
};

// Ancilla_SpawnFallingPrize's kind argument for each native prize id.
#define PRIZE_KIND_NONE 0
#define PRIZE_KIND_CRYSTAL 6

// The first virtual crystal id and the bit each of the seven banks, mirroring prize_grants.c.
#define PRIZE_VIRT_FIRST 0x7B
#define PRIZE_VIRT_COUNT 7
static const uint8 kPrizeCrystalBit[PRIZE_VIRT_COUNT] = {0x02, 0x10, 0x40, 0x20, 0x04, 0x01, 0x08};

static bool PrizeGate(void) {
  return (enhanced_features3 & kFeatures3_PrizeShuffle) != 0;
}

static int CurPalace(void) {
  return BYTE(cur_palace_index_x2) >> 1;
}

static uint8 KindOfPrizeItem(uint8 item) {
  if (item == 0x20) return PRIZE_KIND_CRYSTAL;
  if (item == 0x37) return 1;  // green
  if (item == 0x39) return 2;  // blue
  if (item == 0x38) return 3;  // red
  return PRIZE_KIND_NONE;
}

/**
 * The id actually assigned to THIS room's prize slot, or -1 when nothing is armed for it. Read
 * from the substitution table instead of from anything the pickup banks, so it answers the same
 * before the prize is taken (the spawn) and during the ceremony that follows (the cutscene).
 */
static int AssignedPrizeItem(void) {
  int palace = CurPalace();
  if (palace < 0 || palace >= 13) return -1;
  uint8 vanilla = kVanillaPrizeItem[palace];
  if (vanilla == 0) return -1;
  return GameHook_PeekNpcGrantRaw(vanilla);
}

/** The palace index whose vanilla crystal is |bit|, or -1 when no dungeon owns it. */
static int PalaceOwningCrystalBit(uint8 bit) {
  for (int palace = 5; palace < 13; palace++) {
    if (kVanillaPrizeItem[palace] == 0x20 && kDungeonCrystalPendantBit[palace] == bit) return palace;
  }
  return -1;
}

/** The palace whose vanilla ceremony matches the crystal assigned here, or -1. */
static int AssignedCrystalPalace(void) {
  int item = AssignedPrizeItem();
  if (item < PRIZE_VIRT_FIRST || item >= PRIZE_VIRT_FIRST + PRIZE_VIRT_COUNT) return -1;
  return PalaceOwningCrystalBit(kPrizeCrystalBit[item - PRIZE_VIRT_FIRST]);
}

/**
 * The kind Ancilla_SpawnFallingPrize drops (dungeon.c's RoomTag_GetHeartForPrize). |vanilla_kind|
 * is the caller's own kBossFinishedFallingItem lookup, returned verbatim with the gate down or
 * with nothing assigned here. This is what makes an assigned crystal fall as a crystal in a
 * pendant dungeon instead of wearing the room's own pendant art.
 */
uint8 GameHook_FallingPrizeKind(uint8 vanilla_kind) {
  if (!PrizeGate()) return vanilla_kind;
  int item = AssignedPrizeItem();
  if (item < 0) return vanilla_kind;
  uint8 kind = KindOfPrizeItem(GameHook_PrizePresentationOf((uint8)item));
  if (kind == PRIZE_KIND_NONE) return vanilla_kind;
  if (kind != vanilla_kind) {
    printf("[Randomizer] Falling prize kind: %d -> %d (assigned 0x%02x)\n", vanilla_kind, kind, item);
  }
  return kind;
}

/**
 * The kCrystal_Tab0 slot the rising-crystal cutscene draws from (dungeon.c's
 * Module07_18_RescuedMaiden). |vanilla_slot| is the caller's own kBossRooms index - 4, which is
 * only in range for the seven dungeons that hold a crystal in vanilla. A crystal assigned
 * anywhere else lands outside that table, so the slot is redirected to the one the assigned
 * crystal's own dungeon uses instead of reading off the end.
 */
int GameHook_CrystalCutsceneSlot(int vanilla_slot) {
  if (!PrizeGate()) return vanilla_slot;
  if (vanilla_slot >= 0 && vanilla_slot < PRIZE_VIRT_COUNT) return vanilla_slot;
  int palace = AssignedCrystalPalace();
  // The tile offsets are a property of the ROOM's layout, and a dungeon that never shows a
  // crystal in vanilla has no offset of its own. The assigned crystal's own dungeon is the
  // closest thing to a right answer, and unlike the vendored expression it is always in range.
  int slot = (palace < 0) ? 0 : (palace <= 9 ? palace - 5 : palace - 6);
  if (slot < 0 || slot >= PRIZE_VIRT_COUNT) slot = 0;
  printf("[Randomizer] Crystal cutscene slot: %d -> %d (out of range for this dungeon)\n",
         vanilla_slot, slot);
  return slot;
}

/**
 * The palace index the maiden's message is chosen from (sprite_main.c's Sprite_AB_CrystalMaiden).
 * |vanilla_x2| is the caller's own cur_palace_index_x2, returned verbatim with the gate down or
 * in a dungeon that holds a crystal already. Elsewhere the message follows the crystal that was
 * actually assigned, which is both in range and the line that crystal is about.
 */
int GameHook_PrizeCutscenePalaceX2(int vanilla_x2) {
  if (!PrizeGate()) return vanilla_x2;
  int palace = vanilla_x2 >> 1;
  if (palace >= 0 && palace < 13 && kVanillaPrizeItem[palace] == 0x20) return vanilla_x2;
  int assigned = AssignedCrystalPalace();
  if (assigned < 0) return vanilla_x2;
  printf("[Randomizer] Crystal cutscene palace: %d -> %d (assigned crystal's own dungeon)\n",
         palace, assigned);
  return assigned << 1;
}
