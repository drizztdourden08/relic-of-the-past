/* @layer core-game-hooks @kind native */
#include <stdlib.h>
#include "game_hooks_internal.h"

// ─── Dialog extra glyphs ───
// Characters the active dialogue font lacks (an underscore, a colon, an ampersand...), drawn by the
// host in the font's own style and written into the sheet's spare slots, so a player or item name from
// another game shows as it was typed. The host hands a table of entries, each a slot, a width and the
// glyph's two 8x8 2bpp tiles (top then bottom, 16 bytes each), and this file builds a private copy of
// the language's font blob ([sheet, widths] with the widths grown to all 128 slots) with them written
// in. The copy stands in for g_zenv.dialogue_font_blk only while the receipt-messages gate is up; with
// the gate down the language's own blob is back before the next byte decodes.
//
// A session line reaches a slot through a two-byte escape the vendored decoder has no meaning for:
//   US: 0x83 then the slot. The US decoder sends any byte from 0x80 to a letter, never a command.
//   EU: 0x87 then the slot (0x60-0x7f). A sub-byte the EU decoder has no case for.
// Both decode to a multibyte letter, so the parse and the pump step over the slot byte the way they
// step over any parameter. Only session lines carry the escape (session_dialogue.c), a baked line
// never does, and with the gate down it decodes exactly as before. A slot nothing was loaded into
// draws the font's question mark, so a stale line can never draw a blank slot or read past a width.

enum {
  kSheetBytes = 256 * 16,
  kGlyphSlots = 128,
  kTileBytes = 16,
  kEntryBytes = 2 + 2 * kTileBytes,
  kMaxEntries = 32,
  kUsEscape = 0x83,
  kEuEscape = 0x87,
  kEuSlotMin = 0x60,
  kQuestionGlyph = 0x3f,
  kCmdIsLetter = 25,  // messaging.c kTextCmd_IsLetter
  // Packed blob: one u16 offset, the sheet, the 128 widths, the u16 trailer (count - 1).
  kBlobBytes = 2 + kSheetBytes + kGlyphSlots + 2,
};

// The host writes its table here (WasmExtraGlyphTable) and passes it to WasmLoadExtraGlyphs.
static uint8 g_table[kMaxEntries * kEntryBytes];
// The table the copy was built from, so an identical reload keeps the copy (and its address).
static uint8 g_built[kMaxEntries * kEntryBytes];
static int g_built_count;
static uint8 g_loaded[kGlyphSlots];
static uint8 *g_patched;
// The language's own font blob the copy was made from.
static MemBlk g_baked;

static bool ExtraGlyphGate(void) {
  return (enhanced_features3 & kFeatures3_ReceiptMessages) != 0;
}

static void DropCopy(void) {
  if (g_patched != NULL && g_zenv.dialogue_font_blk.ptr == g_patched) g_zenv.dialogue_font_blk = g_baked;
  free(g_patched);
  g_patched = NULL;
  g_built_count = 0;
  memset(g_loaded, 0, sizeof(g_loaded));
}

// Put the copy in or take it out to match the gate. A font the copy was not built from means the
// language changed under it, and the slots it was laid out for no longer hold, so the copy goes.
static void SyncFont(void) {
  if (g_patched == NULL) return;
  const uint8 *current = g_zenv.dialogue_font_blk.ptr;
  if (current != g_patched && current != g_baked.ptr) {
    DropCopy();
    return;
  }
  if (ExtraGlyphGate() && current != g_patched)
    g_zenv.dialogue_font_blk = (MemBlk){ g_patched, kBlobBytes };
  else if (!ExtraGlyphGate() && current == g_patched)
    g_zenv.dialogue_font_blk = g_baked;
}

static bool EntriesFit(const uint8 *table, int count, size_t baked_widths) {
  for (int i = 0; i < count; i++) {
    uint8 slot = table[i * kEntryBytes], width = table[i * kEntryBytes + 1];
    if (slot < baked_widths || slot >= kGlyphSlots || width == 0 || width > 8) return false;
  }
  return true;
}

