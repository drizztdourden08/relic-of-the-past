/* @layer core-game-hooks @kind native */
// The Japanese cartridge's title sequence. See title_ja.h.
#include "game_hooks_internal.h"
#include "src/ending.h"
#include "src/load_gfx.h"

enum {
  kSkipAt = 4,
  kSubFadeIn = 5,
  kSubPlate = 6,
  kSubHold = 7,
  kPlateWait = 0x20,
  kModuleAttract = 0x14,
  kLayersAtCountdown = 13,
  kTitleLayers = 0x15,
  kPlateSprite = 3,
  kPlateSubtype = 1,
  kRowEntries = 7,
  kRowBytes = 32,
};

// Where each slice of the pack's palette words lands in the aux palette buffer, in pack order: the
// overworld background main palette, the aux palette loaded for both its halves, the third aux palette
// and the left half of the first sprite palette.
typedef struct {
  uint16 dst;
  uint8 rows;
  bool repeat;
} PaletteSlice;

static const PaletteSlice kSlices[] = {
  {0x42, 5, false},
  {0x52, 3, true},
  {0xb2, 3, false},
  {0xe2, 1, false},
  {0x102, 1, false},
};

static bool Live(void) {
  return JaGraphics_On(kJaGfx_Title);
}

uint8 GameHook_TitleJaSkipAt(uint8 skip_at) {
  return Live() && skip_at > kSkipAt ? kSkipAt : skip_at;
}

// One palette filter step on odd frames, over the background and sprite rows together, stopping a step
// short of the target as the cartridge does; the layers switch on partway.
static void FadeIn(void) {
  Intro_HandleAllTriforceAnimations();
  if (!(frame_counter & 1)) return;
  ApplyPaletteFilter_bounce();
  if (BYTE(palette_filter_countdown) == 0) {
    subsubmodule_index = kPlateWait;
    submodule_index++;
  } else if (BYTE(palette_filter_countdown) == kLayersAtCountdown) {
    TM_copy = kTitleLayers;
    TS_copy = 0;
  }
}

static void PlateWait(void) {
  Intro_HandleAllTriforceAnimations();
  if (--subsubmodule_index) return;
  intro_sprite_isinited[kPlateSprite] = 1;
  intro_sprite_subtype[kPlateSprite] = kPlateSubtype;
  submodule_index++;
}

// subsubmodule_index is 0 on entry, so the hold is 256 frames.
static void Hold(void) {
  Intro_HandleAllTriforceAnimations();
  if (--subsubmodule_index) return;
  main_module_index = kModuleAttract;
  submodule_index = 0;
  BYTE(link_x_coord) = 0;
}

bool GameHook_TitleJaSubmodule(void) {
  if (!Live()) return false;
  switch (submodule_index) {
  case kSubFadeIn: FadeIn(); return true;
  case kSubPlate: PlateWait(); return true;
  case kSubHold: Hold(); return true;
  default: return false;
  }
}

void GameHook_TitlePlate(int k) {
  enum { kHeader = 3, kEntry = 8, kMax = 16 };
  int count = 0;
  const uint8 *data = JaGraphics_PlateOam(&count);
  if (data == NULL || count > kMax) return;
  if (intro_sprite_isinited[k] == 1) {
    intro_x_lo[k] = data[1];
    intro_x_hi[k] = 0;
    intro_y_lo[k] = data[2];
    intro_y_hi[k] = 0;
    intro_sprite_isinited[k]++;
    return;
  }
  IntroSpriteEnt ents[kMax];
  for (int i = 0; i < count; i++) {
    const uint8 *rec = data + kHeader + i * kEntry;
    ents[i] = (IntroSpriteEnt){(int8)rec[0], (int8)rec[2], rec[4], rec[5], rec[7]};
  }
  AnimateSceneSprite_AddObjectsToOamBuffer(k, ents, count);
}

void GameHook_TitleJaPalettes(void) {
  const uint16 *src = JaGraphics_TitlePalettes();
  if (src == NULL) return;
  for (size_t i = 0; i < countof(kSlices); i++) {
    const PaletteSlice *slice = &kSlices[i];
    for (int row = 0; row < slice->rows; row++)
      memcpy(&aux_palette_buffer[(slice->dst + row * kRowBytes) >> 1], src + row * kRowEntries, kRowEntries * sizeof(uint16));
    if (!slice->repeat) src += slice->rows * kRowEntries;
  }
}

bool GameHook_TitleJaAttractStill(void) {
  return Live() && main_module_index == kModuleAttract;
}
