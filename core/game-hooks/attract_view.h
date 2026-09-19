/* @layer core-game-hooks @kind native */
// The opening story's view surface: how far past the base picture each of its scenes may be shown.
// game_hooks.h includes it, so ConfigurePpuSideSpace sees the seam.
#ifndef GAME_HOOKS_ATTRACT_VIEW_H
#define GAME_HOOKS_ATTRACT_VIEW_H

#include "src/types.h"

// True on the frames the opening story's corrections own: its module, with the widescreen visual fixes
// on. Every one of them asks this first, so the gate is stated once.
bool GameHook_AttractCorrections(void);

// The side budgets for the frame the opening story is drawing, written to the four outputs, measured
// from what the layers hold this frame. True when it described the frame. False on every other module,
// with the gate off, and on the frames that still show the title screen the story was entered from, so
// the caller keeps the fixed frame it has always given those.
bool GameHook_AttractViewBudget(int *left, int *right, int *top, int *bottom);

// True while the frame's window registers carry an effect the picture's own lines describe, so the rows
// above the picture must hold that effect instead of having the window opened across them.
bool GameHook_HdmaBandHoldsFirstLine(void);

// True while the story's module is up and the frame still shows the title screen it was entered from,
// so the space around that picture keeps the fill module 0 gave it (fixed_picture_edges.c).
bool GameHook_AttractStillOnTitle(void);

// ─── The story's own sprites (attract_sprites.c) ───

// The full draw origin of the sprite set about to be written, recorded where the scene computes it.
// attract_x_base and attract_y_base are bytes, so a set placed above the picture or left of it keeps
// only the truncated pair and nothing downstream can recover the sign. Cleared by the end of that set,
// so a set whose scene records no origin keeps exactly the bytes SetOamPlain wrote.
void GameHook_AttractDrawOrigin(int x, int y);
void GameHook_AttractDrawEnd(void);

// One entry of the recorded set, |dx| and |dy| from that origin: the coordinate again in the form a wide
// or tall view reads. Leaves the entry alone when no origin stands or that view is not configured.
void GameHook_AttractOamEntry(OamEnt *oam, int dx, int dy);

// True while a sprite the throne room is about to draw is above the picture but inside the rows a tall
// view draws, so the scene's own 4:3 hand-over point reaches far enough up for it.
bool GameHook_AttractSpriteEntersFromAbove(int y);

// True while the escort the prison walks off to the left is still inside the rendered picture, so the
// scene keeps drawing it past the countdown that cut it at the 4:3 edge.
bool GameHook_AttractEscortInView(int base);

#endif  // GAME_HOOKS_ATTRACT_VIEW_H
