/* @layer core-game-hooks @kind native */
// The haunted stump in the Dark World grove hands out the digging tool. Its script has
// no completion flag: every line it says reads the shared shovel/flute slot (0 = empty,
// 1 = shovel, 2 = flute, 3 = flute that called the bird). With its grant substituted,
// that slot says nothing about THIS giver. A shovel or flute found elsewhere made it ask
// for the flute forever and the check could never be taken, and a substituted item left
// the slot empty, so it offered the gift again on every talk.
//
// While the stump's grant is armed, the substitution-completion bit for its vanilla
// receive id (npc_overrides.c) stands in for the slot: not taken reads as an empty
// slot, so it offers; taken reads as at least the shovel, so the vanilla flute lines
// that follow the gift still play. Gate down or nothing armed: both hooks return the
// original expressions verbatim.
#include "game_hooks_internal.h"

#define STUMPY_VANILLA_ITEM 0x13

uint8 GameHook_StumpyFluteSlot(void) {
  if (!GameHook_GiftOverrideArmed(STUMPY_VANILLA_ITEM)) return link_item_flute;
  if (!GameHook_SubstitutedGiftTaken(STUMPY_VANILLA_ITEM)) return 0;
  return link_item_flute >= 1 ? link_item_flute : 1;
}

// The sprite prep's "already done" test: the tree form with no dialogue left. Also
// ignores the played-song bit while the gift is still owed, so a file where the flute
// was played to the stump before this gate existed still gets its gift.
bool GameHook_StumpyFinished(void) {
  if (GameHook_GiftOverrideArmed(STUMPY_VANILLA_ITEM) &&
      !GameHook_SubstitutedGiftTaken(STUMPY_VANILLA_ITEM))
    return false;
  return (sram_progress_indicator_3 & 8) || GameHook_StumpyFluteSlot() > 2;
}
