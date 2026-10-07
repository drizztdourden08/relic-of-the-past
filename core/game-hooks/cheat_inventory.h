/* @layer core-game-hooks @kind native */
// The slot numbering the cheat console uses for a direct inventory write
// (WasmCheatSetInventorySlot, cheat_inventory.c). Slots 0-19 are the pause menu's own
// save order, the twenty bytes at 0xF340..0xF353 with 15 holding the bottle index; the
// seven after them are the passives and the three gear tiers, then the three progress
// bytes; the pause menu draws all of those in its other panels. The TS side (lib/game/cheats.ts) spells the same numbers.
#ifndef GAME_HOOKS_CHEAT_INVENTORY_H
#define GAME_HOOKS_CHEAT_INVENTORY_H

enum {
  kCheatSlot_PauseFirst = 0,
  kCheatSlot_BottleIndex = 15,
  kCheatSlot_PauseLast = 19,
  kCheatSlot_Gloves = 20,
  kCheatSlot_Boots = 21,
  kCheatSlot_Flippers = 22,
  kCheatSlot_MoonPearl = 23,
  kCheatSlot_Sword = 24,
  kCheatSlot_Shield = 25,
  kCheatSlot_Armor = 26,
  // Progress bytes the pause menu draws in its other panels: pendant bits, crystal bits,
  // and the heart-piece count (0-3), which the console toggles the same way.
  kCheatSlot_Pendants = 27,
  kCheatSlot_Crystals = 28,
  kCheatSlot_HeartPieces = 29,
  kCheatSlotCount = 30,
};

// True in normal play: overworld, dungeon or special overworld area, with no submodule (menu,
// message, transition) running. Every console write that redraws the HUD waits for it, since the HUD
// shares BG3 with the message box. Defined in cheat_capacity.c.
bool CheatConsole_InPlay(void);

// The four dungeon-item families, in the order dungeon_item_ids.h uses for its kind nibble.
enum {
  kCheatDungeonItem_SmallKey = 0,
  kCheatDungeonItem_BigKey = 1,
  kCheatDungeonItem_Map = 2,
  kCheatDungeonItem_Compass = 3,
};

#endif  // GAME_HOOKS_CHEAT_INVENTORY_H
