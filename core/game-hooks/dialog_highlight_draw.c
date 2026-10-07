/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog highlight, at draw time ───
// ZeldaDrawPpuFrame brackets the frame's draw with these two. Begin puts the highlight colours in the
// spare palette entries and points the tiles holding a secondary letter at the spare palette; End puts
// back every word it changed. Nothing is left in CGRAM or VRAM between frames, so a save state, the
// game's own palette uploads and a message without highlights all see the picture as the game made it.

// The BG3 palette a secondary tile borrows; the HUD's text layer uses 0-3, 6 and 7, never 4 or 5.
enum { kSparePalette = 5, kSparePaletteAlt = 4 };
// The text area's first tile sits one row and one column inside the box's top-left word.
enum { kTextAreaOffset = 0x21, kTilemapRowWords = 0x20, kTextFirstChar = 0x180 };
enum { kTileCount = kHighlightTileRows * kHighlightTileCols };

static struct {
  bool active;
  uint8 text_pal, spare_pal;
  uint16 text_spare, spare[4];
  int count;
  uint16 addr[kTileCount], word[kTileCount];
} g_swap;

// While a [Scroll] is moving the rows up, a secondary letter's pixels pass through the tile rows above
// its own, so those borrow the palette too until the scroll lands.
static bool TileWantsSpare(int row, int col, bool scrolling) {
  if (DialogHighlight_SecondaryTile(row, col)) return true;
  return scrolling && (DialogHighlight_SecondaryTile(row + 1, col) || DialogHighlight_SecondaryTile(row + 2, col));
}

static void PointTilesAtSpare(Ppu *ppu) {
  bool scrolling = (byte_7E1CDF & 0xf) != 0;
  int first = text_msgbox_topleft + kTextAreaOffset;
  for (int row = 0; row < kHighlightTileRows; row++) {
    for (int col = 0; col < kHighlightTileCols; col++) {
      if (!TileWantsSpare(row, col, scrolling)) continue;
      uint16 addr = (uint16)((first + row * kTilemapRowWords + col) & 0x7fff);
      uint16 word = ppu->vram[addr];
      // Only a text tile the engine laid out itself, in the text palette: the native box may be hidden.
      if ((word & 0x3ff) != ((kTextFirstChar + row * kHighlightTileCols + col) & 0x3ff)) continue;
      if (((word >> 10) & 7) != g_swap.text_pal) continue;
      g_swap.addr[g_swap.count] = addr;
      g_swap.word[g_swap.count++] = word;
      ppu->vram[addr] = (uint16)((word & ~0x1c00) | (g_swap.spare_pal << 10));
    }
  }
}

void GameHook_DialogHighlightDrawBegin(void) {
  g_swap.active = false;
  g_swap.count = 0;
  Ppu *ppu = g_zenv.ppu;
  if (ppu == NULL || !DialogHighlight_Used() || messaging_module == 0) return;
  if (!(enhanced_features3 & kFeatures3_ReceiptMessages)) return;
  g_swap.text_pal = (text_tilemap_cur >> 10) & 7;
  g_swap.spare_pal = g_swap.text_pal == kSparePalette ? kSparePaletteAlt : kSparePalette;
  uint16 *text = &ppu->cgram[g_swap.text_pal * 4];
  uint16 *spare = &ppu->cgram[g_swap.spare_pal * 4];
  g_swap.text_spare = text[3];
  memcpy(g_swap.spare, spare, sizeof g_swap.spare);
  text[3] = DialogHighlight_Color(kHighlightPrimary);
  memcpy(spare, text, 3 * sizeof *spare);
  spare[3] = DialogHighlight_Color(kHighlightSecondary);
  g_swap.active = true;
  PointTilesAtSpare(ppu);
}

void GameHook_DialogHighlightDrawEnd(void) {
  if (!g_swap.active) return;
  Ppu *ppu = g_zenv.ppu;
  for (int i = g_swap.count - 1; i >= 0; i--)
    ppu->vram[g_swap.addr[i]] = g_swap.word[i];
  memcpy(&ppu->cgram[g_swap.spare_pal * 4], g_swap.spare, sizeof g_swap.spare);
  ppu->cgram[g_swap.text_pal * 4 + 3] = g_swap.text_spare;
  g_swap.active = false;
}
