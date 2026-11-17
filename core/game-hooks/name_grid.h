/* @layer core-game-hooks @kind native */
// The parts both kana name grids share (name_grid_input.c): the Japanese layout's own grid
// (language_ja_naming.c) and the kana grid drawn into the US layout (select_us_ja_naming.c). Included
// from game_hooks.h.
//
// A cell is a byte of the set's kLangTbl_NameGrid: a kana as its tile number folded the way the US grid
// folds a letter ((t & 0xf0) * 2 + (t & 0xf) unfolds it), or one of the control cells below.
#pragma once
#include "src/types.h"

enum {
  kNameCellBack = 0xca,
  kNameCellForward = 0xcb,
  kNameCellBlank = 0xcc,
  kNameCellEnd = 0xcd,
  kNameCellNone = 0xff,
};

// One frame of the sideways scroll toward the column under the cursor, the grid at rest at |origin|
// for column 0, with the US speeds and horizontal input.
void NameGrid_ScrollX(uint16 origin);

// One frame of the bar's slide toward |bar_y|, |input_y| reading up and down once it rests.
void NameGrid_ScrollY(uint8 (*bar_y)(void), void (*input_y)(void));

// The bar across the grid at selectfile_var7 and the box cursor at |cursor_x|, |cursor_y|.
void NameGrid_DrawSprites(uint8 cursor_x, uint8 cursor_y);

// A press on |cell|: a kana or blank goes into the current box (drawn at |box_vram| plus |box_step| per
// box), back and forward move the box cursor, End hands a named file to the vendored End. True when
// the frame is handled; false hands it to the vendored code.
bool NameGrid_HandleInput(uint8 cell, uint16 box_vram, int box_step);
