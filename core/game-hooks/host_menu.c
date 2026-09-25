/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Host-owned pause menu ───
// kFeatures2_HostMenu hands the pause menu to the host: the native browse state is held in place so
// the renderer can draw its own screen over it, the inventory lookup switches to the 24-entry table
// (so the four bottles and the shovel become addressable ids instead of one shared slot), and the
// host gets the native menu's continue and save-and-quit exits.
//
// Unlike hud_override.c there is no per-frame reconcile here, and that is deliberate, not an
// omission. The HUD masks are state the NMI consumes elsewhere, so a request made before the gate
// word reaches WRAM had to be remembered and re-resolved every frame. The hold is not state: it is a
// question the vendored menu asks us once per frame, at the moment it matters, and every export
// below re-reads the gate at its own call. Order of arrival therefore cannot strand anything. A
// takeover requested before the gate opens starts holding on the frame the gate opens.
//
// The one thing that DOES need undoing is hud_cur_item: while the gate is open the host may park a
// 24-entry id (a bottle, or the shovel) in it, and the 21-entry table the game falls back to has no
// such row. HostMenu_Restore maps it back, and zelda_rtl.c calls that from GateWordSideEffects
// after the bit clears, so the value is re-derived through the table it is landing on.

// The host's standing request. Never gated at the point it is recorded; see the note above.
static bool g_wanted_takeover;

// Set the moment the host drives the item register or takes the menu over, and cleared by the
// teardown. It scopes the ONE mapping below that is not idempotent: a bottle id lands on
// kHudItem_BottleOld, which is the very number the shovel rule maps to the flute, so without this
// the next unrelated word-3 change would walk an already-mapped value a step further.
static bool g_host_owns_item;

bool HostMenu_Allowed(void) {
  return HostMenuGate();
}

// The hold without the side effect. Used by the state export and the export below, which must be able
// to ask the same question the menu asks without also advancing the cursor animation.
bool HostMenu_Holding(void) {
  return g_wanted_takeover && HostMenuGate();
}

// True while the native pause menu is the module actually running (main module 14, messaging
// submodule 1 => Hud_Module_Run). overworld_map_state is shared with the dungeon map and the
// overworld map, which run under the same main module on other submodules, so an unguarded write
// from the host would drive one of those state machines instead.
static bool HostMenu_InPauseModule(void) {
  return main_module_index == MODULE_MENU && submodule_index == 1;
}

// Where Hud_BringMenuDown parks the menu's scroll offset: 29 frames of -8, ending on -232, which is
// the value it tests for before advancing the machine past the open scroll.
#define kHudMenuScrolledDown 0xff18

// Has the open scroll FINISHED? The precondition for handing the machine to its close state, and the
// reason that hand-off is not unconditional.
//
// Hud_CloseMenu is `BG3VOFS_copy2 += 8; if (BG3VOFS_copy2) return;`. It terminates only by landing
// exactly on zero, so it has to start from a multiple of 8 below it, and the open scroll is what
// puts it there. Started from anywhere else (mid-scroll, most of all) the offset instead walks the
// entire 16-bit range before it comes back to zero: roughly two minutes of a frozen game with the
// menu neither open nor closed, and nothing the player can press to end it.
//
// States 3 (Hud_ChooseNextMode), 4 (Hud_NormalMenu, the state the hold parks) and 5 (Hud_UpdateHud)
// are exactly the states that follow a completed scroll. The bottle states 7-12 also sit past the
// scroll but are unreachable while the hold is in force (call-site 2 refuses the sub-menu), so
// excluding them costs nothing and keeps this to the states the host can actually be looking at.
static bool HostMenu_OpenScrollFinished(void) {
  return HostMenu_InPauseModule() && overworld_map_state >= 3 && overworld_map_state <= 5 &&
         BG3VOFS_copy2 == kHudMenuScrolledDown;
}

// Call-site 1 is the first statement of Hud_NormalMenu (browse state 4). Returning true parks the
// native menu: no input handling, no cursor movement, no bottle sub-menu, and no tilemap redraw.
// The flashing-circle timer is the one thing the held function still owes, since the host's own
// cursor art is timed off it, so it is ticked here in the vanilla function's place.
bool GameHook_HostMenuHolds(void) {
  if (!HostMenu_Holding())
    return false;
  timer_for_flashing_circle++;
  return true;
}

