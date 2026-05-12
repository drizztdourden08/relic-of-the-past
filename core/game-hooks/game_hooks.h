#ifndef GAME_HOOKS_H
#define GAME_HOOKS_H

#include "src/types.h"

// Called from Link_PerformOpenChest() after the vanilla item is resolved.
// Returns the replacement item, or |original_item| if no override is set.
uint8 GameHook_OverrideChestItem(uint16 room_id, uint8 original_item);

// Called from Link_ReceiveItem() whenever the player receives an item.
// item_id: the item index (0x00-0x4B), method: 0=dialog/NPC, 1=chest, 2=boss
void GameHook_NotifyItemReceived(uint8 item_id, uint8 method);

// Programmatically trigger a chest check: sets room flag, gives the item,
// plays the hold-up animation, and fires the JS notification.
// room_id: save_dung_info index (e.g. 0x104 for Link's House)
// chest_index: 0-5, which chest bit in the room
// item_id: the item to give (e.g. 0x12 = Lamp)
void GameHook_TriggerCheck(uint16 room_id, uint8 chest_index, uint8 item_id);

#endif // GAME_HOOKS_H
