/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Debug trace (read by the player control handler in player.c) ───
int g_cheat_trace_frames = 0;

// ─── Cheat State (persists until reset or explicit disable) ───
//
// These are CHEATS, not enhanced-features flags: their defaults below are the
// neutral / no-op values (mult=1, pct=0, trace=0), so with nothing set the
// consumers (GameHook_GetDamageMultiplier / GameHook_ApplyExtraArmor in
// sprite.c/player.c, and the trace read in player.c) reproduce byte-faithful
// vanilla behavior. They are mutated only by the Wasm* setters at the bottom of
// this file (driven from the JS cheats UI), never at startup.
//
// Audit note: unlike the enhanced_features0 bitmask in features.h, cheat state
// lives in these file-local statics rather than a unified config/registry. If a
// single config audit ever needs to enumerate them, surface them through the
// existing GameHook_Get* accessors below (the same pattern features expose) so
// the statics stay the single source of truth.

static uint8 g_cheat_damage_mult = 1;      // Outgoing damage multiplier (1-255); 1 = vanilla no-op
static uint8 g_cheat_extra_armor_pct = 0;   // Extra damage reduction % (0-100), stacks with armor; 0 = vanilla no-op

// ─── Local helpers ───
// clampi() comes from num_util.h (shared with the volume setters).

// True when the engine is in normal interactive gameplay (overworld or indoor).
static inline bool IsInGameplay(void) {
  return main_module_index == MODULE_DUNGEON || main_module_index == MODULE_OVERWORLD;
}

// ─── Accessors (called from hooks in sprite.c / player.c) ───

uint8 GameHook_GetDamageMultiplier(void) {
  return g_cheat_damage_mult;
}

uint8 GameHook_GetExtraArmorPct(void) {
  return g_cheat_extra_armor_pct;
}

// Apply the extra-armor cheat to an incoming damage value. No-op at 0%; otherwise
// reduces by the configured percentage (clamped to a 1-point floor unless 100%),
// stacking with the game's normal armor. Keeps this arithmetic out of the
// vendored core (player.c just calls this hook).
uint8 GameHook_ApplyExtraArmor(uint8 dmg) {
  uint8 pct = GameHook_GetExtraArmorPct();
  if (pct == 0 || dmg == 0) return dmg;
  uint8 reduced = (uint8)((uint16)dmg * (100 - pct) / 100);
  if (reduced < 1) return pct >= 100 ? 0 : 1;
  return reduced;
}

// ─── WASM Exports ───

// Give any item by ID — plays standing receipt animation (hold-up), updates inventory.
// Does NOT mark any check as completed.
// Uses item_receipt_method=0 (standing/NPC style) for natural-looking delivery.
// NOTE: item_id must be 0–75 (0x4B). The game's item receipt arrays
// (kMemoryLocationToGiveItemTo, kValueToGiveItemTo, kReceiveItemGfx, etc.)
// are exactly 76 entries. IDs >= 76 cause out-of-bounds reads that corrupt g_ram.
EMSCRIPTEN_KEEPALIVE
void WasmCheatGiveItem(int item_id) {
  if ((uint8)item_id >= 76) {
    printf("[Cheat] GiveItem: blocked — item_id 0x%02x exceeds max valid receipt ID (0x4B)\n", item_id);
    return;
  }
  if (!IsInGameplay()) {
    printf("[Cheat] GiveItem: blocked — not in gameplay (module=%d)\n", main_module_index);
    return;
  }
  item_receipt_method = 0;
  Link_ReceiveItem((uint8)item_id, 0);
  printf("[Cheat] GiveItem: item=0x%02x\n", item_id);
}

// Set the player's current health directly.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetHealth(int value) {
  uint8 capped = (uint8)clampi(value, 0, link_health_capacity);
  link_health_current = capped;
  link_hearts_filler = 0;  // Cancel any pending heal animation
  printf("[Cheat] SetHealth: %d/%d\n", capped, link_health_capacity);
}

// Set the player's max hearts (capacity). Each heart = 8 units.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetMaxHealth(int value) {
  uint8 capped = (uint8)clampi(value, 8, 160);  // 1-20 hearts (8 units each)
  link_health_capacity = capped;
  if (link_health_current > capped)
    link_health_current = capped;
  printf("[Cheat] SetMaxHealth: capacity=%d\n", capped);
}

