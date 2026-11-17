/* @layer core-game-hooks @kind native */
// The file select's layout (select_layout.c). Included from game_hooks.h.
//
// Two independent choices draw the file select screens (select, copy, erase, name entry):
//   - the layout, one of two strategies, picked by the screen style (SelectLayout_Preferred);
//   - the text, which always comes from the profile's language set, as everywhere else.
// The strategies:
//   kSelectLayout_Us  the vendored screens: US tilemaps 100-103, kSelectFile_Gfx0 frame, US stripes,
//                     faerie spots and letter grid, the US font. A set supplies US-layout text through
//                     the same tables (French does). A Japanese set has no US-layout labels yet.
//   kSelectLayout_Ja  the Japanese cartridge's screens (language_ja_*.c): the set's own tilemaps 100-103,
//                     stripes at their Japanese lengths, faerie spots, the 10x32 kana grid and the
//                     512-tile tilemap font. Only a Japanese set carries text for it today.
// A layout runs only while the set carries text for it; otherwise the screens take the layout the set
// does carry, and the US layout when it carries neither. The background sheets of the intro never reach
// these screens in either layout (LanguageScreens_SheetLive).
#pragma once
#include "src/types.h"

enum { kSelectLayout_Us, kSelectLayout_Ja };

// The layout the screen style asks for. The US layout until the style setting exists.
int SelectLayout_Preferred(void);

// Whether the current language set carries the text |layout| draws.
bool SelectLayout_HasText(int layout);

// The layout the language set's own select tilemaps and stripes are drawn for.
int SelectLayout_OfSet(void);

// The layout the file select screens run this frame.
int SelectLayout_Active(void);
