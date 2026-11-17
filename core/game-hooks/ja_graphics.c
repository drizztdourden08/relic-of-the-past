/* @layer core-game-hooks @kind native */
// The Japanese graphics pack and the option bits that switch it in. See ja_graphics.h.
#include "game_hooks_internal.h"
#include "src/features.h"
#include <stdlib.h>

enum { kSheetIdBase = 0x100, kPatchIdBase = 0x300, kIntroTilemapId = 0x45, kBgSheetKind = 1, kSprSheetKind = 0 };

typedef struct {
  uint8 *data;
  uint32 size;
} Blob;

static Blob g_sheets[2][kLangSheetMax];
static Blob g_patches[kLangSheetMax];
static Blob g_intro_tilemap;

static const uint8 kIntroSheets[] = {22, 23, 29, 30, 57, 64, 65};
static const uint8 kHudSheets[] = {105, 106};
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

bool JaGraphics_On(uint32 bit) {
  return (enhanced_features2 & bit) != 0 && (enhanced_features3 & kFeatures3_VanillaSafe) == 0;
}

static const uint8 *Taken(const Blob *blob, uint32 *size) {
  if (blob->data == NULL) return NULL;
  *size = blob->size;
  return blob->data;
}

const uint8 *JaGraphics_Sheet(int kind, int index, uint32 *size) {
  uint32 option = SheetOption(kind, index);
  if (option == 0 || !JaGraphics_On(option) || index < 0 || index >= kLangSheetMax) return NULL;
  return Taken(&g_sheets[kind][index], size);
}

const uint8 *JaGraphics_Patch(int index, uint32 *size) {
  if (index != kCopyrightSheet || !JaGraphics_On(kJaGfx_Copyright)) return NULL;
  return Taken(&g_patches[index], size);
}

const uint8 *JaGraphics_IntroTilemap(uint32 *size) {
  return JaGraphics_On(kJaGfx_Intro) ? Taken(&g_intro_tilemap, size) : NULL;
}

bool JaGraphics_SetSheetAllowed(int kind, int index) {
  uint32 option = SheetOption(kind, index);
  return option == 0 || SelectLayout_OfSet() != kSelectLayout_Ja || JaGraphics_On(option);
}

bool JaGraphics_SetPatchAllowed(int index) {
  return index != kCopyrightSheet || SelectLayout_OfSet() != kSelectLayout_Ja || JaGraphics_On(kJaGfx_Copyright);
}

bool JaGraphics_SetIntroAllowed(void) {
  return SelectLayout_OfSet() != kSelectLayout_Ja || JaGraphics_On(kJaGfx_Intro);
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

static Blob *SlotOf(int id) {
  if (id == kIntroTilemapId) return &g_intro_tilemap;
  if (id >= kPatchIdBase && id < kPatchIdBase + kLangSheetMax) return &g_patches[id - kPatchIdBase];
  if (id >= kSheetIdBase && id < kSheetIdBase + 2 * kLangSheetMax)
    return &g_sheets[(id - kSheetIdBase) / kLangSheetMax][(id - kSheetIdBase) % kLangSheetMax];
  return NULL;
}

// |id| is the language screens' own: 0x100 + index a sprite sheet, 0x200 + index a background sheet,
// 0x300 + index a sprite sheet tile patch, 0x45 the intro tilemap. Returns 1 when taken.
EMSCRIPTEN_KEEPALIVE
int WasmSetJapaneseGraphic(int id, const void *data, int len) {
  Blob *slot = SlotOf(id);
  if (slot == NULL || len < 0 || !Store(slot, data, len)) return 0;
  LanguageScreensAssets_Apply(LanguageScreens_On());
  return 1;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearJapaneseGraphics(void) {
  for (int kind = 0; kind < 2; kind++)
    for (int i = 0; i < kLangSheetMax; i++) Store(&g_sheets[kind][i], NULL, 0);
  for (int i = 0; i < kLangSheetMax; i++) Store(&g_patches[i], NULL, 0);
  Store(&g_intro_tilemap, NULL, 0);
  LanguageScreensAssets_Apply(LanguageScreens_On());
}
