/* @layer core-game-hooks @kind native */
#ifndef ZELDA3_GBA_ALTTP_H_
#define ZELDA3_GBA_ALTTP_H_

#include "src/types.h"
#include "gba_asset_index.generated.h"

extern const uint8 *g_gba_alttp_asset_ptrs[kGbaAlttpAssetCount];
extern uint32 g_gba_alttp_asset_sizes[kGbaAlttpAssetCount];

// "Available" is about the data: the supplement container is loaded. "Enabled" is the
// player's choice. Both must hold before anything appears in the world, so that a user
// who owns the second cartridge but leaves the option off still gets an untouched
// overworld rather than a hole in it.
void GbaAlttp_SetExtraDungeonEnabled(bool enabled);
bool GbaAlttp_IsExtraDungeonEnabled(void);

bool GbaAlttp_IsAvailable(void);
bool GbaAlttp_IsPalaceActive(void);
bool GbaAlttp_IsPalaceRoom(uint16 room);
bool GbaAlttp_UsesFixedHorizontalCamera(void);
const uint8 *GbaAlttp_GetRoomHeader(uint16 room);
const uint16 *GbaAlttp_GetRoomDoors(uint16 room);
bool GbaAlttp_LoadPrebuiltRoom(uint16 room);
void GbaAlttp_ApplyDungeonGraphics(void);
void GbaAlttp_ApplyDungeonPalette(void);
void GbaAlttp_ApplyPyramidEntrance();

// The engine recognises an overworld doorway by the pair of lower 8x8 tiles in the cell at
// the player's feet, matched against a fixed list. The wall the extra opening is cut into is
// built from a course that is not on that list, so this reports the pair belonging to the
// cells that opening draws — the position table still decides where anything actually opens.
bool GbaAlttp_IsExtraEntranceTilePair(uint16 lower_left, uint16 lower_right);

#endif