static uint8 *BuildCopy(MemBlk sheet, MemBlk widths, const uint8 *table, int count) {
  uint8 *blob = calloc(kBlobBytes, 1);
  if (blob == NULL) return NULL;
  PutU16(blob, 0, kSheetBytes);
  uint8 *tiles = blob + 2, *width_table = tiles + kSheetBytes;
  memcpy(tiles, sheet.ptr, kSheetBytes);
  memcpy(width_table, widths.ptr, widths.size);
  PutU16(blob, kBlobBytes - 2, 1);
  for (int i = 0; i < count; i++) {
    const uint8 *entry = table + i * kEntryBytes;
    uint8 slot = entry[0];
    int top = (slot & 0x70) * 2 + (slot & 0xf);
    memcpy(tiles + top * kTileBytes, entry + 2, kTileBytes);
    memcpy(tiles + (top + 16) * kTileBytes, entry + 2 + kTileBytes, kTileBytes);
    width_table[slot] = entry[1];
  }
  return blob;
}

EMSCRIPTEN_KEEPALIVE
uint8 *WasmExtraGlyphTable(void) {
  return g_table;
}

// Build the font copy from |count| entries at |table|. Returns the entries taken, or 0 when refused
// (a malformed table, or a font that is not the 256-tile sheet with at most 128 widths); a refusal
// leaves the font as it was. Ungated, as the session dialogue's adoption is: the copy only differs in
// slots no baked line reaches, and it stands in for the font only while the gate is up.
EMSCRIPTEN_KEEPALIVE
int WasmLoadExtraGlyphs(const uint8 *table, int count) {
  if (table == NULL || count <= 0 || count > kMaxEntries) return 0;
  MemBlk baked = (g_patched != NULL && g_zenv.dialogue_font_blk.ptr == g_patched) ? g_baked : g_zenv.dialogue_font_blk;
  MemBlk sheet = FindIndexInMemblk(baked, 0), widths = FindIndexInMemblk(baked, 1);
  if (sheet.ptr == NULL || sheet.size != kSheetBytes || widths.ptr == NULL || widths.size > kGlyphSlots) return 0;
  if (!EntriesFit(table, count, widths.size)) return 0;
  size_t bytes = (size_t)count * kEntryBytes;
  if (g_patched != NULL && baked.ptr == g_baked.ptr && count == g_built_count && !memcmp(table, g_built, bytes)) {
    SyncFont();
    return count;
  }
  uint8 *blob = BuildCopy(sheet, widths, table, count);
  if (blob == NULL) return 0;
  DropCopy();
  g_baked = baked;
  g_patched = blob;
  memcpy(g_built, table, bytes);
  g_built_count = count;
  for (int i = 0; i < count; i++) g_loaded[table[i * kEntryBytes]] = 1;
  SyncFont();
  return count;
}

// Session stop: the language's own font back, the copy gone.
EMSCRIPTEN_KEEPALIVE
void WasmClearExtraGlyphs(void) {
  DropCopy();
}

uint32 GameHook_DialogExtraGlyphDecode(uint8 a, const uint8 *src) {
  SyncFont();
  if (!ExtraGlyphGate()) return 0;
  if ((g_zenv.dialogue_flags & 1) == 0) {
    if (a != kUsEscape) return 0;
  } else if (a != kEuEscape || src[0] < kEuSlotMin || src[0] >= kGlyphSlots) {
    return 0;
  }
  uint8 slot = src[0];
  bool drawn = slot < kGlyphSlots && g_loaded[slot] && g_zenv.dialogue_font_blk.ptr == g_patched;
  return (uint32)(drawn ? slot : kQuestionGlyph) << 6 | kCmdIsLetter << 1 | 1;
}
