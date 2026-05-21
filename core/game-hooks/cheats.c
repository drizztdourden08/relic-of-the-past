#include "game_hooks_internal.h"

// ─── Cheat State (persists until reset or explicit disable) ───

static uint8 g_cheat_damage_mult = 1;      // Outgoing damage multiplier (1-255)
static uint8 g_cheat_extra_armor_pct = 0;   // Extra damage reduction % (0-100), stacks with armor

// ─── Accessors (called from hooks in sprite.c / player.c) ───

uint8 GameHook_GetDamageMultiplier(void) {
  return g_cheat_damage_mult;
}

uint8 GameHook_GetExtraArmorPct(void) {
  return g_cheat_extra_armor_pct;
}

// ─── WASM Exports ───

// Give any item by ID — plays hold-up animation, updates inventory.
// Does NOT mark any check as completed.
EMSCRIPTEN_KEEPALIVE
void WasmCheatGiveItem(int item_id) {
  if (main_module_index != 7 && main_module_index != 9) {
    printf("[Cheat] GiveItem: blocked — not in gameplay (module=%d)\n", main_module_index);
    return;
  }
  item_receipt_method = 0;
  Link_ReceiveItem((uint8)item_id, 0);
  printf("[Cheat] GiveItem: item=0x%02x\n", item_id);
}

// Set Link's current health directly.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetHealth(int value) {
  uint8 capped = (uint8)(value > link_health_capacity ? link_health_capacity : (value < 0 ? 0 : value));
  link_health_current = capped;
  link_hearts_filler = 0;  // Cancel any pending heal animation
  printf("[Cheat] SetHealth: %d/%d\n", capped, link_health_capacity);
}

// Set Link's max hearts (capacity). Each heart = 8 units.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetMaxHealth(int value) {
  uint8 capped = (uint8)(value > 160 ? 160 : (value < 8 ? 8 : value));  // 1-20 hearts
  link_health_capacity = capped;
  if (link_health_current > capped)
    link_health_current = capped;
  printf("[Cheat] SetMaxHealth: capacity=%d\n", capped);
}

// Set rupee goal (game animates counter toward this value).
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetRupees(int value) {
  uint16 capped = (uint16)(value > 999 ? 999 : (value < 0 ? 0 : value));
  link_rupees_goal = capped;
  printf("[Cheat] SetRupees: %d\n", capped);
}

// Set bombs count.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetBombs(int value) {
  uint8 capped = (uint8)(value > 99 ? 99 : (value < 0 ? 0 : value));
  link_item_bombs = capped;
  printf("[Cheat] SetBombs: %d\n", capped);
}

// Set arrows count.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetArrows(int value) {
  uint8 capped = (uint8)(value > 99 ? 99 : (value < 0 ? 0 : value));
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
  g_cheat_damage_mult = (uint8)(mult < 1 ? 1 : (mult > 255 ? 255 : mult));
  printf("[Cheat] SetDamageMultiplier: %dx\n", g_cheat_damage_mult);
}

// Set extra armor percentage (0-100). Stacks with existing armor reduction.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetExtraArmorPct(int pct) {
  g_cheat_extra_armor_pct = (uint8)(pct < 0 ? 0 : (pct > 100 ? 100 : pct));
  printf("[Cheat] SetExtraArmorPct: %d%%\n", g_cheat_extra_armor_pct);
}
