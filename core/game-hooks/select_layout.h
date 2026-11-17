/* @layer core-game-hooks @kind native */
// The file select's layout (select_layout.c). Included from game_hooks.h.
//
// Two independent choices draw the file select screens (select, copy, erase, name entry):
//   - the layout, one of two strategies, picked by the screen style (SelectLayout_Preferred);
//   - the text, which always comes from the profile's language set, as everywhere else.
// The strategies:
//   kSelectLayout_Us  the vendored screens: US tilemaps 100-103, kSelectFile_Gfx0 frame, US stripes,
//                     faerie spots and letter grid. A set supplies US-layout text through the same
//                     tables (French does). A Japanese set draws its own words into this layout on the
//                     select, copy and erase screens (select_us_ja_*.c); its name entry has no US-layout
//                     kana grid yet, so that screen keeps the Japanese layout.
//   kSelectLayout_Ja  the Japanese cartridge's screens (language_ja_*.c): the set's own tilemaps 100-103,
//                     stripes at their Japanese lengths, faerie spots, the 10x32 kana grid.
// The layout is chosen per screen: a screen runs a layout only while the set carries text for it there;
// otherwise it takes the layout the set does carry, and the US layout when it carries neither. A ready
// Japanese set uploads its tilemap font on the file select in both layouts (SelectLayout_JapaneseFont).
// The background sheets of the intro never reach these screens (LanguageScreens_SheetLive).
#pragma once
#include "src/types.h"

enum { kSelectLayout_Us, kSelectLayout_Ja };

// The file select screens, by main module: 1 select, 2 copy, 3 erase, 4 name entry.
enum { kSelectScreen_Select, kSelectScreen_Copy, kSelectScreen_Erase, kSelectScreen_Name };

// The layout the screen style asks for. The US layout until the style setting exists.
int SelectLayout_Preferred(void);

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
