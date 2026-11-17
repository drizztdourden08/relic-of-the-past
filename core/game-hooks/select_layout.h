/* @layer core-game-hooks @kind native */
// The file select's layout (select_layout.c). Included from game_hooks.h.
//
// Two independent choices draw the file select screens (select, copy, erase, name entry):
//   - the layout, one of two strategies, picked by the screen style option (SelectLayout_Preferred, kJaGfx_FileSelect);
//   - the text, which always comes from the profile's language set, as everywhere else.
// The strategies:
//   kSelectLayout_Us  the vendored screens: US tilemaps 100-103, kSelectFile_Gfx0 frame, US stripes,
//                     faerie spots and letter grid. A set supplies US-layout text through the same
//                     tables (French does). A Japanese set draws its own words into this layout on the
//                     select, copy and erase screens and its kana grid, a page at a time, into the name
//                     entry's letter grid (select_us_ja_*.c). The name entry has no faerie in this layout.
//   kSelectLayout_Ja  the Japanese cartridge's screens (language_ja_*.c): the set's own tilemaps 100-103,
//                     stripes at their Japanese lengths, faerie spots, the 10x32 kana grid.
// The layout is chosen per screen: a screen runs a layout only while the set carries text for it there;
// otherwise it takes the layout the set does carry, and the US layout when it carries neither. A ready
// Japanese set uploads its tilemap font on the file select in both layouts (SelectLayout_JapaneseFont).
// The background sheets of the intro never reach these screens (LanguageScreens_SheetLive); with a
// Japanese set each screen reloads the sheets, BG3 blank and frame palette of its own layout as it opens
// (GameHook_FileSelectScreenGfx), since the name entry reloads none of them.
#pragma once
#include "src/types.h"

enum { kSelectLayout_Us, kSelectLayout_Ja };

// The file select screens, by main module: 1 select, 2 copy, 3 erase, 4 name entry.
enum { kSelectScreen_Select, kSelectScreen_Copy, kSelectScreen_Erase, kSelectScreen_Name };

// The layout the screen style asks for: the Japanese one while kJaGfx_FileSelect is on, else the US one.
// The value is latched: it follows the option only when a file select screen opens (SelectLayout_Sync),
// so a live change never swaps a screen's tilemap under tiles loaded for the other layout.
int SelectLayout_Preferred(void);

// Takes the option's current value into the latch and re-applies the screen assets when it changed.
// Called as each file select screen opens, under force blank, before its tilemap loads.
void SelectLayout_Sync(void);

// Whether the current language set carries the text |layout| draws on |screen|.
bool SelectLayout_HasText(int layout, int screen);

// The layout the language set's own select tilemaps and stripes are drawn for.
int SelectLayout_OfSet(void);

// The screen the current main module draws (kSelectScreen_Select outside modules 2-4).
int SelectLayout_ScreenNow(void);

// The layout |screen| runs.
int SelectLayout_ActiveOn(int screen);

// The layout the current screen runs this frame.
int SelectLayout_Active(void);

// Whether the file select uploads the Japanese set's tilemap font (and moves the sprite sheet above it).
bool SelectLayout_JapaneseFont(void);

// Called from FileSelect_EraseTriforce as each file select screen opens, under force blank: for a
// Japanese set, the background sheets, BG3 blank and frame palette of the layout the screen runs, and
// the name grid's scroll back to 0 (select_screen_gfx.c). Does nothing otherwise.
void GameHook_FileSelectScreenGfx(void);

// Called by Module_NamePlayer_1 in place of SelectFile_Func1: for the Japanese layout the empty stripe
// buffer (its name entry draws no backdrop), otherwise SelectFile_Func1's fill (select_screen_gfx.c).
uint16 *GameHook_NameFileBackdrop(void);

// Called at the top of Module_EraseFile_1: for the Japanese layout, advances past the US frame step,
// which the Japanese screens do not have, and returns true (select_screen_gfx.c).
bool GameHook_SelectFileFrame(void);

// The content line the file select's BG3 split (irq_flag) fires on: 0x38 on a file select screen in
// the Japanese layout, 128 otherwise (select_screen_gfx.c).
int GameHook_FileSelectSplitLine(void);
