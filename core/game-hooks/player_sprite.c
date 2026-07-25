/* @layer core-game-hooks @kind native */
// Custom player-character sprite sheets in the community ZSPR format: parse, apply, and revert.
//
// A sheet carries 0x7000 bytes of 4bpp tiles plus a palette block (4 outfits x 15 colors, then two
// glove colors). Applying one overwrites three assets in place. Two things make this more than a
// memcpy:
//
//  * The palette assets are only sampled into the live palette buffers when the game happens to
//    reload gear palettes, so a swap has to push them itself or the new colors sit unused.
//  * A save state restores the palette buffers it was recorded with, so a state saved under a
//    different sheet reinstates that sheet's colors. Callers re-push after a load.
//
// The stock assets are snapshotted on first apply so a sheet can be swapped or removed at runtime
// without rebooting the core.
#include "game_hooks_internal.h"
#include <stdlib.h>
#include "src/load_gfx.h"

enum {
  kSheetBytes = 0x7000,   // 4bpp player tiles
  kOutfitBytes = 120,     // 4 outfits x 15 colors x 2 bytes
  kGloveBytes = 4,        // 2 colors x 2 bytes
  kArmorAssetBytes = 150, // the stock armor/gloves asset — 5 outfits x 15 colors
  kHeaderBytes = 27,
};

static uint8 *g_stock_sheet;
static uint8 g_stock_outfits[kArmorAssetBytes];
static uint16 g_stock_gloves[2];
static bool g_have_stock;
static bool g_has_custom;

static uint32 ReadWord(const uint8 *b) { return b[0] | (b[1] << 8); }
static uint32 ReadDword(const uint8 *b) { return b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24); }

// The asset layout is a fixed contract; refuse rather than memcpy past an asset that changed size.
static bool AssetsHaveExpectedSize(void) {
  if (kLinkGraphics_SIZE == kSheetBytes && kPalette_ArmorAndGloves_SIZE == kArmorAssetBytes)
    return true;
  printf("[PlayerSprite] Unexpected asset sizes (gfx=%u pal=%u) — not applying\n",
         (unsigned)kLinkGraphics_SIZE, (unsigned)kPalette_ArmorAndGloves_SIZE);
  return false;
}

static bool CaptureStock(void) {
  if (g_have_stock)
    return true;
  g_stock_sheet = (uint8 *)malloc(kSheetBytes);
  if (g_stock_sheet == NULL) {
    printf("[PlayerSprite] Out of memory capturing stock sheet\n");
    return false;
  }
  memcpy(g_stock_sheet, kLinkGraphics, kSheetBytes);
  memcpy(g_stock_outfits, kPalette_ArmorAndGloves, kArmorAssetBytes);
  memcpy(g_stock_gloves, kGlovesColor, kGloveBytes);
  g_have_stock = true;
  return true;
}

// Sample the armor/gloves palette assets into the live palette buffers and flag CGRAM for upload.
// Safe to call any time after the core is initialized; a no-op visually if nothing changed.
void PlayerSprite_RefreshPalette(void) {
  Palette_Load_LinkArmorAndGloves();
}

bool PlayerSprite_HasCustom(void) {
  return g_has_custom;
}

bool PlayerSprite_Apply(const uint8 *data, size_t len, bool push_live) {
  if (data == NULL || len < kHeaderBytes || memcmp(data, "ZSPR", 4) != 0) {
    printf("[PlayerSprite] Not a ZSPR sheet\n");
    return false;
  }
  uint32 px_off = ReadDword(data + 9), px_len = ReadWord(data + 13);
  uint32 pal_off = ReadDword(data + 15), pal_len = ReadWord(data + 19);
  if (px_len != kSheetBytes ||
      (uint64)px_off + px_len > len ||
      (uint64)pal_off + pal_len > len) {
    printf("[PlayerSprite] Malformed ZSPR header (px=%u+%u pal=%u+%u len=%u)\n",
           px_off, px_len, pal_off, pal_len, (unsigned)len);
    return false;
  }
  if (!AssetsHaveExpectedSize() || !CaptureStock())
    return false;

  memcpy(kLinkGraphics, data + px_off, kSheetBytes);
  // A sheet may ship pixels only; keep the stock colors in that case rather than a partial copy.
  if (pal_len >= kOutfitBytes)
    memcpy(kPalette_ArmorAndGloves, data + pal_off, kOutfitBytes);
  if (pal_len >= kOutfitBytes + kGloveBytes)
    memcpy(kGlovesColor, data + pal_off + kOutfitBytes, kGloveBytes);
  g_has_custom = true;

  if (push_live)
    PlayerSprite_RefreshPalette();
  return true;
}

void PlayerSprite_Restore(bool push_live) {
  if (!g_have_stock || !g_has_custom)
    return;
  memcpy(kLinkGraphics, g_stock_sheet, kSheetBytes);
  memcpy(kPalette_ArmorAndGloves, g_stock_outfits, kArmorAssetBytes);
  memcpy(kGlovesColor, g_stock_gloves, kGloveBytes);
  g_has_custom = false;
  if (push_live)
    PlayerSprite_RefreshPalette();
}

// ─── JS-facing exports ───
// Applying a sheet is file-based (WasmApplyPlayerSpriteFile, emscripten_io.c) so the renderer reuses
// the MEMFS path it already writes at boot instead of hand-managing a heap buffer.

// Back to the sheet the assets shipped with.
EMSCRIPTEN_KEEPALIVE
void WasmClearPlayerSprite(void) {
  PlayerSprite_Restore(true);
}

// Re-push the palette assets into the live buffers — used after a save-state load, which restores
// whatever palette was recorded and would otherwise strand the selected sheet's colors.
EMSCRIPTEN_KEEPALIVE
void WasmRefreshPlayerPalette(void) {
  if (g_has_custom)
    PlayerSprite_RefreshPalette();
}
