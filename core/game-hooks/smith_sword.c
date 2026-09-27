/* @layer core-game-hooks @kind native */
// The sword the smiths keep while they temper it. Paying writes 255 over the sword level
// (sprite_main.c, the tempering payment) and the pickup hands the Tempered Sword back, so the
// level that was handed over is never kept anywhere. Two things need it:
//
//  - a seed's pickup hands over the seed's item in place of the Tempered Sword, and nothing
//    wrote a level back, so the player walked out with no sword at all;
//  - the tracker reads 255 while the smiths work, and has to know which sword is theirs.
//
// So the payment records the level in the hook save bytes (save_bytes.h SRM_SWORD_AT_SMITHS)
// and the pickup gives it back when a seed took the Tempered Sword's place. Recorded only
// while the event ledger records, or while the smiths' gift is armed by a seed; with both off
// nothing here writes a byte and both hooks leave the game's own code to run as it is.
#include "game_hooks_internal.h"
#include "save_bytes.h"

#define SMITHY_VANILLA_ITEM 0x02
#define SWORD_KEPT 0x80
#define SWORD_LEVEL_MASK 0x7f
#define SWORD_AT_THE_SMITHS 255

#define srm_sword_at_smiths (*(uint8 *)(g_ram + SRM_SWORD_AT_SMITHS))

static bool RecordsTheSword(void) {
  return (enhanced_features5 & kFeatures5_EventLedger) != 0 || GameHook_GiftOverrideArmed(SMITHY_VANILLA_ITEM);
}

// Right before the payment writes 255: keep the level being handed over.
void GameHook_SmithTakesSword(void) {
  if (!RecordsTheSword()) return;
  srm_sword_at_smiths = SWORD_KEPT | (link_sword_type & SWORD_LEVEL_MASK);
}

// Right after the pickup's grant. A seed's item took the Tempered Sword's place, so the sword
// the smiths kept goes back to the player. A progressive sword handed over by that grant has
// already moved the level off 255 (GameHook_SwordLevelOwned), so it is left as it is.
void GameHook_SmithReturnsSword(void) {
  uint8 kept = srm_sword_at_smiths;
  if (kept == 0) return;
  srm_sword_at_smiths = 0;
  if (GameHook_GiftOverrideArmed(SMITHY_VANILLA_ITEM) && link_sword_type == SWORD_AT_THE_SMITHS)
    link_sword_type = kept & SWORD_LEVEL_MASK;
}

// The sword level the player owns: what is in hand, or while the smiths work, what they keep.
// Nothing recorded reads as the game's own byte.
uint8 GameHook_SwordLevelOwned(void) {
  uint8 kept = srm_sword_at_smiths;
  if (link_sword_type == SWORD_AT_THE_SMITHS && kept != 0) return kept & SWORD_LEVEL_MASK;
  return link_sword_type;
}

// The raw record for the tracker's inventory export: 0x80 | level, or 0.
uint8 GameHook_SwordAtSmithsRecord(void) {
  return srm_sword_at_smiths;
}
