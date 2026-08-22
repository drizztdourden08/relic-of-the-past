/* @layer core-game-hooks @kind native */
#ifndef ZELDA3_GBA_ALTTP_H_
#define ZELDA3_GBA_ALTTP_H_

#include "src/types.h"
#include "gba_asset_index.generated.h"

enum { kGbaAlttpEntrance = 0xfe };

extern const uint8 *g_gba_alttp_asset_ptrs[kGbaAlttpAssetCount];
extern uint32 g_gba_alttp_asset_sizes[kGbaAlttpAssetCount];

// "Available" is about the data: the supplement container is loaded. "Enabled" is the
// player's choice. Both must hold before anything appears in the world, so that a user
// who owns the second cartridge but leaves the option off still gets an untouched
// overworld rather than a hole in it.
void GbaAlttp_SetExtraDungeonEnabled(bool enabled);
bool GbaAlttp_IsExtraDungeonEnabled(void);

bool GbaAlttp_IsAvailable(void);
bool GbaAlttp_IsPyramidEntrancePosition(uint16 x, uint16 y);
bool GbaAlttp_IsPalaceActive(void);
bool GbaAlttp_IsPalaceRoom(uint16 room);
bool GbaAlttp_UsesFixedHorizontalCamera(void);
void GbaAlttp_BeginPalace(void);
void GbaAlttp_EndPalace(void);
void GbaAlttp_SetupEntrance(void);
const uint8 *GbaAlttp_GetRoomHeader(uint16 room);
const uint16 *GbaAlttp_GetRoomDoors(uint16 room);
bool GbaAlttp_LoadPrebuiltRoom(uint16 room);
void GbaAlttp_ApplyDungeonGraphics(void);
void GbaAlttp_ApplyDungeonPalette(void);
void GbaAlttp_ApplyPyramidEntrance();

#endif
