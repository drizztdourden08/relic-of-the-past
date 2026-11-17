/* @layer core-game-hooks @kind native */
// The asset half of the language screens: assets 74-78 (ending, credits) and 99-104 (menu tilemaps)
// are repointed in g_asset_ptrs, and sheets of kSprGfx / kBgGfx are overridden through
// core/wasm-build/emscripten_io.c. Applied only while kFeatures2_LanguageScreens is on; turned off
// (or cleared) the original pointers go back, so the baked US data is what the game reads.
#include "game_hooks_internal.h"
#include "src/features.h"
#include "src/load_gfx.h"
#include <stdlib.h>

typedef struct {
  uint8 *data;
  uint32 size;
} Blob;

// Ids 0x300 + index: a tile patch for sprite sheet |index| (see ApplyPatch).
enum { kAssetIdBase = 0x40, kSheetIdBase = 0x100, kPatchIdBase = 0x300, kSheetBytes = 0x600, kTileBytes = 24 };

// The asset number of each slot, in kLangAsset_* order.
static const uint8 kSlotAsset[kLangAsset_Count] = {74, 75, 76, 77, 78, 99, 100, 101, 102, 103, 104};

static Blob g_assets[kLangAsset_Count];
static Blob g_sheets[2][kLangSheetMax];
static Blob g_patches[kLangSheetMax];   // host patch: [count][tile indices][count * kTileBytes]
static Blob g_patched[kLangSheetMax];   // the baked sheet with the patch applied
static const uint8 *g_orig_ptr[kLangAsset_Count];
static uint32 g_orig_size[kLangAsset_Count];
static bool g_orig_taken;

static void TakeOriginals(void) {
  if (g_orig_taken) return;
  for (int i = 0; i < kLangAsset_Count; i++) {
    g_orig_ptr[i] = g_asset_ptrs[kSlotAsset[i]];
    g_orig_size[i] = g_asset_sizes[kSlotAsset[i]];
  }
  g_orig_taken = true;
}

// The baked sprite sheet |idx| with the host's tiles written over it, kept in g_patched[idx]. Lets a
// language replace only the tiles of one word and keep the rest of the sheet (the ending sheet also
// carries sprites the language has no copy of). NULL when there is no patch or the sheet is not raw-sized.
static const uint8 *ApplyPatch(int idx) {
  const Blob *patch = &g_patches[idx];
  Blob *out = &g_patched[idx];
  AssetSheet_SetOverride(0, idx, NULL, 0);
  if (patch->data == NULL || patch->size < 1) return NULL;
  uint32 count = patch->data[0];
  if (patch->size != 1 + count + count * kTileBytes) return NULL;
  MemBlk base = FindInAssetArray(64, idx);
  if (base.ptr == NULL) return NULL;
  uint8 *buf = out->data != NULL ? out->data : (uint8 *)malloc(kSheetBytes * 2);
  if (buf == NULL) return NULL;
  out->data = buf;
  int len = kSheetBytes;
  if (base.size == kSheetBytes) memcpy(buf, base.ptr, kSheetBytes);
  else len = Decompress(buf, base.ptr);
  if (len != kSheetBytes) return NULL;
  for (uint32 i = 0; i < count; i++) {
    uint32 tile = patch->data[1 + i];
    if ((tile + 1) * kTileBytes > kSheetBytes) continue;
    memcpy(buf + tile * kTileBytes, patch->data + 1 + count + i * kTileBytes, kTileBytes);
  }
  out->size = kSheetBytes;
  return buf;
}

void LanguageScreensAssets_Apply(bool on) {
  if (g_asset_ptrs[kSlotAsset[0]] == NULL) return;  // assets not loaded yet
  TakeOriginals();
  for (int i = 0; i < kLangAsset_Count; i++) {
    bool host = on && g_assets[i].data != NULL;
    g_asset_ptrs[kSlotAsset[i]] = host ? g_assets[i].data : g_orig_ptr[i];
    g_asset_sizes[kSlotAsset[i]] = host ? g_assets[i].size : g_orig_size[i];
  }
  for (int kind = 0; kind < 2; kind++) {
    for (int i = 0; i < kLangSheetMax; i++) {
      const Blob *b = &g_sheets[kind][i];
      AssetSheet_SetOverride(kind, i, (on && b->data != NULL) ? b->data : NULL, b->size);
    }
  }
  for (int i = 0; i < kLangSheetMax; i++) {
    if (g_sheets[0][i].data != NULL) continue;
    const uint8 *patched = on ? ApplyPatch(i) : NULL;
    if (patched != NULL) AssetSheet_SetOverride(0, i, patched, kSheetBytes);
    else AssetSheet_SetOverride(0, i, NULL, 0);
  }
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

bool LanguageScreensAssets_Set(int id, const void *data, int len) {
  Blob *slot = NULL;
  if (id >= kAssetIdBase && id < kAssetIdBase + kLangAsset_Count) {
    slot = &g_assets[id - kAssetIdBase];
  } else if (id >= kPatchIdBase && id < kPatchIdBase + kLangSheetMax) {
    slot = &g_patches[id - kPatchIdBase];
  } else if (id >= kSheetIdBase && id < kSheetIdBase + 2 * kLangSheetMax) {
    slot = &g_sheets[(id - kSheetIdBase) / kLangSheetMax][(id - kSheetIdBase) % kLangSheetMax];
  }
  if (slot == NULL || len < 0 || !Store(slot, data, len)) return false;
  LanguageScreensAssets_Apply(LanguageScreens_On());
  return true;
}

void LanguageScreensAssets_Clear(void) {
  LanguageScreensAssets_Apply(false);
  for (int i = 0; i < kLangAsset_Count; i++) Store(&g_assets[i], NULL, 0);
  for (int kind = 0; kind < 2; kind++)
    for (int i = 0; i < kLangSheetMax; i++) Store(&g_sheets[kind][i], NULL, 0);
  for (int i = 0; i < kLangSheetMax; i++) {
    Store(&g_patches[i], NULL, 0);
    Store(&g_patched[i], NULL, 0);
  }
}
