/* @layer core-game-hooks @kind native */
// The Japanese cartridge's graphics as opt-in options (ja_graphics.c). Included from game_hooks.h.
//
// Four independent options, each a features2 bit the host sets from a setting; off is the US graphics:
//   kJaGfx_FileSelect  the file select screens run the Japanese layout (select_layout.c) where the
//                      language set carries text for it. The text still follows the set.
//   kJaGfx_Intro       the intro's background sheets and its tilemap (asset 99). The Japanese file select
//                      layout reads the same sheets itself, whatever this option says.
//   kJaGfx_Hud         no longer read: the two HUD sprite sheets (105, 106) carry the pause words, which
//                      follow the language, so a Japanese set always draws them and no other set does.
//   kJaGfx_Copyright   the tile patch on sprite sheet 8 that draws the Japanese copyright line.
// The pictures come from the host's Japanese graphics pack (WasmSetJapaneseGraphic), extracted from a
// Japanese cartridge, so they apply with any language set. A Japanese set also carries the same
// pictures; its copy is used only while the option is on, its HUD sheets always (JaGraphics_SetSheetAllowed).
//   kJaGfx_Title      the Japanese title sequence: the intro art as kJaGfx_Intro, and the triforce pieces stop
//                      at the Japanese cartridge's heights (the pack's title parameters). Never applies while
//                      kFeatures2_TitleOverride is on.
// The bits sit at 19 to 23, below kFeatures2_HandAuthoredFloor. gen-bundle-flags.mjs refuses to allocate
// a generated word-2 bit at 19 or above, so the generated bug-fix flags never reach them.
#pragma once
#include "src/types.h"

enum {
  kJaGfx_Title = 1u << 19,
  kJaGfx_Intro = 1u << 20,
  kJaGfx_Hud = 1u << 21,
  kJaGfx_Copyright = 1u << 22,
  kJaGfx_FileSelect = 1u << 23,
};

// The bits Vanilla Safe strips from gate word |word|, applied in zelda_rtl.c's SyncGateWords on top of
// kGateWordParityMask, so the word itself reads clear under Vanilla Safe and the screen assets re-apply.
uint32 GameHook_ParityMask(int word);

// The options take effect only as a screen loads, so a screen on display never changes under tiles loaded
// for the other setting. Until the first frame ends the latch follows the gate word (JaGraphics_Gate,
// from GateWordSideEffects); after that it is refreshed when the main module changes (JaGraphics_FrameEnd,
// from GameHook_ModuleFrameEnd), re-applying the screen assets if a bit changed.
void JaGraphics_Gate(void);
void JaGraphics_FrameEnd(void);

// Whether option |bit| is on: its latched value from the (already Vanilla Safe masked) features2 word.
bool JaGraphics_On(uint32 bit);

// The pack's copy of background (|kind| 1) or sprite (|kind| 0) sheet |index|, NULL unless the option
// that owns it is on and the pack has it.
const uint8 *JaGraphics_Sheet(int kind, int index, uint32 *size);
// The pack's sheet |index| of |kind| whether or not its option is on: what may sit in VRAM from before.
const uint8 *JaGraphics_PackSheet(int kind, int index, uint32 *size);

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

// Whether a set's own pause menu text tables are read. A Japanese set's name tiles of its HUD sheets
// (105, 106), so they are read only while those sheets are drawn: the pack's, or the set's own copy.
bool JaGraphics_SetHudAllowed(void);

// The pack's own pause words for language table |id| (a kLangTbl_Hud* id), drawn with its HUD sheets, and
// their byte length in |len|. NULL unless the set is Japanese and the pack carries both HUD sheets and
// every pause table.
const uint8 *JaGraphics_HudText(int id, int *len);

// The Japanese copyright line's own sprite layout (its start position and objects differ from the US
// line), read from the pack. Called first in ending.c's InitializeSceneSprite_Copyright and
// AnimateSceneSprite_Copyright; each returns true when it ran in place of the US routine, false (option
// off or no pack entry) to leave the US routine untouched.
bool GameHook_CopyrightInit(int k);
bool GameHook_CopyrightAnimate(int k);

// The triforce piece |k|'s resting height: the pack's Japanese value while the Title option is on and the
// pack has it, else |us_limit|. Called by ending.c's Intro_SpriteType_B_0.
uint8 GameHook_TitleYLimit(int k, uint8 us_limit);
