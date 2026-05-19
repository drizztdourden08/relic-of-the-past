#ifndef GAME_HOOKS_H
#define GAME_HOOKS_H

#include "src/types.h"

// ─── Item Overrides (item_overrides.c) ───

// Returns the replacement item, or |original_item| if no override is set.
uint8 GameHook_OverrideChestItem(uint16 room_id, uint8 original_item);

// ─── Tracker Notifications (game_hooks.c) ───

// Called from Link_ReceiveItem() whenever the player receives an item.
void GameHook_NotifyItemReceived(uint8 item_id, uint8 method);

// ─── Check Triggers (check_triggers.c) ───

// Programmatically trigger a chest check: sets room flag, gives the item,
// plays the hold-up animation, and fires the JS notification.
void GameHook_TriggerCheck(uint16 room_id, uint8 chest_index, uint8 item_id);

// Programmatically trigger an NPC-type check (Uncle, Sahasrahla, etc.)
void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx);

#endif // GAME_HOOKS_H
