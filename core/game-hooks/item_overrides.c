#include "game_hooks_internal.h"

#define MAX_OVERRIDES 256

typedef struct {
  uint16 room_id;
  uint8 original_item;
  uint8 new_item;
} ItemOverride;

static ItemOverride g_overrides[MAX_OVERRIDES];
static int g_override_count = 0;

uint8 GameHook_OverrideChestItem(uint16 room_id, uint8 original_item) {
  for (int i = 0; i < g_override_count; i++) {
    if (g_overrides[i].room_id == room_id && g_overrides[i].original_item == original_item) {
      printf("[Randomizer] Room %d: item 0x%02x -> 0x%02x\n",
             room_id, original_item, g_overrides[i].new_item);
      return g_overrides[i].new_item;
    }
  }
  return original_item;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetItemOverride(int room_id, int original_item, int new_item) {
  if (g_override_count >= MAX_OVERRIDES) {
    printf("[Randomizer] Override table full!\n");
    return;
  }
  // Update existing entry if one matches
  for (int i = 0; i < g_override_count; i++) {
    if (g_overrides[i].room_id == (uint16)room_id && g_overrides[i].original_item == (uint8)original_item) {
      g_overrides[i].new_item = (uint8)new_item;
      printf("[Randomizer] Updated override: room %d, item 0x%02x -> 0x%02x\n",
             room_id, original_item, new_item);
      return;
    }
  }
  g_overrides[g_override_count].room_id = (uint16)room_id;
  g_overrides[g_override_count].original_item = (uint8)original_item;
  g_overrides[g_override_count].new_item = (uint8)new_item;
  g_override_count++;
  printf("[Randomizer] Added override: room %d, item 0x%02x -> 0x%02x\n",
         room_id, original_item, new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearItemOverrides(void) {
  g_override_count = 0;
  printf("[Randomizer] Cleared all overrides\n");
}
