/* @layer core-game-hooks @kind native */
// The US file select layout drawn with a Japanese set's words (select_us_ja_labels.c,
// select_us_ja_stripes.c). Included from game_hooks.h.
//
// The select, copy and erase screens keep the vendored US tilemaps, frame and stripes. Every BG3 stripe
// they send passes through GameHook_SelectStripes before it reaches VRAM: each US label is replaced by
// the Japanese line the set's own screens draw (read at runtime from its tilemaps and stripes, extracted
// from the user's Japanese cartridge), placed at the US label's spot and pulled in to fit the US plate,
// and every other tile is moved onto the Japanese tilemap font (names, digits, blanks, hearts).
// Gate: kFeatures2_LanguageScreens with a ready Japanese set and the US layout active on the screen.
#pragma once
#include "src/types.h"

enum { kSelectUsJaLineMax = 32 };

// Whether the Japanese set carries every source the US-layout labels read.
bool SelectUsJa_Ready(void);

// The Japanese line that replaces the US label stripe at |row|, |col| (BG3 screen 0), |len| words long,
// on |screen| (kSelectScreen_*): its tilemap words, in the palette the set draws them with, into |tiles|
// and its first column into |start|. Returns the tile count (0 for a label with no Japanese words), or -1 when no label sits there.
int SelectUsJa_Label(int screen, int row, int col, int len, uint16 *tiles, int *start);

// Called by the NMI with the stripe stream |p| it is about to draw for nmi_load_bg_from_vram |source|.
// Returns the stream to draw: |p| itself, or the translated copy on the US layout with Japanese words.
const uint8 *GameHook_SelectStripes(const uint8 *p, int source);
