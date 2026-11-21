/* @layer core-game-hooks @kind native */
// The Japanese cartridge's title sequence (title_ja.c), run while the title is Japanese (kJaGfx_Title,
// ja_graphics.h). Included from game_hooks.h. Each hook leaves the US routine untouched while the title is US.
//
// The Japanese title differs from the US one in its sequence alone, matched against the Japanese ROM's
// module 00: the logo fades in over every background and sprite palette at once, no sword falls, the
// subtitle plate appears 32 frames after the fade, and the screen holds 256 frames before the attract
// sequence. A press skips it from submodule 4 on. The plate's layout and the title's palettes come from
// the Japanese graphics pack (JaGraphics_PlateOam, JaGraphics_TitlePalettes).
#pragma once
#include "src/types.h"

// The earliest submodule a press skips the title from: the Japanese cartridge's 4 in place of |skip_at|
// when that is later. Called by ending.c's Module00_Intro.
uint8 GameHook_TitleJaSkipAt(uint8 skip_at);

// Runs the intro's submodules 5 to 7 the Japanese way and returns true, or false to leave the US switch
// in Module00_Intro to run.
bool GameHook_TitleJaSubmodule(void);

// The subtitle plate (intro sprite subtype 1, an empty routine in the US cartridge): placed on its first
// frame, then drawn from the pack's layout. Called by ending.c's EXIT_0CCA90.
void GameHook_TitlePlate(int k);

// Writes the Japanese title's palettes over the US ones Overworld_LoadAllPalettes just loaded, for the
// intro and for the reload as the attract sequence ends. Called at the end of load_gfx.c's
// Overworld_LoadAllPalettes.
void GameHook_TitleJaPalettes(void);

// True when the attract sequence's first fade leaves the title still (the Japanese cartridge neither
// animates the triforce nor draws the sword there). Called by attract.c's Attract_Fade.
bool GameHook_TitleJaAttractStill(void);
