/* @layer core-game-hooks @kind native */
// The Japanese name entry: a kana grid of 10 rows by 32 columns (the host's kLangTbl_NameGrid) that
// scrolls under a fixed column the way the US grid does, a bar that moves between rows, and six name
// boxes side by side. Runs in place of NameFile_DoTheNaming's US grid while LanguageJa_On; the scroll,
// sprites and picks are the ones both kana grids share (name_grid_input.c).
//
// A row whose cell under the column is empty (kNameCellNone) is skipped when moving up or down.
#include "game_hooks_internal.h"

enum {
  kRows = 10, kRowStride = 0x20, kCellMask = 0x1ff,
  kBarY0 = 0x3e, kRowPx = 0x10, kScrollX0 = 0x19c,
  kBoxVram = 0x6075, kBoxStep = 1, kCursorX0 = 0xa8, kCursorStep = 8, kCursorY = 0x14,
  kPadDown = 4, kPadVertical = 0xc,
};

static const uint8 *Grid(void) {
  return (const uint8 *)g_language_screens.table[kLangTbl_NameGrid];
}

static uint8 CellAt(int row, int col) {
  return Grid()[(row * kRowStride + col) & kCellMask];
}

static uint8 BarY(void) {
  return (uint8)(kBarY0 + kRowPx * selectfile_var5);
}

static void InputY(void) {
  uint8 a = joypad1H_last & kPadVertical;
  if (a == 0) {
    selectfile_arr2[0] = 0;
    return;
  }
  bool top = (a << 1 | selectfile_var5) == 0x10;
  bool bottom = (a << 2 | selectfile_var5) == 0x19;
  if (!top && !bottom) {
    int step = a == kPadDown ? 1 : -1;
    int row = selectfile_var5;
    for (int n = 0; n < kRows; n++) {
      row = (row + step + kRows) % kRows;
      if (CellAt(row, selectfile_var3) != kNameCellNone)
        break;
    }
    selectfile_var5 = (uint8)row;
    selectfile_var11++;
  }
  selectfile_arr2[1] = a;
}

void GameHook_NameFileJapaneseInit(void) {
  if (!LanguageJa_On())
    return;
  selectfile_var7 = kBarY0;
  selectfile_var8 = kScrollX0;
}

// The name entry's tilemap has a column of one tile at tile column 15 of the grid's map. Drawn from the
// sheets the Japanese layout loads it shows as a line that stays put while the grid scrolls, which the
// Japanese screen does not have, so it is set to the tilemap's empty tile.
static void ClearDivider(void) {
  for (int row = 0; row < kMapRows; row++) {
    uint16 *tile = &g_zenv.vram[kGridMapVram + row * kMapRows + kDividerCol];
    if (*tile == kDividerTile)
      *tile = kEmptyTile;
  }
}

bool GameHook_NameFileJapanese(void) {
  if (!LanguageJa_On())
    return SelectUsJaName_Frame();
  ClearDivider();
  NameGrid_ScrollX(kScrollX0);
  NameGrid_ScrollY(BarY, InputY);
  NameGrid_DrawSprites((uint8)(kCursorX0 + selectfile_var4 * kCursorStep), kCursorY);
  if (selectfile_var9 | selectfile_var11)
    return true;
  return NameGrid_HandleInput(CellAt(selectfile_var5, selectfile_var3), kBoxVram, kBoxStep);
}
