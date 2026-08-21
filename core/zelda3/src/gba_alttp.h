#ifndef ZELDA3_GBA_ALTTP_H_
#define ZELDA3_GBA_ALTTP_H_

#include "types.h"

enum { kGbaAlttpEntrance = 0xfe, kGbaAlttpAssetCount = 25 };

extern const uint8 *g_gba_alttp_asset_ptrs[kGbaAlttpAssetCount];
extern uint32 g_gba_alttp_asset_sizes[kGbaAlttpAssetCount];

bool GbaAlttp_IsAvailable(void);
bool GbaAlttp_IsPyramidEntrancePosition(uint16 x, uint16 y);
bool GbaAlttp_IsPalaceActive(void);
bool GbaAlttp_IsPalaceRoom(uint16 room);
void GbaAlttp_BeginPalace(void);
void GbaAlttp_EndPalace(void);
void GbaAlttp_SetupEntrance(void);
const uint8 *GbaAlttp_GetRoomHeader(uint16 room);
const uint16 *GbaAlttp_GetRoomDoors(uint16 room);
bool GbaAlttp_LoadPrebuiltRoom(uint16 room);
void GbaAlttp_ApplyDungeonGraphics(void);
void GbaAlttp_ApplyDungeonPalette(void);

#endif
