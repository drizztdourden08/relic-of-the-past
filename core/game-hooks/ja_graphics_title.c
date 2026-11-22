/* @layer core-game-hooks @kind native */
// The Japanese title's pieces read from the graphics pack: the copyright line and subtitle plate sprite
// layouts, the triforce heights and the title palettes. See ja_graphics.h.
#include "game_hooks_internal.h"
#include "src/features.h"
#include "src/ending.h"

enum { kOamHeaderBytes = 3, kOamEntryBytes = 8, kOamEntriesMax = 16 };

// A sprite layout from the pack: count, start x, start y, then count 8 byte records (x word, y word,
// character, flags, extension word whose high byte is the size bit). NULL unless option |bit| is on and
// the pack holds a whole layout.
static const uint8 *OamLayout(uint32 bit, int id, int *count) {
  uint32 size;
  if (!JaGraphics_On(bit)) return NULL;
  const uint8 *data = JaGraphics_Entry(id, &size);
  if (data == NULL || size < kOamHeaderBytes) return NULL;
  *count = data[0];
  if (*count == 0 || *count > kOamEntriesMax || size < kOamHeaderBytes + (uint32)*count * kOamEntryBytes) return NULL;
  return data;
}

uint8 GameHook_TitleYLimit(int k, uint8 us_limit) {
  uint32 size;
  if (!JaGraphics_On(kJaGfx_Title) || (enhanced_features2 & kFeatures2_TitleOverride)) return us_limit;
  const uint8 *data = JaGraphics_Entry(kJaPack_TitleParams, &size);
  return (data != NULL && size >= kJaPack_TitleParamsBytes && k >= 0 && k < kJaPack_TitleParamsBytes) ? data[k] : us_limit;
}

bool GameHook_CopyrightInit(int k) {
  int count;
  const uint8 *data = OamLayout(kJaGfx_Copyright, kJaPack_CopyrightOam, &count);
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
  const uint8 *data = OamLayout(kJaGfx_Copyright, kJaPack_CopyrightOam, &count);
  if (data == NULL) return false;
  IntroSpriteEnt ents[kOamEntriesMax];
  for (int i = 0; i < count; i++) {
    const uint8 *rec = data + kOamHeaderBytes + i * kOamEntryBytes;
    ents[i] = (IntroSpriteEnt){(int8)rec[0], (int8)rec[2], rec[4], rec[5], rec[7]};
  }
  AnimateSceneSprite_AddObjectsToOamBuffer(k, ents, count);
  return true;
}

const uint8 *JaGraphics_PlateOam(int *count) {
  return OamLayout(kJaGfx_Title, kJaPack_PlateOam, count);
}

// The palette words in JaTitlePalettes order.
const uint16 *JaGraphics_TitlePalettes(void) {
  uint32 size;
  if (!JaGraphics_On(kJaGfx_Title)) return NULL;
  const uint8 *data = JaGraphics_Entry(kJaPack_TitlePalettes, &size);
  return data != NULL && size == kJaPack_TitlePaletteWords * 2 ? (const uint16 *)data : NULL;
}
