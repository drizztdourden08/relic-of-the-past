/* @layer core-game-hooks @kind native */
// The cheat console's inventory writes: take an item away, lower a tier, empty or remove
// a bottle, set the small-key count, toggle a dungeon's map, compass or big key.
//
// A GIVE never comes through here. It rides Link_ReceiveItem so the hold-up, the message
// and the counters stay the game's own. These are the writes that path has no shape for,
// so they land on the save byte directly and then redo the small amount of derived state
// the receipt would have redone: the HUD item box, the gear palettes, the ability flags.
#include "game_hooks_internal.h"
#include "cheat_inventory.h"
#include "src/load_gfx.h"

// Save-RAM offset of each console slot (cheat_inventory.h). The values are variables.h's
// own; a table instead of a switch so the slot number is the only thing a caller spells.
static const uint16 kCheatSlotOffset[kCheatSlotCount] = {
  0xF340, 0xF341, 0xF342, 0xF343, 0xF344, 0xF345, 0xF346, 0xF347, 0xF348, 0xF349,
  0xF34A, 0xF34B, 0xF34C, 0xF34D, 0xF34E, 0xF34F, 0xF350, 0xF351, 0xF352, 0xF353,
  0xF354, 0xF355, 0xF356, 0xF357, 0xF359, 0xF35A, 0xF35B,
  0xF374, 0xF37A, 0xF36B,
};

// Ability bits misc.c's receipt sets for the two passives that grant a move.
#define kAbility_Swim 0x02
#define kAbility_Run 0x04
#define kAbility_Lift 0x80

static void SetAbilityBit(uint8 bit, bool on) {
  if (on) link_ability_flags |= bit;
  else link_ability_flags &= (uint8)~bit;
}

// The derived state a slot write leaves behind. The receipt path does each of these
// itself on the way through misc.c, so a direct write repeats them here.
static void AfterSlotWrite(int slot, int value) {
  switch (slot) {
    case kCheatSlot_Gloves:
      SetAbilityBit(kAbility_Lift, value != 0);
      Palette_UpdateGlovesColor();
      break;
    case kCheatSlot_Boots: SetAbilityBit(kAbility_Run, value != 0); break;
    case kCheatSlot_Flippers: SetAbilityBit(kAbility_Swim, value != 0); break;
    case kCheatSlot_Sword:
      DecompressSwordGraphics();
      Palette_Load_Sword();
      break;
    case kCheatSlot_Shield:
      DecompressShieldGraphics();
      Palette_Load_Shield();
      break;
    case kCheatSlot_Armor: Palette_Load_LinkArmorAndGloves(); break;
    default: break;
  }
  // The Y-item box holds a 1-based slot number, so an emptied equipped slot lets go of it.
  if (value == 0 && slot <= kCheatSlot_PauseLast && hud_cur_item == slot + 1)
    hud_cur_item = 0;
  Hud_RefreshIcon();
}

// Write one inventory byte. This is the REMOVE and DOWNGRADE path, and the "set exactly this
// tier" path; a give goes through Link_ReceiveItem instead.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetInventorySlot(int slot, int value) {
  if (!CheatGate(kFeatures3_CheatItemGrant)) return;
  if (slot < 0 || slot >= kCheatSlotCount) {
    printf("[Cheat] SetInventorySlot: invalid slot %d\n", slot);
    return;
  }
  if (!CheatConsole_InPlay()) return;
  g_ram[kCheatSlotOffset[slot]] = (uint8)value;
  AfterSlotWrite(slot, value);
  printf("[Cheat] SetInventorySlot: slot=%d value=%d\n", slot, value);
}

// Bottle contents, with the bottle index kept honest. 0 takes the bottle away; 0x02 is an
// empty bottle; 0x03..0x08 the six fills. When no bottle is left the pause slot clears too,
// and when the selected bottle goes the selection moves to the first one still held, so the
// menu never offers a slot with nothing in it.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetBottle(int slot, int contents) {
  if (!CheatGate(kFeatures3_CheatStats)) return;
  if (slot < 0 || slot > 3) {
    printf("[Cheat] SetBottle: invalid slot %d\n", slot);
    return;
  }
  if (!CheatConsole_InPlay()) return;
  link_bottle_info[slot] = (uint8)contents;
  int first = 0;
  for (int i = 0; i < 4 && !first; i++)
    if (link_bottle_info[i]) first = i + 1;
  if (!first)
    link_item_bottle_index = 0;
  else if (!link_item_bottle_index || !link_bottle_info[link_item_bottle_index - 1])
    link_item_bottle_index = (uint8)first;
  if (!first && hud_cur_item == kCheatSlot_BottleIndex + 1)
    hud_cur_item = 0;
  Hud_RefreshIcon();
  printf("[Cheat] SetBottle: slot=%d contents=0x%02x index=%d\n", slot, contents, link_item_bottle_index);
}

// The live small-key count. Refused outside a dungeon, where the byte reads 0xff and means
// nothing; inside one, dungeon.c flushes the count into the per-dungeon array on the next
// room transition, the same way a found key is kept.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetSmallKeys(int count) {
  if (!CheatGate(kFeatures3_CheatStats)) return;
  if (!CheatConsole_InPlay()) return;
  if (link_num_keys == 0xff) {
    printf("[Cheat] SetSmallKeys: not in a dungeon\n");
    return;
  }
  link_num_keys = (uint8)clampi(count, 0, 99);
  Hud_RefreshIcon();
  printf("[Cheat] SetSmallKeys: %d\n", link_num_keys);
}

// Toggle a dungeon's big key, map or compass. |palace_x2| is the game's doubled palace index,
// the value the UI bridge already publishes; the bit is the same one misc.c's receipt sets
// (0x8000 >> (palace_x2 >> 1)). A small key is a count, not a bit: WasmCheatSetSmallKeys.
EMSCRIPTEN_KEEPALIVE
void WasmCheatSetDungeonItem(int kind, int palace_x2, int on) {
  if (!CheatGate(kFeatures3_CheatItemGrant)) return;
  if (!CheatConsole_InPlay()) return;
  if (palace_x2 < 0 || palace_x2 > 0x1a || (palace_x2 & 1)) {
    printf("[Cheat] SetDungeonItem: invalid palace %d\n", palace_x2);
    return;
  }
  uint16 bit = (uint16)(0x8000 >> (palace_x2 >> 1));
  uint16 *word;
  switch (kind) {
    case kCheatDungeonItem_BigKey: word = &link_bigkey; break;
    case kCheatDungeonItem_Map: word = &link_dungeon_map; break;
    case kCheatDungeonItem_Compass: word = &link_compass; break;
    default:
      printf("[Cheat] SetDungeonItem: invalid kind %d\n", kind);
      return;
  }
  if (on) *word |= bit;
  else *word &= (uint16)~bit;
  printf("[Cheat] SetDungeonItem: kind=%d palace=%d on=%d\n", kind, palace_x2, on != 0);
}
