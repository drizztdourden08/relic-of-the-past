/* @layer core-game-hooks @kind native */
// The opening story's view surface: how far past the base picture each of its scenes may be shown.
// game_hooks.h includes it, so ConfigurePpuSideSpace sees the seam.
#ifndef GAME_HOOKS_ATTRACT_VIEW_H
#define GAME_HOOKS_ATTRACT_VIEW_H

#include "src/types.h"

// The side budgets for the frame the opening story is drawing, written to the four outputs, measured
// from what the layers hold this frame. True when it described the frame. False on every other module,
// with the gate off, and on the frames that still show the title screen the story was entered from, so
// the caller keeps the fixed frame it has always given those.
bool GameHook_AttractViewBudget(int *left, int *right, int *top, int *bottom);

// True while the frame's window registers carry an effect the picture's own lines describe, so the rows
// above the picture must hold that effect instead of having the window opened across them.
bool GameHook_HdmaBandHoldsFirstLine(void);

#endif  // GAME_HOOKS_ATTRACT_VIEW_H
