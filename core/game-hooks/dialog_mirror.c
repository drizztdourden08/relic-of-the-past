/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog mirror ───
// A model of what the text engine has drawn, kept from the events it reports (glyph, scroll, clear,
// command), so the host can draw the message box itself while the native one stays off VRAM. Three
// visible rows of cells, each a glyph id at a pen x with its width, in draw order. A new cell evicts
// any older cell it overlaps on its row: that is what the glyph bitmap does when the choice pointer
// message paints spaces over the old pointer and a new pointer elsewhere.
//
// Exposed as one frozen buffer per call (WasmGetDialogState), the same contract as WasmGetGameUIState.
// Everything lives in hook statics, never WRAM, so the save-state snapshot is untouched. After a state
// load the rows are stale until the next message clears them; the host knows when it loaded one and
// holds its box back until the next clear (dialog-store.ts).

enum { kDialogRows = 3, kDialogCells = 40 };
// The text area is 21 tiles wide; a pen past it is a row the engine itself would not show.
enum { kTextAreaWidthPx = 168 };

typedef struct DialogCell {
  uint8 glyph, x, w;
} DialogCell;

static struct {
  DialogCell rows[kDialogRows][kDialogCells];
  uint8 count[kDialogRows];
  bool bordered, story;
  uint8 last_cmd;
  // The whole message's extent, measured once when it loads: the widest row's right edge in text-area
  // pixels and the most rows any of its screens uses.
  uint8 msg_width, msg_rows;
} g_mirror;
// Counts messages started, so the host can tell a mirror it can trust from one left behind by a
// loaded state (the load itself never touches hook statics).
static uint8 g_generation;
// Raised by the host when it loads a state: the engine's WRAM now holds a picture the mirror never saw, so
// the native box stays visible until the next message starts and the mirror is whole again.
static bool g_stale;

// The engine's own kTextCmd_* values (messaging.c). Duplicated here because the enum is local to the
// vendored file; the pump reports them unchanged through GameHook_DialogCommand.
enum {
  kCmd_Choose = 1, kCmd_Item = 2, kCmd_Selchg = 8, kCmd_Choose3 = 10, kCmd_Choose2 = 11,
  kCmd_Scroll = 12, kCmd_Line1 = 13, kCmd_Line3 = 15, kCmd_Waitkey = 23, kCmd_EndMessage = 24,
  kCmd_IsLetter = 25,
};

// The decoder's packed word, as messaging.c's TEXTCMD_* macros unpack it: bit 0 says the command took
// a second byte, bits 1-5 are the command, the rest its parameter.
static uint8 CmdOf(uint32 packed) { return (packed >> 1) & 0x1f; }
static uint8 ParamOf(uint32 packed) { return (uint8)(packed >> 6); }
static uint8 MultibyteOf(uint32 packed) { return packed & 1; }

// Where RenderText_DrawSelectedYItem blits the 16 px item the picker shows, on the last row.
enum { kItemPickX = 104, kItemPickW = 16 };
// The loaded buffer is at most this long (Text_Initialize_initModuleStateLoop clears 0x7e0 bytes).
enum { kTextBufferBytes = 0x7e0 };

// The attract/story module drives the engine directly (attract.c) instead of module 14.
enum { kModule_Attract = 20 };
// kText_Render states below 2 draw a border first; [Window 02] starts at 2 and never does.
enum { kTextRenderState_Tilemap = 2 };

bool DialogMirror_Recording(void) {
  return (enhanced_features3 & (kFeatures3_HudOverride | kFeatures3_DialogControls)) != 0;
}

uint8 DialogMirror_LastCommand(void) {
  return g_mirror.last_cmd;
}

bool DialogMirror_IsKeyWaitCommand(uint8 cmd) {
  switch (cmd) {
  case kCmd_Choose: case kCmd_Item: case kCmd_Selchg: case kCmd_Choose3: case kCmd_Choose2:
  case kCmd_Waitkey: case kCmd_EndMessage:
    return true;
  default:
    return false;
  }
}

