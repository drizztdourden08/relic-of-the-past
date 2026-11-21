/* @layer core-game-hooks @kind native */
// The Japanese graphics pack and the option bits that switch it in. See ja_graphics.h.
#include "game_hooks_internal.h"
#include "src/features.h"
#include "src/ending.h"
#include <stdlib.h>

enum { kSheetIdBase = 0x100, kPatchIdBase = 0x300, kIntroTilemapId = 0x45, kCopyrightOamId = 0x46, kTitleParamsId = 0x47, kTitleParamsBytes = 3, kPlateOamId = 0x48, kTitlePalettesId = 0x49, kTitlePaletteWords = 70, kOamHeaderBytes = 3, kOamEntryBytes = 8, kOamEntriesMax = 16, kBgSheetKind = 1, kSprSheetKind = 0, kIntroModule = 0, kHudTextIdBase = 0x50, kHudTextCount = 9, kDialogueFontId = 0x4a, kTilemapFontId = 0x4b, kJapaneseFlag = 4 };

typedef struct {
  uint8 *data;
  uint32 size;
} Blob;

static Blob g_sheets[2][kLangSheetMax];
static Blob g_patches[kLangSheetMax];
static Blob g_intro_tilemap;
static Blob g_copyright_oam;
static Blob g_title_params;
static Blob g_plate_oam;
static Blob g_title_palettes;
static Blob g_hud_text[kHudTextCount];
static Blob g_dialogue_font;
static Blob g_tilemap_font;

// The language tables the pack's pause words stand in for, in the order the pack carries them.
static const uint8 kHudTextTable[kHudTextCount] = {kLangTbl_HudAbility, kLangTbl_HudGloves, kLangTbl_HudBottles,
    kLangTbl_HudMushroom, kLangTbl_HudFlute, kLangTbl_HudMirror, kLangTbl_HudBow, kLangTbl_HudItem, kLangTbl_HudEquipDungeon};

static const uint8 kIntroSheets[] = {22, 23, 29, 30, 57, 64, 65};
static const uint8 kHudSheets[] = {105, 106};
enum { kHudSheetCount = countof(kHudSheets) };
static const uint8 kCopyrightSheet = 8;

static bool Listed(const uint8 *list, size_t count, int index) {
  for (size_t i = 0; i < count; i++)
    if (list[i] == index) return true;
  return false;
}

static uint32 SheetOption(int kind, int index) {
  if (kind == kBgSheetKind && Listed(kIntroSheets, countof(kIntroSheets), index)) return kJaGfx_Intro;
  if (kind == kSprSheetKind && Listed(kHudSheets, countof(kHudSheets), index)) return kJaGfx_Hud;
  return 0;
}

uint32 GameHook_ParityMask(int word) {
  return word == 2 ? kJaGfx_Title | kJaGfx_Intro | kJaGfx_Hud | kJaGfx_Copyright | kJaGfx_FileSelect | kLangGfx_Menus |
                         kLangGfx_Pause | kLangGfx_Maps | kLangGfx_Ending
                   : 0;
}

enum { kStyleBits = kJaGfx_FileSelect, kTitleBits = kJaGfx_Title | kJaGfx_Intro | kJaGfx_Copyright };

static uint32 g_latched_bits;
static bool g_started;
static int g_prev_module = -1;

bool JaGraphics_On(uint32 bit) {
  return (g_latched_bits & bit) != 0;
}

// True until the intro has loaded its tilesets (they load as its submodule 1 ends), so a host that pushes
// the settings after the core starts, even a few frames in, still reaches the first intro picture.
static bool Following(void) {
  return !g_started || (main_module_index == kIntroModule && submodule_index <= 1);
}

// The pack holds every piece the Japanese title draws: its logo (the intro tilemap and background sheets),
// the copyright patch and layout, the triforce heights, the subtitle plate and the title's palettes.
static bool TitlePackComplete(void) {
  for (size_t i = 0; i < countof(kIntroSheets); i++)
    if (g_sheets[kBgSheetKind][kIntroSheets[i]].data == NULL) return false;
  return g_intro_tilemap.data != NULL && g_patches[kCopyrightSheet].data != NULL && g_copyright_oam.data != NULL &&
         g_title_params.size >= kTitleParamsBytes && g_plate_oam.data != NULL && g_title_palettes.size == kTitlePaletteWords * 2;
}

// Both options come from the gate word: the file select layout, and the title choice (US or Japanese),
// which brings the Japanese logo, copyright line and title sequence together. The title is Japanese only
// while the pack holds all of it and the host's own title (kFeatures2_TitleOverride) is off.
static uint32 Live(void) {
  uint32 live = enhanced_features2 & kStyleBits;
  if ((enhanced_features2 & kJaGfx_Title) && !(enhanced_features2 & kFeatures2_TitleOverride) && TitlePackComplete())
    live |= kTitleBits;
  return live;
}

static void Refresh(void) {
  uint32 live = Live();
  if (live == g_latched_bits) return;
  g_latched_bits = live;
  LanguageScreensAssets_Apply(LanguageScreens_On());
}