// Call-site 2. Hud_ChooseNextMode picks the bottle sub-menu (state 10) whenever the equipped id is
// the shared old-style bottle slot. Under the 24-entry ids that same number means the shovel, and in
// either reading the host draws bottles itself, so the sub-menu must never be entered.
bool GameHook_HostMenuSkipsBottleMenu(void) {
  return HostMenuGate();
}

// Call-site 3 is Hud_LookupInventoryItem. Selects the 24-entry table, which is what makes ids 21-24
// (the four bottles individually) and 16 (the shovel, split from the flute) resolve at all.
bool GameHook_HostMenuNewStyleItems(void) {
  return HostMenuGate();
}

// Teardown, run from GateWordSideEffects once kFeatures2_HostMenu already reads clear. Drops the
// request and maps hud_cur_item back onto a row the 21-entry table has, then re-derives
// current_item_y from it through the fallback table, which is why this runs after the bit clears.
void HostMenu_Restore(void) {
  g_wanted_takeover = false;
  // Read before clearing: the shovel rule is the session-scoped half. The out-of-range clamp is NOT
  // scoped, on purpose. A state saved during a takeover and loaded in a fresh session carries a
  // bottle id in WRAM with this flag false, and leaving it there would index the 21-entry table out
  // of bounds the first time the game looked the item up.
  bool shovel_was_ours = g_host_owns_item && hud_cur_item == kHudItem_Shovel;
  g_host_owns_item = false;
  // The two rules are exclusive, not sequential: a bottle id becomes the single shared bottle slot,
  // and only an id that was ALREADY that number (the shovel shares it) becomes the flute.
  if (hud_cur_item > 20)
    hud_cur_item = kHudItem_BottleOld;
  else if (shovel_was_ours)
    hud_cur_item = kHudItem_Flute;
  else
    return;  // already an id the fallback table has a row for; nothing to re-derive
  Hud_UpdateEquippedItem();
  flag_update_hud_in_nmi++;
}

// ─── Suppressing the native player sprite while the host menu is up ───
//
// The takeover parks the native MENU; it does not stop the world being drawn, so Module0E_Interface
// still runs LinkOam_Main every frame and the character is still standing there, frozen mid-pose.
// The host draws its own animated portrait at exactly that screen position, so without this there are
// two of them in the same place.
//
// Done as a per-frame OAM blank on purpose, instead of writing link_visibility_status = 12 (the
// engine's own "not drawn" flag). That flag is emulated WRAM: a save state taken with the menu open
// would record it, and loading that state in a session where the menu is closed would leave the
// character permanently invisible with nothing to notice it and put it back. This owns no state at
// all: it re-runs from scratch every frame and stops the frame the menu stops running, so there is
// nothing to restore and nothing to leak.
//
// 0xf0 is the engine's canonical hidden Y. ClearOamBuffer writes it into every slot at the top of
// the loop, and LinkOam_CarryWideHighX tests for it to decide an entry is already hidden, so this
// leaves the twelve player entries exactly as they would be had nothing drawn them. The
// wide/tall side channels are cleared alongside, since a stale high bit is what puts a "hidden"
// sprite back on screen 256 px to the right.
#define kPlayerOamEntries 12
#define kOamHiddenY 0xf0

void HostMenu_HidePlayerOam(void) {
  if (!HostMenu_Holding() || !HostMenu_InPauseModule())
    return;
  int base = sort_sprites_offset_into_oam_buffer >> 2;
  if (base < 0 || base + kPlayerOamEntries > 128)
    return;
  for (int i = base; i < base + kPlayerOamEntries; i++) {
    oam_buf[i].y = kOamHiddenY;
    bytewise_extended_oam[i] = 0;
    g_oam_x_high[i] = 0;
    g_oam_y_high[i] = 0;
    g_oam_player[i] = 0;
  }
}