static void EvictOverlap(int line, int x, int w) {
  DialogCell *row = g_mirror.rows[line];
  int n = g_mirror.count[line], kept = 0;
  for (int i = 0; i < n; i++) {
    bool overlaps = row[i].x < x + w && x < row[i].x + row[i].w;
    if (!overlaps) row[kept++] = row[i];
  }
  g_mirror.count[line] = (uint8)kept;
}

void GameHook_DialogGlyph(uint8 c, uint8 line, uint8 x, uint8 w) {
  if (!DialogMirror_Recording() || line >= kDialogRows || x >= kTextAreaWidthPx) return;
  EvictOverlap(line, x, w);
  if (g_mirror.count[line] >= kDialogCells) return;
  g_mirror.rows[line][g_mirror.count[line]++] = (DialogCell){ c, x, w };
}

void GameHook_DialogScrolled(void) {
  if (!DialogMirror_Recording()) return;
  for (int r = 0; r + 1 < kDialogRows; r++) {
    memcpy(g_mirror.rows[r], g_mirror.rows[r + 1], sizeof g_mirror.rows[r]);
    g_mirror.count[r] = g_mirror.count[r + 1];
  }
  g_mirror.count[kDialogRows - 1] = 0;
}

// A dry run of the message: the pen the engine will drive, without drawing. Letters advance the pen by
// the font's width table, a line command moves it to that row, a scroll pushes every row up one and
// parks the pen on the last, the item picker lands its sprite on the last row. Nothing else moves it.
// Rows are never cleared by a key wait, so the most rows on screen is the most rows ever reached.
// The engine's command decoder (messaging.c, not in its header): the same call the pump makes.
uint32 Text_DecodeCmd(uint8 a, const uint8 *src);

void GameHook_DialogMeasure(void) {
  if (!DialogMirror_Recording()) return;
  const uint8 *widths = FindIndexInMemblk(g_zenv.dialogue_font_blk, 1).ptr;
  const uint8 *buf = messaging_text_buffer;
  int pos = 0, line = 0, rows = 1, widest = 0;
  int pen[kDialogRows] = { 0, 0, 0 };
  while (pos < kTextBufferBytes) {
    uint32 packed = Text_DecodeCmd(buf[pos], &buf[pos + 1]);
    uint8 cmd = CmdOf(packed);
    if (cmd == kCmd_EndMessage) break;
    if (cmd == kCmd_IsLetter) {
      int c = ParamOf(packed);
      pen[line] += widths[c & 0x7f];
      if (pen[line] > widest) widest = pen[line];
    } else if (cmd >= kCmd_Line1 && cmd <= kCmd_Line3) {
      line = cmd - kCmd_Line1;
      pen[line] = 0;
      if (line + 1 > rows) rows = line + 1;
    } else if (cmd == kCmd_Scroll) {
      pen[0] = pen[1];
      pen[1] = pen[2];
      pen[2] = 0;
      line = kDialogRows - 1;
      rows = kDialogRows;
    } else if (cmd == kCmd_Item) {
      if (kItemPickX + kItemPickW > widest) widest = kItemPickX + kItemPickW;
      rows = kDialogRows;
    }
    pos += 1 + MultibyteOf(packed);
  }
  g_mirror.msg_width = (uint8)(widest > kTextAreaWidthPx ? kTextAreaWidthPx : widest);
  g_mirror.msg_rows = (uint8)rows;
}

void GameHook_DialogCleared(void) {
  // Ahead of the gate: the box's owner is decided once per message whatever the feature words say,
  // since Skip Dialog withholds the native box with the mirror off (dialog_suppress.c).
  DialogSuppress_MessageStarted();
  if (!DialogMirror_Recording()) return;
  memset(&g_mirror, 0, sizeof g_mirror);
  g_generation++;
  g_stale = false;
  // Runs after Text_LoadCharacterBuffer, so a [Window 02] has already moved the state past the border.
  g_mirror.bordered = text_render_state < kTextRenderState_Tilemap;
  g_mirror.story = main_module_index == kModule_Attract;
  DialogPresence_MessageStarted();
}

void GameHook_DialogCommand(uint8 cmd) {
  if (!DialogMirror_Recording()) return;
  g_mirror.last_cmd = cmd;
}

bool GameHook_DialogNativeHidden(void) {
  return HudOverride_DialogHidden() && !g_stale;
}

