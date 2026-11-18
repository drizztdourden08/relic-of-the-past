/* @layer core-game-hooks @kind native */
// The language's own tilemap font: 2bpp tiles the credits upload to VRAM $7000 in place of the US font.
// Only a Japanese set (dialogue_flags bit 2) takes it: its ending captions, credits and death-count
// digits name tiles 0x000-0x1ff, a 512-tile font built from the dialogue glyphs, twice the 0x800 words
// of the US font. The file select (main module 1) takes its first 0x1a00 bytes, tiles 0x000-0x19f,
// whenever the set is ready (SelectLayout_JapaneseFont), in either layout: its names, labels and kana
// grid draw from them, and the sprite sheet uploaded right after moves above them
// (GameHook_FileSelectSheetVram). A Latin set's font is the 256-tile font of its own cartridge, which
// places the file select's letters and digits elsewhere than the US font: the file select takes all of
// it, since its stripes name those places. Otherwise the file select keeps the US font.
// Gate: kFeatures2_LanguageScreens. Off, with no font or outside a Japanese set, the original upload runs.
#include "game_hooks_internal.h"
#include "src/features.h"
#include <stdlib.h>

enum { kFontMaxBytes = 0x2000, kLatinFontBytes = 0x1000, kFileSelectFontBytes = 0x1a00, kJapaneseFlag = 4, kModuleFileSelect = 1, kModuleCredits = 0x1a };

static uint8 *g_font;
static int g_font_len;

bool LanguageScreensFont_Set(const void *data, int len) {
  if (len < 0 || len > kFontMaxBytes || (len > 0 && data == NULL)) return false;
  uint8 *copy = NULL;
  if (len > 0) {
    copy = (uint8 *)malloc((size_t)len);
    if (copy == NULL) return false;
    memcpy(copy, data, (size_t)len);
  }
  free(g_font);
  g_font = copy;
  g_font_len = copy != NULL ? len : 0;
  return true;
}

void LanguageScreensFont_Clear(void) {
  LanguageScreensFont_Set(NULL, 0);
}

bool LanguageScreensFont_Ready(void) {
  return g_font_len == kFontMaxBytes;
}

bool GameHook_TransferTilemapFont(uint16 *dst) {
  if (!LanguageScreens_On()) return false;
  if (g_font_len == kLatinFontBytes && main_module_index == kModuleFileSelect) {
    memcpy(dst, g_font, kLatinFontBytes);
    return true;
  }
  if (g_font_len != kFontMaxBytes) return false;
  if (main_module_index == kModuleFileSelect && SelectLayout_JapaneseFont()) {
    memcpy(dst, g_font, kFileSelectFontBytes);
    return true;
  }
  if ((g_zenv.dialogue_flags & kJapaneseFlag) == 0 || main_module_index != kModuleCredits) return false;
  memcpy(dst, g_font, kFontMaxBytes);
  return true;
}
