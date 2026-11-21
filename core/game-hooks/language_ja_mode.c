/* @layer core-game-hooks @kind native */
// The Japanese layout and what its screens share: the layout's readiness and mode test, a name word's
// tile and glyph, the faerie's positions and the address of the sprite sheet the Japanese font would cover. See
// language_ja_screens.h.
#include "game_hooks_internal.h"

enum {
  kJapaneseFlag = 4,
  kBlankTile = 0x18c,
  kSpaceGlyph = 0xff,
  kSheetVramJa = 0x7d00,
  kFaerieSpots = 5,
};

// The Japanese byte length of every table the Japanese screens read. A table of another length is not
// the Japanese layout, so the US screens keep running.
static const struct { uint8 id; uint16 len; } kJaTables[] = {
  {kLangTbl_SelectFileFunc3, 301}, {kLangTbl_CopyBlinkTab, 193}, {kLangTbl_CopyBlinkTab1, 71},
  {kLangTbl_CopyTargetTab0, 125}, {kLangTbl_CopyTargetTab2, 57}, {kLangTbl_KillTab, 301},
  {kLangTbl_KillTab2, 81}, {kLangTbl_NameGrid, 320},
};

// The faerie on each Japanese screen, by (main_module_index, submodule_index), one spot per cursor
// position (selectfile R16).
typedef struct FaerieScreen {
  uint8 module, submodule, count;
  uint8 x[kFaerieSpots], y[kFaerieSpots];
} FaerieScreen;

static const FaerieScreen kFaerie[] = {
  {1, 5, 5, {0x14, 0x14, 0x14, 0x14, 0x14}, {0x4a, 0x6a, 0x8a, 0xa7, 0xc7}},  // file select
  {2, 3, 4, {0x14, 0x14, 0x14, 0x14}, {0x47, 0x67, 0x87, 0xc7}},              // copy: source
  {2, 4, 3, {0x8c, 0x8c, 0x14}, {0x47, 0x67, 0xc7}},                          // copy: target
  {2, 5, 2, {0x14, 0x14}, {0xae, 0xc7}},                                      // copy: confirm
  {3, 3, 4, {0x14, 0x14, 0x14, 0x14}, {0x4a, 0x6a, 0x8a, 0xc7}},              // erase: file
  {3, 4, 2, {0x14, 0x14}, {0xa7, 0xc7}},                                      // erase: confirm
};

bool LanguageJa_LayoutReady(void) {
  if (!LanguageScreens_PieceOn(kLangGfx_Menus) || (g_zenv.dialogue_flags & kJapaneseFlag) == 0 || !LanguageScreensFont_Ready())
    return false;
  for (size_t i = 0; i < countof(kJaTables); i++) {
    int id = kJaTables[i].id;
    if (g_language_screens.table[id] == NULL || g_language_screens.length[id] != kJaTables[i].len)
      return false;
  }
  return true;
}

bool LanguageJa_On(void) {
  return SelectLayout_Active() == kSelectLayout_Ja;
}

bool LanguageJa_SetHeldBack(void) {
  return LanguageScreens_On() && (g_zenv.dialogue_flags & kJapaneseFlag) != 0 && !LanguageJa_LayoutReady();
}

// The font holds a glyph's top half at row-pair tile (g & 0xf0) * 2 + (g & 0xf), its bottom half 0x10 on.
static uint16 TileOfGlyph(int g) {
  return (uint16)((g & 0xf0) << 1 | (g & 0xf));
}

uint16 LanguageJa_NameTile(uint16 w) {
  if (w & kJaNameMark)
    return w & kJaNameTileMask;
  if (w == kJaNameBlank)
    return kBlankTile;
  int g = DialogWide_GlyphOfUsLetter(Text_FilterPlayerNameCharacters((uint8)((w & 0xf) | (w >> 1 & 0xf0))));
  return g == kSpaceGlyph ? kBlankTile : TileOfGlyph(g);
}

uint8 LanguageJa_NameGlyph(uint16 w) {
  uint16 t = w & kJaNameTileMask;
  return (uint8)(((t >> 1) & 0xf0) | (t & 0xf));
}

void GameHook_FileSelectFairy(uint8 *x, uint8 *y) {
  if (!LanguageJa_On())
    return;
  for (size_t i = 0; i < countof(kFaerie); i++) {
    const FaerieScreen *s = &kFaerie[i];
    if (s->module != main_module_index || s->submodule != submodule_index)
      continue;
    int spot = g_ram[0xc8] < s->count ? g_ram[0xc8] : s->count - 1;
    *x = s->x[spot];
    *y = s->y[spot];
    return;
  }
}

uint16 GameHook_FileSelectSheetVram(uint16 orig) {
  return SelectLayout_JapaneseFont() ? kSheetVramJa : orig;
}