void JaGraphics_Gate(void) {
  if (Following()) g_latched_bits = Live();
}

void JaGraphics_FrameEnd(void) {
  bool follow = Following();
  g_started = true;
  if (!follow && main_module_index == g_prev_module) return;
  g_prev_module = main_module_index;
  Refresh();
}

static const uint8 *Taken(const Blob *blob, uint32 *size) {
  if (blob->data == NULL) return NULL;
  *size = blob->size;
  return blob->data;
}

// The HUD sheets differ from the US ones only in their glyphs (kana where the US sheets hold letters),
// and the pause words are text, which follows the profile's language. So they are drawn for every
// Japanese set, whatever the option says, and only with the pack's own words for them; any other set
// keeps the US sheets. Gate: kLangGfx_Pause.
static bool HudPackDrawn(void) {
  if (!LanguageScreens_PieceOn(kLangGfx_Pause) || SelectLayout_OfSet() != kSelectLayout_Ja) return false;
  for (int i = 0; i < kHudSheetCount; i++)
    if (g_sheets[kSprSheetKind][kHudSheets[i]].data == NULL) return false;
  for (int i = 0; i < kHudTextCount; i++)
    if (g_hud_text[i].data == NULL) return false;
  return true;
}

// The Japanese file select layout draws its frame and name grid from the intro's background sheets, read
// only during its own sheet load (LanguageScreens_SheetLive), so the pack's copy stands ready for it too.
static bool SelectSheetsDrawn(void) {
  return SelectLayout_ActiveOn(kSelectScreen_Select) == kSelectLayout_Ja;
}

const uint8 *JaGraphics_Sheet(int kind, int index, uint32 *size) {
  uint32 option = SheetOption(kind, index);
  if (option == 0 || index < 0 || index >= kLangSheetMax) return NULL;
  if (option == kJaGfx_Hud ? !HudPackDrawn() : !JaGraphics_On(option) && !SelectSheetsDrawn()) return NULL;
  return Taken(&g_sheets[kind][index], size);
}

const uint8 *JaGraphics_PackSheet(int kind, int index, uint32 *size) {
  return index >= 0 && index < kLangSheetMax ? Taken(&g_sheets[kind][index], size) : NULL;
}

const uint8 *JaGraphics_HudText(int id, int *len) {
  if (!HudPackDrawn()) return NULL;
  for (int i = 0; i < kHudTextCount; i++) {
    if (kHudTextTable[i] != id) continue;
    *len = (int)g_hud_text[i].size;
    return g_hud_text[i].data;
  }
  return NULL;
}

const uint8 *JaGraphics_Patch(int index, uint32 *size) {
  if (index != kCopyrightSheet || !JaGraphics_On(kJaGfx_Copyright)) return NULL;
  return Taken(&g_patches[index], size);
}

const uint8 *JaGraphics_IntroTilemap(uint32 *size) {
  return JaGraphics_On(kJaGfx_Intro) ? Taken(&g_intro_tilemap, size) : NULL;
}

// The copyright line's sprite layout from the pack: count, start x, start y, then count 8 byte records
// (x word, y word, character, flags, extension word whose high byte is the size bit). NULL unless the option is on and the pack has it.
static const uint8 *CopyrightOam(int *count) {
  uint32 size;
  if (!JaGraphics_On(kJaGfx_Copyright)) return NULL;
  const uint8 *data = Taken(&g_copyright_oam, &size);
  if (data == NULL || size < kOamHeaderBytes) return NULL;
  *count = data[0];
  if (*count == 0 || *count > kOamEntriesMax || size < kOamHeaderBytes + (uint32)*count * kOamEntryBytes) return NULL;
  return data;
}

uint8 GameHook_TitleYLimit(int k, uint8 us_limit) {
  uint32 size;
  if (!JaGraphics_On(kJaGfx_Title) || (enhanced_features2 & kFeatures2_TitleOverride)) return us_limit;
  const uint8 *data = Taken(&g_title_params, &size);
  return (data != NULL && size >= kTitleParamsBytes && k >= 0 && k < kTitleParamsBytes) ? data[k] : us_limit;
}

bool GameHook_CopyrightInit(int k) {
  int count;
  const uint8 *data = CopyrightOam(&count);
  if (data == NULL) return false;
  intro_x_lo[k] = data[1];
  intro_x_hi[k] = 0;
  intro_y_lo[k] = data[2];
  intro_y_hi[k] = 0;
  intro_sprite_isinited[k]++;
  return true;
}

bool GameHook_CopyrightAnimate(int k) {
  int count;
  const uint8 *data = CopyrightOam(&count);
  if (data == NULL) return false;
  IntroSpriteEnt ents[kOamEntriesMax];
  for (int i = 0; i < count; i++) {
    const uint8 *rec = data + kOamHeaderBytes + i * kOamEntryBytes;
    ents[i] = (IntroSpriteEnt){(int8)rec[0], (int8)rec[2], rec[4], rec[5], rec[7]};
  }
  AnimateSceneSprite_AddObjectsToOamBuffer(k, ents, count);
  return true;
}

