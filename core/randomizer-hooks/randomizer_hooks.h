#ifndef RANDOMIZER_HOOKS_H
#define RANDOMIZER_HOOKS_H

#include "src/types.h"

// Called from Link_PerformOpenChest() after the vanilla item is resolved.
// Returns the replacement item, or |original_item| if no override is set.
uint8 RandomizerHook_OverrideChestItem(uint16 room_id, uint8 original_item);

#endif // RANDOMIZER_HOOKS_H
