/* @layer core-game-hooks @kind native */
// The host-owned pause menu's hook surface: the gate queries, the three vendored call-sites in hud.c
// and the teardown. game_hooks.h includes it, so every caller sees these seams.
#ifndef GAME_HOOKS_HOST_MENU_HOOKS_H
#define GAME_HOOKS_HOST_MENU_HOOKS_H

#include "src/types.h"

// True while kFeatures2_HostMenu permits the host to own the pause menu.
bool HostMenu_Allowed(void);

// True while the host's takeover request is in force AND the gate allows it. This is the same
// resolution GameHook_HostMenuHolds makes, minus the flashing-circle tick, so a caller can ask
// without advancing an animation.
bool HostMenu_Holding(void);

// Called as the first statement of Hud_NormalMenu (core/zelda3/src/hud.c). True parks the native
// browse state so the host can draw its own menu over it; the caller must return immediately.
bool GameHook_HostMenuHolds(void);

// Called from Hud_ChooseNextMode: true suppresses the native bottle sub-menu, which the 24-entry
// item ids replace with four addressable bottle slots.
bool GameHook_HostMenuSkipsBottleMenu(void);

// Called from Hud_LookupInventoryItem: true selects the 24-entry inventory table.
bool GameHook_HostMenuNewStyleItems(void);

// Drop the takeover and map hud_cur_item back onto an id the 21-entry table has, re-deriving
// current_item_y from it. Called from GateWordSideEffects the instant kFeatures2_HostMenu reads
// clear. It runs AFTER the bit clears, so the lookup resolves through the table being landed on.
void HostMenu_Restore(void);

// Blank the player character's OAM entries for this frame while the host owns the menu, so the host's
// own portrait is the only one of them on screen. Called from GameHook_ModuleFrameEnd, after the
// module has built its OAM and before the frame is rasterised, and a no-op every other frame.
void HostMenu_HidePlayerOam(void);

#endif  // GAME_HOOKS_HOST_MENU_HOOKS_H
