/* @layer core-game-hooks @kind native */
// The Japanese cartridge's graphics as opt-in options (ja_graphics.c). Included from game_hooks.h.
//
// Four independent options, each a features2 bit the host sets from a setting; off is the US graphics:
//   kJaGfx_FileSelect  the file select screens run the Japanese layout (select_layout.c) where the
//                      language set carries text for it. The text still follows the set.
//   kJaGfx_Intro       the intro's background sheets and its tilemap (asset 99). The Japanese file select
//                      layout reads the same sheets itself, whatever this option says.
//   kJaGfx_Hud         the two HUD sprite sheets (105, 106).
//   kJaGfx_Copyright   the tile patch on sprite sheet 8 that draws the Japanese copyright line.
// The pictures come from the host's Japanese graphics pack (WasmSetJapaneseGraphic), extracted from a
// Japanese cartridge, so they apply with any language set. A Japanese set also carries the same
// pictures; its copy is used only while the option is on (JaGraphics_SetSheetAllowed).
// The bits sit at 20 to 23, below kFeatures2_HandAuthoredFloor. gen-bundle-flags.mjs refuses to allocate
// a generated word-2 bit at 20 or above, so the generated bug-fix flags never reach them.
#pragma once
#include "src/types.h"

enum {
  kJaGfx_Intro = 1u << 20,
  kJaGfx_Hud = 1u << 21,
  kJaGfx_Copyright = 1u << 22,
  kJaGfx_FileSelect = 1u << 23,
};

// The bits Vanilla Safe strips from gate word |word|, applied in zelda_rtl.c's SyncGateWords on top of
// kGateWordParityMask, so the word itself reads clear under Vanilla Safe and the screen assets re-apply.
uint32 GameHook_ParityMask(int word);

// Whether option |bit| is on in the (already Vanilla Safe masked) features2 word.
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