EMSCRIPTEN_KEEPALIVE
void WasmDialogMarkStale(void) {
  g_stale = true;
  // The host calls this right after every state load, which is the one moment a box can appear on the
  // text layer without the engine having drawn it this session (dialog_suppress.c).
  DialogSuppress_RepairStrandedBox();
}

// ─── Snapshot ───
// Header, 20 bytes:
//   0 active   1 flags (bit0 bordered, bit1 story, bit2 native box withheld)   2-3 text_msgbox_topleft
//   4 text_render_state   5 last command   6 choice index   7 scroll step (0..15)
//   8-9 dialogue_message_index   10-12 cell count per row   13 generation
//   14 the message's widest row in text-area pixels   15 the most rows it shows
//   16-17 text layer horizontal scroll   18-19 text layer vertical scroll (signed, as the PPU draws)
// Rows follow: 3 x kDialogCells cells of (glyph, x, w).
enum { kSnapshotHeader = 20 };
static uint8 g_snapshot[kSnapshotHeader + kDialogRows * kDialogCells * 3];

EMSCRIPTEN_KEEPALIVE
int WasmGetDialogState(void) {
  if (!HudOverride_Allowed()) return 0;
  uint8 *b = g_snapshot;
  // Every caller runs the engine each frame its message is up (dialog_presence.c), whichever module it is.
  b[0] = DialogPresence_Active();
  b[1] = (g_mirror.bordered ? 1 : 0) | (g_mirror.story ? 2 : 0) | (DialogSuppress_NativeHidden() ? 4 : 0);
  PutU16(b, 2, text_msgbox_topleft);
  b[4] = text_render_state;
  b[5] = g_mirror.last_cmd;
  b[6] = choice_in_multiselect_box;
  b[7] = byte_7E1CDF & 0xf;
  PutU16(b, 8, dialogue_message_index);
  memcpy(b + 10, g_mirror.count, kDialogRows);
  b[13] = g_generation;
  b[14] = g_mirror.msg_width;
  b[15] = g_mirror.msg_rows;
  // The text layer's live scroll, as the PPU draws it: the story crawl moves its words by scrolling the
  // layer, not through the engine. Signed 16-bit, horizontal then vertical.
  PutU16(b, 16, g_zenv.ppu ? g_zenv.ppu->bgLayer[2].hScroll : 0);
  PutU16(b, 18, g_zenv.ppu ? g_zenv.ppu->bgLayer[2].vScroll : 0);
  memcpy(b + kSnapshotHeader, g_mirror.rows, sizeof g_mirror.rows);
  return (int)(intptr_t)b;
}

// The active language's glyph sheet (which = 0: 256 tiles of 16 bytes, 2bpp, glyph c at tile
// (c & 0x70) * 2 + (c & 0xf) with its lower half 16 tiles on) or its width table (which = 1: one byte
// per glyph). A pointer into the loaded asset blob, so no copy and no lifetime beyond the session.
EMSCRIPTEN_KEEPALIVE
int WasmGetDialogFont(int which) {
  if (!RenderQueryGate() || (unsigned)which > 1) return 0;
  return (int)(intptr_t)FindIndexInMemblk(g_zenv.dialogue_font_blk, which).ptr;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetDialogFontSize(int which) {
  if (!RenderQueryGate() || (unsigned)which > 1) return 0;
  return (int)FindIndexInMemblk(g_zenv.dialogue_font_blk, which).size;
}

// The four colours the text box is drawing with right now: BG palette |text_tilemap_cur| names
// (bits 10-12, palette 6 unless a [Color] command moved it), read from live CGRAM so the host paints
// the glyph sheet the way the game does this frame. Four SNES 15-bit words.
static uint16 g_text_palette[4];

EMSCRIPTEN_KEEPALIVE
int WasmGetDialogPalette(void) {
  if (!RenderQueryGate() || g_zenv.ppu == NULL) return 0;
  int palette = (text_tilemap_cur >> 10) & 7;
  for (int i = 0; i < 4; i++)
    g_text_palette[i] = g_zenv.ppu->cgram[palette * 4 + i];
  return (int)(intptr_t)g_text_palette;
}
