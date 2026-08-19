/* @layer core-game-hooks @kind native */
// Custom player-character sprite sheets in the community ZSPR format: parse, apply, and revert.
//
// A sheet carries 0x7000 bytes of 4bpp tiles plus a palette block (4 outfits x 15 colors, then two
// glove colors). The tiles simply overwrite the player gfx asset. The palette cannot: the gear palette
// occupies a sprite palette that villagers and followers also draw from, and their art was drawn against
// the stock outfit colors, so writing a sheet's colors there turns them black or gold to match.
//
// So the palette goes somewhere else. The PPU carries a private 16-color bank past the hardware palette
// (Ppu.cgram[0x100]) and resolves the player's own pixels against it, leaving the shared row stock. This
// module owns that bank: it keeps the sheet's outfits, and refreshes the bank whenever the game reloads
// gear palettes, so armor upgrades, bunny form and the electro palette all track the way they normally do.
//
// The stock gfx is snapshotted on first apply so a sheet can be swapped or removed without rebooting.
#include "game_hooks_internal.h"
#include <stdlib.h>
#include "src/load_gfx.h"

enum {
  kSheetBytes = 0x7000,   // 4bpp player tiles
  kColorsPerOutfit = 15,  // pixel indices 1-15; index 0 is transparent and has no stored entry
  kSheetOutfits = 4,      // a ZSPR carries green/blue/red/bunny, but not the electro palette
  kOutfitBytes = kSheetOutfits * kColorsPerOutfit * 2,
  kGloveBytes = 4,        // 2 colors x 2 bytes
  kArmorAssetBytes = 150, // the stock armor/gloves asset — 5 outfits x 15 colors
  kHeaderBytes = 27,
  kBankColors = 16,       // the private bank mirrors one full sprite palette
  kGlovesBankIndex = 13,  // the gloves color lands at 0xFD, i.e. index 13 of the row
};

static uint8 *g_stock_sheet;
static bool g_have_stock;
static bool g_has_custom;
// The sheet's outfits and glove colors, indexed the way the armor asset is.
static uint16 g_sheet_outfits[kSheetOutfits * kColorsPerOutfit];
static uint16 g_sheet_gloves[2];
static bool g_have_sheet_palette;
// Which outfit the game last loaded, so a gloves-only update can rebuild the bank without being told again.
static int g_last_outfit = -1;

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
  g_have_stock = true;
  return true;
}

// Fill the PPU's private bank from the sheet's outfit |outfit|, and switch the player onto it. A no-op
// before the core is initialized — the first gear-palette load after startup calls back in and lands it.
static void PushBank(int outfit) {
  Ppu *ppu = g_zenv.ppu;
  if (ppu == NULL || !g_have_sheet_palette || outfit < 0 || outfit >= kSheetOutfits)
    return;
  const uint16 *src = g_sheet_outfits + outfit * kColorsPerOutfit;
  ppu->cgram[kPpuPlayerPalBase] = 0;  // index 0 is transparent and never sampled
  for (int i = 0; i < kColorsPerOutfit; i++)
    ppu->cgram[kPpuPlayerPalBase + 1 + i] = src[i];
  if (link_item_gloves)
    ppu->cgram[kPpuPlayerPalBase + kGlovesBankIndex] = g_sheet_gloves[link_item_gloves - 1];
  ppu->playerPalActive = true;
}

// The game just loaded a gear palette into the shared sprite row. |src| points at the outfit it chose
// inside the armor asset, which is how we know whether it's an outfit the sheet supplies.
void GameHook_PlayerGearPaletteLoaded(const uint16 *src) {
  if (!g_has_custom || !g_have_sheet_palette)
    return;
  int outfit = (int)(src - kPalette_ArmorAndGloves) / kColorsPerOutfit;
  g_last_outfit = outfit;
  // The electro palette is the fifth outfit and no sheet carries it; leave the player on the stock row so
  // the effect still reads as intended.
  if (outfit >= kSheetOutfits) {
    if (g_zenv.ppu != NULL)
      g_zenv.ppu->playerPalActive = false;
    return;
  }
  PushBank(outfit);
}

// Gloves can change without a full gear reload, and they recolor one entry of the row.
void GameHook_PlayerGlovesColorUpdated(void) {
  if (!g_has_custom || !g_have_sheet_palette || g_last_outfit < 0)
    return;
  PushBank(g_last_outfit);
}

// Kept for callers that want the player's colors re-landed after a save-state load. The bank lives outside
// the snapshot, so a load cannot disturb it — but link_armor can differ, so rebuild from what's current.
void PlayerSprite_RefreshPalette(void) {
  if (g_has_custom)
    Palette_Load_LinkArmorAndGloves();
}

bool PlayerSprite_HasCustom(void) {
  return g_has_custom;
}

bool PlayerSprite_Apply(const uint8 *data, size_t len, bool push_live) {
  // Single gate point for the whole feature: every hook below (GameHook_PlayerGearPaletteLoaded,
  // GameHook_PlayerGlovesColorUpdated, PlayerSprite_RefreshPalette, PlayerSprite_Restore) only acts
  // once g_has_custom is true, and this is the only place that sets it — so refusing here when the
  // gate is off keeps the player on the stock sheet/palette everywhere else without duplicating checks.
  if (!(enhanced_features3 & kFeatures3_PlayerSpriteOverride)) {
    printf("[PlayerSprite] Blocked — player sprite override gate is off\n");
    return false;
  }
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
  // A sheet may ship pixels only; leave the player on the stock row in that case rather than banking a
  // partial palette.
  g_have_sheet_palette = false;
  if (pal_len >= kOutfitBytes) {
    for (int i = 0; i < kSheetOutfits * kColorsPerOutfit; i++)
      g_sheet_outfits[i] = (uint16)ReadWord(data + pal_off + i * 2);
    g_sheet_gloves[0] = kGlovesColor[0];
    g_sheet_gloves[1] = kGlovesColor[1];
    if (pal_len >= kOutfitBytes + kGloveBytes) {
      g_sheet_gloves[0] = (uint16)ReadWord(data + pal_off + kOutfitBytes);
      g_sheet_gloves[1] = (uint16)ReadWord(data + pal_off + kOutfitBytes + 2);
    }
    g_have_sheet_palette = true;
  }
  g_has_custom = true;

  if (push_live)
    PlayerSprite_RefreshPalette();
  return true;
}

void PlayerSprite_Restore(bool push_live) {
  if (!g_have_stock || !g_has_custom)
    return;
  memcpy(kLinkGraphics, g_stock_sheet, kSheetBytes);
  g_has_custom = false;
  g_have_sheet_palette = false;
  g_last_outfit = -1;
  // Back to the shared row. Nothing to undo there — it held the stock colors the whole time.
  if (g_zenv.ppu != NULL)
    g_zenv.ppu->playerPalActive = false;
  if (push_live)
    Palette_Load_LinkArmorAndGloves();
}

// ─── JS-facing exports ───
// Applying a sheet is file-based (WasmApplyPlayerSpriteFile, emscripten_io.c) so the renderer reuses
// the MEMFS path it already writes at boot instead of hand-managing a heap buffer.

// Back to the sheet the assets shipped with.
EMSCRIPTEN_KEEPALIVE
void WasmClearPlayerSprite(void) {
  PlayerSprite_Restore(true);
}

// Re-land the player's colors after a save-state load, which can restore a different armor level than the
// one the bank was last built for.
EMSCRIPTEN_KEEPALIVE
void WasmRefreshPlayerPalette(void) {
  if (g_has_custom)
    PlayerSprite_RefreshPalette();
}

