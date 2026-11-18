/* @layer core-game-hooks @kind native */
// The US name entry with a Japanese set: the vendored screen, frame and name boxes, with the set's kana
// grid in place of the US letters, a page of it at a time (select_us_ja_name_grid.c). The scroll, bar,
// box cursor and picks are the ones both kana grids share (name_grid_input.c), at the US grid's places.
// See select_us_ja.h.
//
// selectfile_var5 holds the virtual row: page var5 / 4, US row var5 % 4. Up and down skip a row whose
// cell under the column is empty, and a move onto another page redraws the grid rows and puts the bar
// on its row at once.
#include "game_hooks_internal.h"

enum {
  kScrollX0 = 0x1f0,
  kBarY0 = 131,
  kRowPx = 0x10,
  kRowsShown = 4,
  kBoxVram = 0x6184,
  kBoxStep = 2,
  kCursorX0 = 31,
  kCursorStep = 16,
  kCursorY = 0x58,
  kPadDown = 4,
  kPadVertical = 0xc,
  kSourceUpload = 1,
  kTurnHoldFrames = kRowPx / 2,
};

bool SelectUsJaName_On(void) {
  return SelectLayout_JapaneseFont() && SelectLayout_ActiveOn(kSelectScreen_Name) == kSelectLayout_Us;
}

static uint8 BarY(void) {
  return (uint8)(kBarY0 + kRowPx * (selectfile_var5 % kRowsShown));
}

// Frames a page turn holds the next up or down move back: the bar jumps rather than slides, so without
// it a press held as long as one row's slide would move on again at once.
static uint8 g_turn_hold;

// The page rows are redrawn with the next upload; one is asked for when nothing else is on its way.
static void TurnPage(void) {
  selectfile_var7 = BarY();
  g_turn_hold = kTurnHoldFrames;
  SelectUsJaName_TurnPage();
  if (nmi_load_bg_from_vram == 0) {
    BYTE(vram_upload_data[0]) = 0xff;
    nmi_load_bg_from_vram = kSourceUpload;
  }
}

static void InputY(void) {
  uint8 a = joypad1H_last & kPadVertical;
  if (a == 0) {
    selectfile_arr2[0] = 0;
    return;
  }
  if (g_turn_hold != 0)
    return;
  int span = SelectUsJaName_RowsShown();
  int step = a == kPadDown ? 1 : -1;
  int v = selectfile_var5;
  for (int n = 0; n < span; n++) {
    v = (v + step + span) % span;
    if (SelectUsJaName_Cell(v, selectfile_var3) != kNameCellNone)
      break;
  }
  int page = selectfile_var5 / kRowsShown;
  selectfile_var5 = (uint8)v;
  if (v / kRowsShown != page)
    TurnPage();
  selectfile_var11++;
  selectfile_arr2[1] = a;
}

bool SelectUsJaName_Frame(void) {
  if (!SelectUsJaName_On())
    return false;
  if (g_turn_hold != 0)
    g_turn_hold--;
  NameGrid_ScrollX(kScrollX0);
  NameGrid_ScrollY(BarY, InputY);
  NameGrid_DrawSprites((uint8)(kCursorX0 + selectfile_var4 * kCursorStep), kCursorY);
  if (selectfile_var9 | selectfile_var11)
    return true;
  return NameGrid_HandleInput(SelectUsJaName_Cell(selectfile_var5, selectfile_var3), kBoxVram, kBoxStep);
}
