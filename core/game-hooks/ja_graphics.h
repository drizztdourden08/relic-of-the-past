/* @layer core-game-hooks @kind native */
// The Japanese cartridge's graphics as opt-in options (ja_graphics.c). Included from game_hooks.h.
//
// Four independent options, each a features2 bit the host sets from a setting; off is the US graphics:
//   kJaGfx_FileSelect  the file select screens run the Japanese layout (select_layout.c) where the
//                      language set carries text for it. The text still follows the set.
//   kJaGfx_Intro       the intro's background sheets and its tilemap (asset 99).
//   kJaGfx_Hud         the two HUD sprite sheets (105, 106).
//   kJaGfx_Copyright   the tile patch on sprite sheet 8 that draws the Japanese copyright line.
// The pictures come from the host's Japanese graphics pack (WasmSetJapaneseGraphic), extracted from a
// Japanese cartridge, so they apply with any language set. A Japanese set also carries the same
// pictures; its copy is used only while the option is on (JaGraphics_SetSheetAllowed).
// The bits sit just under kFeatures2_HandAuthoredFloor, outside the generated bug-fix range.
#pragma once
#include "src/types.h"

enum {
  kJaGfx_Intro = 1u << 20,
  kJaGfx_Hud = 1u << 21,
  kJaGfx_Copyright = 1u << 22,
  kJaGfx_FileSelect = 1u << 23,
};

// Whether option |bit| is on: set in features2 and Vanilla Safe off.
bool JaGraphics_On(uint32 bit);

// The pack's copy of background (|kind| 1) or sprite (|kind| 0) sheet |index|, NULL unless the option
// that owns it is on and the pack has it.
const uint8 *JaGraphics_Sheet(int kind, int index, uint32 *size);

// The pack's patch for sprite sheet |index| (same layout as a set's: count, tile indices, tiles), NULL
// unless the Copyright option is on and the pack has it.
const uint8 *JaGraphics_Patch(int index, uint32 *size);

// The pack's intro tilemap, NULL unless the Intro option is on and the pack has it.
const uint8 *JaGraphics_IntroTilemap(uint32 *size);

// Whether a Japanese language set's own copy of a sheet, patch or the intro tilemap is drawn: always
// for what no option owns or for a set that is not Japanese, otherwise only with the owning option on.
bool JaGraphics_SetSheetAllowed(int kind, int index);
bool JaGraphics_SetPatchAllowed(int index);
bool JaGraphics_SetIntroAllowed(void);