// The subtitle plate's sprite layout from the pack, in the copyright line's format. NULL unless the title is
// Japanese and the pack has it.
const uint8 *JaGraphics_PlateOam(int *count) {
  uint32 size;
  if (!JaGraphics_On(kJaGfx_Title)) return NULL;
  const uint8 *data = Taken(&g_plate_oam, &size);
  if (data == NULL || size < kOamHeaderBytes) return NULL;
  *count = data[0];
  if (*count == 0 || *count > kOamEntriesMax || size < kOamHeaderBytes + (uint32)*count * kOamEntryBytes) return NULL;
  return data;
}

// The Japanese title's palette words (JaTitlePalettes order), NULL unless the title is Japanese.
const uint16 *JaGraphics_TitlePalettes(void) {
  uint32 size;
  if (!JaGraphics_On(kJaGfx_Title)) return NULL;
  const uint8 *data = Taken(&g_title_palettes, &size);
  return data != NULL && size == kTitlePaletteWords * 2 ? (const uint16 *)data : NULL;
}

static bool Store(Blob *slot, const void *data, int len) {
  uint8 *copy = NULL;
  if (len > 0) {
    if (data == NULL) return false;
    copy = (uint8 *)malloc((size_t)len);
    if (copy == NULL) return false;
    memcpy(copy, data, (size_t)len);
  }
  free(slot->data);
  slot->data = copy;
  slot->size = copy != NULL ? (uint32)len : 0;
  return true;
}

const uint8 *JaGraphics_TilemapFont(uint32 *size) {
  return Taken(&g_tilemap_font, size);
}

// A Japanese set's own font slot in the asset blob is empty: its glyphs are the pack's, so the dialogue
// font block points at the pack's [sheet, widths] blob (the asset blob's layout), or at nothing when the
// pack has none, which leaves every glyph blank. Any other set keeps the block ZeldaSetLanguage gave it.
void JaGraphics_DialogueFontSync(void) {
  if ((g_zenv.dialogue_flags & kJapaneseFlag) == 0) return;
  g_zenv.dialogue_font_blk = (MemBlk){g_dialogue_font.data, g_dialogue_font.size};
}

static Blob *SlotOf(int id) {
  if (id == kDialogueFontId) return &g_dialogue_font;
  if (id == kTilemapFontId) return &g_tilemap_font;
  if (id == kIntroTilemapId) return &g_intro_tilemap;
  if (id == kCopyrightOamId) return &g_copyright_oam;
  if (id == kTitleParamsId) return &g_title_params;
  if (id == kPlateOamId) return &g_plate_oam;
  if (id == kTitlePalettesId) return &g_title_palettes;
  if (id >= kHudTextIdBase && id < kHudTextIdBase + kHudTextCount) return &g_hud_text[id - kHudTextIdBase];
  if (id >= kPatchIdBase && id < kPatchIdBase + kLangSheetMax) return &g_patches[id - kPatchIdBase];
  if (id >= kSheetIdBase && id < kSheetIdBase + 2 * kLangSheetMax)
    return &g_sheets[(id - kSheetIdBase) / kLangSheetMax][(id - kSheetIdBase) % kLangSheetMax];
  return NULL;
}

// |id| is the language screens' own: 0x100 + index a sprite sheet, 0x200 + index a background sheet,
// 0x300 + index a sprite sheet tile patch, 0x45 the intro tilemap, 0x46 the copyright layout, 0x47 the triforce
// heights, 0x48 the subtitle plate layout, 0x49 the title palettes, 0x4a the dialogue font ([sheet, widths]),
// 0x4b the 512-tile tilemap font, 0x50 + n the n-th pause word table. Returns 1 when taken.
EMSCRIPTEN_KEEPALIVE
int WasmSetJapaneseGraphic(int id, const void *data, int len) {
  Blob *slot = SlotOf(id);
  if (slot == NULL || len < 0 || !Store(slot, data, len)) return 0;
  JaGraphics_DialogueFontSync();
  LanguageScreensAssets_Apply(LanguageScreens_On());
  return 1;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearJapaneseGraphics(void) {
  for (int kind = 0; kind < 2; kind++)
    for (int i = 0; i < kLangSheetMax; i++) Store(&g_sheets[kind][i], NULL, 0);
  for (int i = 0; i < kLangSheetMax; i++) Store(&g_patches[i], NULL, 0);
  Store(&g_intro_tilemap, NULL, 0);
  Store(&g_copyright_oam, NULL, 0);
  Store(&g_title_params, NULL, 0);
  Store(&g_plate_oam, NULL, 0);
  Store(&g_title_palettes, NULL, 0);
  for (int i = 0; i < kHudTextCount; i++) Store(&g_hud_text[i], NULL, 0);
  Store(&g_dialogue_font, NULL, 0);
  Store(&g_tilemap_font, NULL, 0);
  JaGraphics_DialogueFontSync();
  LanguageScreensAssets_Apply(LanguageScreens_On());
}
