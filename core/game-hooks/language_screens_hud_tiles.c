/* @layer core-game-hooks @kind native */
// The HUD's 2bpp tiles in VRAM, kept in step with the sheets the pause words are chosen for.
//
// LoadDefaultGraphics puts the HUD sheets in VRAM once, at a file load. The pause words are read from
// their tables each time the menu draws, so after a save state taken under another set or HUD option,
// or a change of either during play, the words name tiles of one sheet while VRAM holds the other and
// the menu reads as junk. Where VRAM holds one of the HUD sheets this session knows of, the one now
// chosen is put there in its place; VRAM holding anything else (a map, the intro) is left alone.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

enum { kSprKind = 0, kTileBytes = 2048, kDecompBytes = 0x4000 };

// Sheet and VRAM word address, as LoadDefaultGraphics uploads them.
static const struct {
  uint8 sheet;
  uint16 vram;
} kHudTiles[] = {{0x6a, 0x7000}, {0x6b, 0x7400}, {0x69, 0x7800}};

static uint8 g_known[kDecompBytes];
static uint8 g_chosen[kDecompBytes];

static bool Holds(const uint8 *vram, const uint8 *compressed) {
  if (compressed == NULL) return false;
  return Decompress(g_known, compressed) >= kTileBytes && memcmp(vram, g_known, kTileBytes) == 0;
}

void LanguageScreens_RefreshHudTiles(void) {
  if (g_zenv.vram == NULL) return;
  for (size_t i = 0; i < countof(kHudTiles); i++) {
    int sheet = kHudTiles[i].sheet;
    uint8 *vram = (uint8 *)&g_zenv.vram[kHudTiles[i].vram];
    uint32 size;
    if (Decomp_spr(g_chosen, sheet) < kTileBytes || memcmp(vram, g_chosen, kTileBytes) == 0) continue;
    if (Holds(vram, AssetSheet_Baked(kSprKind, sheet)) || Holds(vram, JaGraphics_PackSheet(kSprKind, sheet, &size)) ||
        Holds(vram, LanguageScreensAssets_SetSheet(kSprKind, sheet)))
      memcpy(vram, g_chosen, kTileBytes);
  }
}
