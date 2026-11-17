/* @layer core-game-hooks @kind native */
// The graphics each file select screen draws over, set as the screen opens (FileSelect_EraseTriforce)
// for a Japanese set, by the layout that screen runs. See select_layout.h.
//
// The name entry reloads no graphics of its own, so it would draw over what the select screen loaded.
// The two layouts want different background sheets in the eight slots: the US screens draw over the US
// tileset (35/81), the Japanese cartridge's file select loads other sheets there and draws its frames
// from the Japanese sheet 57, with its own colours in palette row 5. BG3 is cleared to the Japanese
// font's blank, since the US blank is a kana in that font.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

enum {
  kSlots = 8,
  kSheetVram = 0x2000,
  kSlotWords = 0x400,
  kBg3Vram = 0x6000,
  kBg3Words = 0x800,
  kJaBlankWord = 0x188,
  kDecompOffset = 0x14000,
  kPaletteDst = 0x42,
  kPaletteColumns = 14,
  kPaletteRows = 5,
};

// The background sheet in each slot, from VRAM 0x2000 up, main tileset 35 with aux tileset 81 applied.
static const uint8 kUsSheets[kSlots] = {22, 57, 29, 23, 64, 65, 57, 30};
static const uint8 kJaSheets[kSlots] = {0, 57, 57, 114, 64, 65, 57, 15};

static void ClearBg3(void) {
  uint16 *dst = &g_zenv.vram[kBg3Vram];
  for (int i = 0; i < kBg3Words; i++)
    dst[i] = kJaBlankWord;
}

// The Japanese layout reads the set's own copy of a sheet where it has one, the US layout the baked one.
static void LoadSheets(bool ja) {
  const uint8 *sheets = ja ? kJaSheets : kUsSheets;
  LanguageScreens_SelectSheets(ja);
  for (int i = 0; i < kSlots; i++)
    LoadBackgroundGraphics(&g_zenv.vram[kSheetVram + i * kSlotWords], sheets[i], kSlots - 1 - i,
                           &g_ram[kDecompOffset]);
  LanguageScreens_SelectSheets(false);
}

// The set's palette when the Japanese layout runs and the set carries it, the vendored one otherwise.
static void LoadPalette(bool ja) {
  const uint16 *pal = LANG_PICK(uint16, kLangTbl_SelectPalette, NULL);
  if (ja && pal != NULL)
    Palette_LoadMultiple(pal, kPaletteDst, kPaletteColumns, kPaletteRows);
  else
    Palette_Load_DungeonSet();
}

void GameHook_FileSelectScreenGfx(void) {
  if (!SelectLayout_JapaneseFont())
    return;
  bool ja = SelectLayout_Active() == kSelectLayout_Ja;
  ClearBg3();
  LoadSheets(ja);
  LoadPalette(ja);
}
