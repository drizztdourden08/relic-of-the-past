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
const uint8 *GbaAlttp_GetRoomHeader(uint16 room);
const uint16 *GbaAlttp_GetRoomDoors(uint16 room);

/* The dungeon page of the room grid (ids 0x200-0x2FF): its own address space. */
bool GbaAlttp_IsBankRoom(uint16 room);
/* Per-room save word, bank-aware; bank-0 ids resolve to the original array. */
uint16 *SaveDungInfoFor(int room);
void GameHook_BankSaveStore(int sram_offset);
void GameHook_BankSaveLoad(int sram_offset);
void GbaAlttp_PatchTransAuxStaging(void);
void GbaAlttp_PinCameraBounds(void);
bool GbaAlttp_LoadBakedRoom(void);
bool GbaAlttp_IsBakedRoomActive(void);
bool GbaAlttp_SkipAttrLoadForVoidRoom(void);
void GbaAlttp_ApplyBakedAttrOverlay(void);
void GbaAlttp_ApplyDungeonGraphics(void);
void GbaAlttp_SelectDungeonSpriteSheets(uint8 *slot0, uint8 *slot1, uint8 *slot2, uint8 *slot3);

// Fills attributes_for_tile[0x140..0x1bf] from this dungeon's own bank, returning false when
// it does not apply so the caller falls back to the base game's table. Collision is DERIVED
// from that array per drawn tile, so supplying the bank is what lets the engine's own
// attribute pass produce this dungeon's collision instead of a shipped map.
bool GbaAlttp_ApplyDungeonTileAttr(void);

// Room-scoped lists in the engine's own format, or NULL to fall back to the base table.
const uint8 *GbaAlttp_GetRoomSprites(uint16 room);
const uint8 *GbaAlttp_GetRoomSecrets(uint16 room);

// INTERIM. Stamps the entrance chamber's transit strip, which a door record would otherwise
// stamp. Goes away with the interim doorway it exists for.
void GbaAlttp_ApplyDungeonPalette(void);
void GbaAlttp_ApplyPyramidEntrance();

// The engine recognises an overworld doorway by the pair of lower 8x8 tiles in the cell at
// the player's feet, matched against a fixed list. The wall the extra opening is cut into is
// built from a course that is not on that list, so this reports the pair belonging to the
// cells that opening draws — the position table still decides where anything actually opens.
bool GbaAlttp_IsExtraEntranceTilePair(uint16 lower_left, uint16 lower_right);

#endif
