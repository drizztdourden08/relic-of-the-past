/* @layer core-game-hooks @kind native */
// The pause box headers and dungeon map floor labels of the French, Canadian and German cartridges.
// Their items and ability boxes carry no header, their pendants and crystals boxes name the box in
// their own words, and the French floor list reads "RC" for the ground floor, "1e", "2e" above it and
// "-1", "-2" below it. The words and tiles come from the host (kLangTbl_PauseHeaders,
// kLangTbl_FloorLabels, read from the cartridge); the label tiles themselves are the cartridge's own
// sprite sheet tiles (a sheet patch). Gate: kFeatures2_LanguageScreens. Off, or with no table, every
// hook leaves the vanilla write as it is.
#include "game_hooks_internal.h"

enum {
  kHeaderWords = 2, kProgressRowWords = 10, kProgressRowFirst = 4, kBoxEdgeColumn = 4, kHudRowWords = 32,
  kFloorDigitTile = 0x1e, kFloorCellHigh = 0x1f00,
};

enum { kFloorPrefix, kFloorSuffix, kFloorGround0, kFloorGround1 };

static const uint16 *PauseHeaders(void) {
  int len = 0;
  if (JaGraphics_HudText(kLangTbl_HudItem, &len) != NULL) return NULL;
  return LANG_PICK(uint16, kLangTbl_PauseHeaders, NULL);
}

void GameHook_PauseBoxHeader(uint16 *dst, int which, int x, int row) {
  const uint16 *words = PauseHeaders();
  if (words == NULL) return;
  uint16 *cell = dst + row * kHudRowWords + x + 2;
  uint16 edge = dst[row * kHudRowWords + x + kBoxEdgeColumn];
  for (int i = 0; i < kHeaderWords; i++) {
    uint16 w = words[which * kHeaderWords + i];
    cell[i] = w != 0 ? w : edge;
  }
}

void GameHook_PauseProgressHeader(uint16 *box, bool crystals) {
  const uint16 *words = PauseHeaders();
  if (words == NULL) return;
  memcpy(box + kHudRowWords, words + kProgressRowFirst + (crystals ? kProgressRowWords : 0),
         kProgressRowWords * sizeof(uint16));
}

// The two label tiles of |floor| (negative below the ground floor) for a cartridge that names its
// ground floor; false for one that numbers it like the US cartridge.
static bool FloorTiles(int floor, uint8 *left, uint8 *right) {
  const uint8 *t = LANG_PICK(uint8, kLangTbl_FloorLabels, NULL);
  if (t == NULL || t[kFloorGround0] == 0) return false;
  if (floor < 0) {
    *left = t[kFloorPrefix];
    *right = (uint8)(kFloorDigitTile + ~floor);
  } else if (floor == 0) {
    *left = t[kFloorGround0];
    *right = t[kFloorGround1];
  } else {
    *left = (uint8)(kFloorDigitTile + floor - 1);
    *right = t[kFloorSuffix];
  }
  return true;
}

void GameHook_FloorLabelCells(uint16 *cells, uint16 mask) {
  uint8 left, right;
  if (!FloorTiles((int8)(uint8)dungmap_cur_floor, &left, &right)) return;
  cells[0] = (kFloorCellHigh | left) & mask;
  cells[1] = (kFloorCellHigh | right) & mask;
}

void GameHook_FloorLabelSprites(OamEnt *oam, int floor) {
  uint8 left, right;
  if (!FloorTiles(floor, &left, &right)) return;
  oam[0].charnum = left;
  oam[1].charnum = right;
}
