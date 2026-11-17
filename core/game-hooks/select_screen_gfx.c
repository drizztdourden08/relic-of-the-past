/* @layer core-game-hooks @kind native */
// The graphics each file select screen draws over, set as the screen opens (FileSelect_EraseTriforce)
// for a Japanese set, by the layout that screen runs. See select_layout.h.
//
// The name entry reloads no graphics of its own, so it would draw over what the select screen loaded.
// The two layouts want different background sheets in the eight slots: the US screens draw over the US
// tileset (35/81), the Japanese cartridge's file select loads other sheets there and draws its frames
// from the Japanese sheet 57, with its own colours in palette row 5. BG3 is cleared to the Japanese
// font's blank, since the US blank is a kana in that font. The Japanese name entry also leaves out the
// US backdrop pattern under its grid (GameHook_NameFileBackdrop).
//
// The Japanese name entry leaves its grid scroll in selectfile_var8 (0x19c at rest), which the file
// select's BG3 split (irq_flag, set again on the way back) writes to BG3HOFS: the select screen would
// open scrolled sideways. Each screen starts it at 0, as a fresh file select has it.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"
#include "src/select_file.h"

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
  kScratchRam = 0xbf,
  kScratchBytes = 16,
  kStripeBuffer = 0x1002,
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
// The high-plane conversion (Do3To4High) works in the 16 bytes at $BF, which the file select keeps its
// file flags, chosen file and cursor in (selectfile_arr1, selectfile_R16, selectfile_arr2), so they are
// put back afterwards.
static void LoadSheets(bool ja) {
  const uint8 *sheets = ja ? kJaSheets : kUsSheets;
  uint8 kept[kScratchBytes];
  memcpy(kept, &g_ram[kScratchRam], kScratchBytes);
  LanguageScreens_SelectSheets(ja);
  for (int i = 0; i < kSlots; i++)
    LoadBackgroundGraphics(&g_zenv.vram[kSheetVram + i * kSlotWords], sheets[i], kSlots - 1 - i,
                           &g_ram[kDecompOffset]);
  LanguageScreens_SelectSheets(false);
  memcpy(&g_ram[kScratchRam], kept, kScratchBytes);
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
  selectfile_var8 = 0;
  ClearBg3();
  LoadSheets(ja);
  LoadPalette(ja);
}

// The Japanese name entry has no backdrop pattern under its grid: the cartridge goes straight from
// clearing the screen to its tilemap, so the US fill (SelectFile_Func1) would show through the kana.
// Returns where the stream end goes: the empty stripe buffer for the Japanese layout, past the fill otherwise.
uint16 *GameHook_NameFileBackdrop(void) {
  bool ja = SelectLayout_JapaneseFont() && SelectLayout_ActiveOn(kSelectScreen_Name) == kSelectLayout_Ja;
  return ja ? (uint16 *)&g_ram[kStripeBuffer] : SelectFile_Func1();
}
