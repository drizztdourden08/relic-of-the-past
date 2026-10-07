/* @layer core-game-hooks @kind native */
// The title screen drawn by the host: the native one kept off the picture (title_override.c) and the
// intro's clock frozen for the host to follow (title_mirror.c). Included from game_hooks.h.
#pragma once
#include <stdbool.h>

struct Ppu;

// Called by ZeldaDrawPpuFrame after the edge tiles are set. While the host draws the title itself
// (kFeatures2_TitleOverride and WasmSetTitleHidden), zeroes the layer enables, the fixed colour and
// the edge-tile layers the PPU holds for this frame's draw. Render-only: the WRAM shadows the NMI
// copies from are never touched, and the next NMI puts the copies back.
void GameHook_TitleMaskLayers(struct Ppu *ppu);

// True while the host asked for the hide, the gate allows it and the title is what the core shows.
bool TitleOverride_Hidden(void);

// Called at the end of Module00_Intro, every frame. Freezes the intro's counters into hook statics
// for WasmGetTitleFrame. Never touches WRAM.
void GameHook_TitleNoteFrame(void);

// Called at the end of Module14_Attract, every frame, so the mirror follows the module and the fade
// through the frames where the attract sequence still shows the title.
void GameHook_TitleNoteAttractFrame(void);

// Called at the start of Module00_Intro, every frame. On the host's title, a return to the intro
// past its rest (the story's end, a save-and-quit) starts the sequence over from its first frame.
void GameHook_TitleRestart(void);

// The submodule a press may leave the sequence from on the host's title, or 0 to keep the module's own
// skip rule (title_skip.c).
int GameHook_TitleSkipFloor(void);

// Called at the end of Module00_Intro, every frame. On the host's finished title, keeps the wait from
// running out, so the story never starts on its own.
void GameHook_TitleHoldWait(void);

// Called by Module00_Intro on the press its skip rule accepts. True when the press was taken here:
// the triangle animation ended early, a fade spent it, or the cancel button started the story. False
// hands the press back for the file select.
bool GameHook_TitleSkip(void);
