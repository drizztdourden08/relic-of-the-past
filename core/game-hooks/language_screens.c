/* @layer core-game-hooks @kind native */
// A language's screens: the static tables the vendored screens read, owned here so the host can
// supply a language's own. Gate: kFeatures2_LanguageScreens. Off, every LANG_PICK answers the
// vendored table, the tilemap font is the US one and no asset or sheet is repointed, which is the
// game exactly as it shipped. The assets and sheets half is language_screens_assets.c.
//
// Host flow: WasmClearLanguageScreens, WasmSetLanguageScreenTable for each table the language has,
// then ZeldaSetLanguage (or WasmApplyLanguageScreens when only the data changed). A table that was
// never set, or was set with the wrong length, keeps reading the vendored one (the select-file stripes
// and the name grid accept their own length, see kTableMaxBytes).
#include "game_hooks_internal.h"
#include "src/features.h"
#include <stdlib.h>

LanguageScreens g_language_screens;

// Byte length of each table, in kLangTbl_* order.
static const uint16 kTableBytes[kLangTbl_Count] = {
  160, 40, 256, 32, 64, 32, 96, 640, 32, 32,  // hud.c
  224, 253, 173, 73, 133, 49, 253, 101,       // select_file.c stripes
  128,                                        // name grid
  1488,                                       // kDungMap_Tab23
  4,                                          // credits death-count digit tiles
  28,                                         // credits scroll line of each death count
  180,                                        // file select background palette set
};

// Largest byte length the host may give a variable table (0 = the length must match kTableBytes). The
// vendored sites copy it into a buffer with room for this much: the stripe buffer at vram_upload_data.
// The other select-file stripes and the name grid take the Japanese layout's own lengths.
static const uint16 kTableMaxBytes[kLangTbl_Count] = {
  [kLangTbl_SelectFileGfx0] = 320,
  [kLangTbl_SelectFileFunc3] = 320,
  [kLangTbl_CopyBlinkTab] = 224,
  [kLangTbl_CopyBlinkTab1] = 96,
  [kLangTbl_CopyTargetTab0] = 160,
  [kLangTbl_CopyTargetTab2] = 96,
  [kLangTbl_KillTab] = 320,
  [kLangTbl_KillTab2] = 128,
  [kLangTbl_NameGrid] = 320,
};

bool LanguageScreens_On(void) {
  return (enhanced_features2 & kFeatures2_LanguageScreens) != 0;
}

// The Japanese select-file set (its stripes and grid, told apart by a stripe of another length than
// the US one) is read only as a whole and only in Japanese mode: without it the US screens would write
// US offsets into Japanese stripes, so they keep the vendored tables.
static bool HeldBack(int id) {
  if (id < kLangTbl_SelectFileFunc3 || id > kLangTbl_NameGrid) return false;
  const LanguageScreens *s = &g_language_screens;
  int func3 = kLangTbl_SelectFileFunc3;
  bool ja_set = s->table[func3] != NULL && s->length[func3] != kTableBytes[func3];
  return ja_set && !LanguageJa_On();
}

static bool HostPicked(int id) {
  return id >= 0 && id < kLangTbl_Count && g_language_screens.table[id] != NULL && LanguageScreens_On() &&
         !HeldBack(id);
}

const void *LanguageScreens_Pick(int id, const void *orig) {
  return HostPicked(id) ? g_language_screens.table[id] : orig;
}

int LanguageScreens_Len(int id, int orig_len) {
  return HostPicked(id) ? g_language_screens.length[id] : orig_len;
}

int GameHook_TilemapFont(void) {
  int font = g_language_screens.tilemap_font;
  if (!LanguageScreens_On() || font <= 0) return 0;
  return kDialogueFont(font).ptr != NULL ? font : 0;
}

void GameHook_LanguageScreens(const char *language) {
  (void)language;
  LanguageScreensAssets_Apply(LanguageScreens_On());
}

void GameHook_LanguageScreensGate(bool on) {
  JaGraphics_Gate();
  LanguageScreensAssets_Apply(on);
}

static bool SetTable(int id, const void *data, int len) {
  bool exact = len == kTableBytes[id];
  if (!exact && !(len > 0 && len <= kTableMaxBytes[id])) return false;
  void *copy = data != NULL ? malloc((size_t)len) : NULL;
  if (copy == NULL) return false;
  memcpy(copy, data, (size_t)len);
  free((void *)g_language_screens.table[id]);
  g_language_screens.table[id] = copy;
  g_language_screens.length[id] = (uint16)len;
  return true;
}

// |table_id|: 0..kLangTbl_Count-1 a static table (length must match), 0x40 + slot an asset blob
// (kLangAsset_*), kLangFontId the tilemap font tiles, 0x100 + kind * 256 + index a sheet override, 0x300 + index a sprite-sheet tile patch. A null |data| with |len| 0 drops the
// entry. Returns 1 when taken, 0 when refused (unknown id or wrong length), so a missing or refused
// table keeps the vendored one.
EMSCRIPTEN_KEEPALIVE
int WasmSetLanguageScreenTable(int table_id, const void *data, int len) {
  if (table_id >= 0 && table_id < kLangTbl_Count) {
    if (data == NULL && len == 0) {
      free((void *)g_language_screens.table[table_id]);
      g_language_screens.table[table_id] = NULL;
      return 1;
    }
    return SetTable(table_id, data, len) ? 1 : 0;
  }
  if (table_id == kLangFontId) return LanguageScreensFont_Set(data, len) ? 1 : 0;
  return LanguageScreensAssets_Set(table_id, data, len) ? 1 : 0;
}

// The kDialogueFont index the tilemap screens upload; 0 is the US font.
EMSCRIPTEN_KEEPALIVE
void WasmSetLanguageTilemapFont(int font_index) {
  g_language_screens.tilemap_font = font_index;
}

// Re-applies the stored data for the current gate (the data changed without a language change).
EMSCRIPTEN_KEEPALIVE
void WasmApplyLanguageScreens(void) {
  LanguageScreensAssets_Apply(LanguageScreens_On());
}

// Drops everything the host supplied: every table, asset, sheet and the font index.
EMSCRIPTEN_KEEPALIVE
void WasmClearLanguageScreens(void) {
  for (int i = 0; i < kLangTbl_Count; i++) {
    free((void *)g_language_screens.table[i]);
    g_language_screens.table[i] = NULL;
  }
  g_language_screens.tilemap_font = 0;
  LanguageScreensAssets_Clear();
  LanguageScreensFont_Clear();
}