// The abandoned lane design's leftovers. hud_cur_item_x/l/r are the per-button item registers
// kFeatures0_SecondaryItemSlots used to fill, and a save written while that bit was on still carries
// them. Two vendored paths read those bytes with NO feature bit of their own: DidPressButtonForMap
// (messaging.c) moves the map from X to Select the moment hud_cur_item_x is non-zero, and Link's item
// path (player.c, via GetCurrentItemButtonIndex) fires whatever they hold while faking a Y press. The
// host now drives the ONE hud_cur_item register instead, and the modern scheme puts the map on X, so
// the moment the host takes the menu over, these have to read empty or an old save silently
// repurposes the map button. Nothing draws them, so no NMI HUD copy is owed.
static void HostMenu_DropSecondaryItems(void) {
  hud_cur_item_x = 0;
  hud_cur_item_l = 0;
  hud_cur_item_r = 0;
}

// ─── JS-facing exports ───

// GATE: HostMenu. Deferred like WasmSetHudHidden: the request is recorded whatever the gate says
// and resolved at each use, so a settings push that lands before the gate word reaches WRAM is not
// silently dropped.
EMSCRIPTEN_KEEPALIVE
void WasmHostMenuSetTakeover(int on) {
  g_wanted_takeover = (on != 0);
  if (!g_wanted_takeover)
    return;
  g_host_owns_item = true;
  // Gated, unlike the record above: this one writes emulated WRAM, and a write made while the gate
  // is shut would be a divergence nobody asked for. The host re-asserts the takeover on every boot
  // and after every teardown (host-menu.ts reassertHostMenu), so a request that arrives ahead of the
  // gate word is replayed once the gate is open.
  if (HostMenuGate())
    HostMenu_DropSecondaryItems();
}

// GATE: HostMenu. The "continue" exit. State 5 is exactly where the vanilla Start-button branch of
// Hud_NormalMenu sends the machine: Hud_UpdateHud rebuilds the HUD and re-derives the equipped item,
// then Hud_CloseMenu scrolls the menu away and hands the saved module back.
//
// Refused unless the open scroll has finished, because that branch can only ever be taken from a menu
// that is fully down, because it lives inside Hud_NormalMenu, which state 4 alone runs. The host has no such
// guarantee: it can be asked to close a menu it opened three frames ago, and without this check that
// request sends BG3VOFS_copy2 the long way round (see HostMenu_OpenScrollFinished). A refusal is the
// right answer, not a queued close: the player who pressed pause during the open animation can
// press it again, and a close that fires later, unasked, is its own surprise.
EMSCRIPTEN_KEEPALIVE
void WasmHostMenuClose(void) {
  if (!HostMenuGate() || !HostMenu_OpenScrollFinished())
    return;
  overworld_map_state = 5;
  sound_effect_2 = 18;
}

// GATE: HostMenu. The "save and quit" exit, matching what the native save menu does on that choice.
// The menu tilemap is still on screen, so the HUD is rebuilt and the menu state machine reset before
// handing off to the save-and-quit module at its fade submodule.
EMSCRIPTEN_KEEPALIVE
void WasmHostMenuSaveAndQuit(void) {
  if (!HostMenuGate() || !HostMenu_InPauseModule())
    return;
  Hud_Rebuild();
  overworld_map_state = 0;
  sound_effect_ambient = 15;
  main_module_index = 23;
  submodule_index = 1;
  index_of_changable_dungeon_objs[0] = 0;
  index_of_changable_dungeon_objs[1] = 0;
}

// GATE: ModernControls. The whole of the modern control scheme, on the C side. There is no lane
// table and no player.c change: the game has exactly one equipped-item register, and
// Hud_UpdateEquippedItem is what turns it into current_item_y and the bottle index. So the host
// writes that register and ORs the Y bit into the same frame's input, and the game's own item path
// does the rest, which is what makes this scale to any number of buttons and all 24 ids.
EMSCRIPTEN_KEEPALIVE
void WasmHostSetActiveItem(int hudItem) {
  if (!ModernControlsGate())
    return;
  if ((unsigned)hudItem > 24)
    return;
  g_host_owns_item = true;
  if (hud_cur_item == (uint8)hudItem)
    return;  // only on change, since a per-frame rewrite would queue an NMI HUD copy every frame
  hud_cur_item = (uint8)hudItem;
  Hud_UpdateEquippedItem();
  flag_update_hud_in_nmi++;
}

// GATE: HostMenu. For the host's re-assert after a save-state load, which restores WRAM (and with
// it the gate word and hud_cur_item) without the renderer having said anything.
EMSCRIPTEN_KEEPALIVE
int WasmHostMenuIsHolding(void) {
  return HostMenu_Holding() ? 1 : 0;
}
