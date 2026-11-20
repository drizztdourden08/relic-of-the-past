/* @layer core-game-hooks @kind native */
// The French, Canadian and German cartridges draw some pause and dungeon map labels their own way
// (language_screens_latin.c). Each hook runs right after the vanilla write it can replace and does
// nothing unless kFeatures2_LanguageScreens is on and the host supplied the matching table.
#pragma once
#include "src/types.h"

// Pause box headers (kLangTbl_PauseHeaders, uint16[24]): words 0-1 the items box header, 2-3 the
// ability box header, 4-13 row 1 of the pendants box, 14-23 row 1 of the crystals box. A header word
// of 0 means the cartridge draws no header there: the box keeps its top edge.
enum { kPauseHeader_Items, kPauseHeader_Ability };

// hud.c Hud_DrawYButtonItems / Hud_DrawAbilityBox, after the header write: |dst| the HUD tilemap,
// |x| the box's left column, |row| the box's top row.
void GameHook_PauseBoxHeader(uint16 *dst, int which, int x, int row);

// hud.c Hud_DrawProgressIcons_*, after the box is drawn: |box| its top-left cell.
void GameHook_PauseProgressHeader(uint16 *box, bool crystals);

// Floor label tiles (kLangTbl_FloorLabels, uint8[4]): the basement prefix, the upper-floor suffix and
// the two tiles of the ground floor. The upper floors then count from the floor above the ground.
// messaging.c DungeonMap_DrawFloorNumbersByRoom, after the two label cells are written.
void GameHook_FloorLabelCells(uint16 *cells, uint16 mask);

// messaging.c DungeonMap_DrawFloorNumberObjects, after the two label sprites of floor |floor| are set.
void GameHook_FloorLabelSprites(OamEnt *oam, int floor);

// The HUD row above the hearts (kLangTbl_HudLifeRow, uint16[6]): HUD columns 22-27 of row 0, where the
// US cartridge draws its dashes and word. hud.c Hud_Rebuild passes kHudTilemapRightPart (12x5 words,
// from column 20) and draws what this returns: a copy with that row's six words replaced, or |orig|.
const uint16 *GameHook_HudRightPart(const uint16 *orig);
