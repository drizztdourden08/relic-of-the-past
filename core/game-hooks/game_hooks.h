/* @layer core-game-hooks @kind native */
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

// Programmatically trigger an NPC-type check (Uncle, the village elder, etc.)
void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx);

// Programmatically trigger a standing-overworld-item check: sets the screen's
// event bit and grants the item.
void GameHook_TriggerOverworldCheck(uint8 screen, uint8 mask, uint8 item_id);

// ─── Cheats (cheats.c) ───

// Returns the current outgoing damage multiplier (1 = normal).
uint8 GameHook_GetDamageMultiplier(void);

// Returns extra armor reduction percentage (0-100). Stacks with armor.
uint8 GameHook_GetExtraArmorPct(void);

// Applies the extra-armor cheat to an incoming damage value (no-op at 0%).
uint8 GameHook_ApplyExtraArmor(uint8 dmg);

// ─── Custom player sprite sheets (player_sprite.c) ───

// Overwrite the player gfx asset from a ZSPR sheet and take its palette into the PPU's private player
// bank. |push_live| lands the colors straight away — pass false before the core is initialized.
// Returns false (assets untouched) if the sheet is malformed.
bool PlayerSprite_Apply(const uint8 *data, size_t len, bool push_live);

// Put the stock sheet back and return the player to the shared palette row. No-op when none is applied.
void PlayerSprite_Restore(bool push_live);

// True while a custom sheet is applied.
bool PlayerSprite_HasCustom(void);

// Reload gear palettes so the player's banked colors are rebuilt for the current armor and gloves.
void PlayerSprite_RefreshPalette(void);

// The game loaded a gear palette into the shared sprite row; |src| is the outfit it chose inside
// kPalette_ArmorAndGloves. Mirrors it into the player's private bank when a custom sheet is applied.
void GameHook_PlayerGearPaletteLoaded(const uint16 *src);

// The gloves color was refreshed on its own, without a full gear reload.
void GameHook_PlayerGlovesColorUpdated(void);

// ─── Haptic Events (haptic_events.c) ───

// Called when the player starts a sword swing animation.
// swing_type: 0 = normal full swing, 1 = rapid re-swing (quick slash)
void GameHook_NotifySwordSwing(int swing_type);

// Called when the player's sword connects with an enemy sprite.
void GameHook_NotifySwordHitEnemy(uint8 damage_dealt);

// Called when the player's sword clinks against an invulnerable surface/enemy.
void GameHook_NotifySwordClink(void);

// Called when the player takes damage (damage_amount = hearts lost in 1/8ths).
void GameHook_NotifyDamageTaken(uint8 damage_amount);

// Called when the player uses a Y-button item.
void GameHook_NotifyItemUsed(uint8 item_id);

// Called for environmental haptic events (falling, landing, chest open, etc.)
// event_type: 0=fall_into_pit, 1=land_from_ledge, 2=chest_open, 3=bomb_explode,
//             4=enter_water, 5=mirror_warp, 6=quake, 7=boss_defeated
void GameHook_NotifyEnvironmentalEvent(uint8 event_type);

// Called when hookshot hits a wall and retracts.
void GameHook_NotifyHookshotWall(void);

// Called when boomerang returns to the player (catch).
void GameHook_NotifyBoomerangCatch(void);

#endif // GAME_HOOKS_H