// Set rupee goal (game animates counter toward this value).
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetRupees(int value) {
  uint16 capped = (uint16)clampi(value, 0, 999);
  link_rupees_goal = capped;
  printf("[Cheat] SetRupees: %d\n", capped);
}

// Set bombs count.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetBombs(int value) {
  uint8 capped = (uint8)clampi(value, 0, 99);
  link_item_bombs = capped;
  printf("[Cheat] SetBombs: %d\n", capped);
}

// Set arrows count.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetArrows(int value) {
  uint8 capped = (uint8)clampi(value, 0, 99);
  link_num_arrows = capped;
  printf("[Cheat] SetArrows: %d\n", capped);
}

// Refill magic to full.
EMSCRIPTEN_KEEPALIVE
void WasmCheatRefillMagic(void) {
  link_magic_power = 0x80;
  link_magic_filler = 0;
  printf("[Cheat] RefillMagic\n");
}

// Fill a specific bottle slot (0-3) with contents.
// Contents: 0x02=empty, 0x03=red potion, 0x04=green potion, 0x05=blue potion,
//           0x06=fairy, 0x07=bee, 0x08=good bee
EMSCRIPTEN_KEEPALIVE
void WasmCheatFillBottle(int slot, int contents) {
  if (slot < 0 || slot > 3) {
    printf("[Cheat] FillBottle: invalid slot %d\n", slot);
    return;
  }
  link_bottle_info[slot] = (uint8)contents;
  printf("[Cheat] FillBottle: slot=%d contents=0x%02x\n", slot, contents);
}

// Kill all hostile sprites on screen.
// Skips: inactive sprites, friendly NPCs (state != 9 or bump_damage == 0).
EMSCRIPTEN_KEEPALIVE
void WasmCheatKillAllEnemies(void) {
  int killed = 0;
  for (int k = 0; k < 16; k++) {
    uint8 state = sprite_state[k];
    // Only target active/carried/stunned sprites
    if (state != 9 && state != 10 && state != 11)
      continue;
    // Skip sprites with no bump damage (likely friendly NPCs)
    if ((sprite_bump_damage[k] & 0x0f) == 0 && !(sprite_flags5[k] & 0x10))
      continue;
    // Skip sprites immune to everything (flags3 bit 6)
    if (sprite_flags3[k] & 0x40)
      continue;
    sprite_health[k] = 0;
    sprite_give_damage[k] = 1;  // Trigger death in recoil handler
    sprite_state[k] = 6;        // Death animation
    sprite_delay_main[k] = 16;  // Death timer
    killed++;
  }
  printf("[Cheat] KillAllEnemies: killed %d sprites\n", killed);
}

// Set outgoing damage multiplier (1 = normal, 2-255 = multiplied).
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetDamageMultiplier(int mult) {
  g_cheat_damage_mult = (uint8)clampi(mult, 1, 255);
  printf("[Cheat] SetDamageMultiplier: %dx\n", g_cheat_damage_mult);
}

// Set extra armor percentage (0-100). Stacks with existing armor reduction.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetExtraArmorPct(int pct) {
  g_cheat_extra_armor_pct = (uint8)clampi(pct, 0, 100);
  printf("[Cheat] SetExtraArmorPct: %d%%\n", g_cheat_extra_armor_pct);
}

// Start debug tracing for N frames (output goes to browser console).
EMSCRIPTEN_KEEPALIVE
void WasmCheatStartTrace(int frames) {
  g_cheat_trace_frames = (frames < 1) ? 60 : frames;
  printf("[Cheat] StartTrace: %d frames\n", g_cheat_trace_frames);
}

// Query whether the player can currently receive an item via the delivery system.
// Returns 1 if safe to call Link_ReceiveItem, 0 otherwise.
EMSCRIPTEN_KEEPALIVE
int WasmCanReceiveItem(void) {
  // Must be in dungeon or overworld gameplay
  if (!IsInGameplay())
    return 0;
  // Must not be in a submodule (menu, transition, text, etc.)
  if (submodule_index != 0)
    return 0;
  // Must not already be immobilized (receiving item, cutscene, etc.)
  if (flag_is_link_immobilized)
    return 0;
  // Must not be mid-item-use
  if (link_item_in_hand)
    return 0;
  return 1;
}
