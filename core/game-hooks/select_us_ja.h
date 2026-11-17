/* @layer core-game-hooks @kind native */
// The US file select layout drawn with a Japanese set's words (select_us_ja_labels.c,
// select_us_ja_stripes.c, and the name entry's select_us_ja_naming.c, select_us_ja_name_grid.c).
// Included from game_hooks.h.
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

// The name entry in the US layout with a Japanese set (select_us_ja_naming.c, select_us_ja_name_grid.c):
// the set's kana grid shown three rows at a time in the US grid's first three rows, its control row
// (back, forward, End) in the fourth, read at runtime from the set's name entry tilemap and grid table.
// Moving down from the control row turns to the next page, up from a page's first row to the previous
// page's control row; the grid wraps after the last page.

// Whether the set carries the name entry's tilemap and a grid with a control row.
bool SelectUsJaName_Ready(void);

// The name entry runs the US layout with a Japanese set (the gate is on and the set ready).
bool SelectUsJaName_On(void);

// select_file.c NameFile_DoTheNaming, through GameHook_NameFileJapanese: one frame of the grid. True
// when it handled the frame; false hands it to the vendored code (off, or End with a name).
bool SelectUsJaName_Frame(void);

// The page selectfile_var5 is on, appended to |out| as BG3 stripes over the US grid rows (with the
// control row when |controls|). Returns the bytes written, -1 when |room| is too small.
int SelectUsJaName_AppendPage(uint8 *out, int room, bool controls);

// The name entry's upload stream |p|, with the page appended once a page turn asked for it.
const uint8 *SelectUsJaName_Upload(const uint8 *p);

// Asks the next upload to redraw the page rows.
void SelectUsJaName_TurnPage(void);

// The cell at column |col| of virtual row |v| (page v / 4, its fourth row the control row), or
// kNameCellNone past the grid's last row.
uint8 SelectUsJaName_Cell(int v, int col);

// The virtual rows over every page, after which the grid wraps.
int SelectUsJaName_RowsShown(void);
