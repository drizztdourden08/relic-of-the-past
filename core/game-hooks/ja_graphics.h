/* @layer core-game-hooks @kind native */
// The Japanese cartridge's graphics (ja_graphics.c). Included from game_hooks.h.
//
// The Japanese cartridge's pictures and glyphs (its dialogue font and its tilemap font) come ONLY from the
// host's Japanese graphics pack (WasmSetJapaneseGraphic), imported from a Japanese cartridge; a language set
// carries text only and none of them is ever filled from it. Without the pack no Japanese picture is drawn. The bits below are latched values (Live):
//   kJaGfx_FileSelect  option (layout, no language): the file select screens run the Japanese layout
//                      (select_layout.c) where the language set carries text for it. The text still follows the set.
//   kJaGfx_Title       option: the title is the Japanese cartridge's (title_ja.c): its logo, copyright line,
//                      triforce heights, subtitle plate, palettes and sequence. Latched on only while the pack
//                      holds all of it and kFeatures2_TitleOverride is off; it brings the two bits below.
//   kJaGfx_Intro       the intro's background sheets and its tilemap (asset 99). The Japanese file select
//                      layout reads the same sheets itself.
//   kJaGfx_Copyright   the tile patch on sprite sheet 8 that draws the Japanese copyright line.
//   kJaGfx_Hud         never set: the two HUD sprite sheets (105, 106) carry the pause words, which a
//                      Japanese set draws with the pack (HudPackDrawn) and no other set does.
// The bits sit at 19 to 23, below kFeatures2_HandAuthoredFloor, above the language graphics bits 14 to 18
// (kLangGfx_*, language_screens.h). gen-bundle-flags.mjs refuses to allocate a generated word-2 bit at 14
// or above, so the generated bug-fix flags never reach either set.
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

// The Japanese glyphs, drawn only from the pack (a set carries none). The 512-tile tilemap font the credits
// and the Japanese file select upload (language_screens_font.c), NULL when the pack has none.
const uint8 *JaGraphics_TilemapFont(uint32 *size);
// Points g_zenv.dialogue_font_blk at the pack's dialogue font while a Japanese set is loaded (an empty
// block without the pack, so its glyphs draw blank). Called as the language is set (GameHook_LanguageScreens)
// and whenever the pack changes.
void JaGraphics_DialogueFontSync(void);

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

// The subtitle plate's sprite layout (count, start x, start y, then 8 byte records) and the title's palette
// words, NULL unless the title is Japanese (kJaGfx_Title latched).
const uint8 *JaGraphics_PlateOam(int *count);
const uint16 *JaGraphics_TitlePalettes(void);

// The triforce piece |k|'s resting height: the pack's Japanese value while the Title option is on and the
// pack has it, else |us_limit|. Called by ending.c's Intro_SpriteType_B_0.
uint8 GameHook_TitleYLimit(int k, uint8 us_limit);
