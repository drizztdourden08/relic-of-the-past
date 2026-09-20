/* @layer core-game-hooks @kind native */
// The game-over sequence's view surface: which geometry its frames take in a wide or tall view, and the
// iris widened past the 8-bit window registers. game_hooks.h includes it, so every caller sees these seams.
#ifndef GAME_HOOKS_GAME_OVER_VIEW_H
#define GAME_HOOKS_GAME_OVER_VIEW_H

#include "src/types.h"

// The module whose geometry describes what MODULE_GAME_OVER is drawn over: the one the player died in
// (MODULE_OVERWORLD, MODULE_DUNGEON or MODULE_OVERWORLD_SPECIAL_AREA). Any other module comes back
// unchanged, and so does the game-over one with the gate off, so the caller's branch selection is
// exactly what it was.
int GameHook_GameOverViewModule(int effectiveModule);

// True on the game-over frames drawn over the whole screen, from the iris closing until the revival fairy
// has lifted the player. They take the full side budget. Always false with the gate off.
bool GameHook_GameOverCoversScreen(void);

// Marks in |fixed| (128 slots) the sprites placed for the base frame while the camera lock shifts the scene
// behind them, which the renderer then leaves unshifted, and returns true when it marked any: the GAME OVER
// letters and the save menu cursor. False with the gate off, and |fixed| is left untouched.
bool GameHook_LockFixedSlots(uint8 *fixed);

// ─── Wide iris window (iris_wide.c) ───

// Record calls in IrisSpotlight_CalculateCircleValue / IrisSpotlight_ConfigureTable: the circle's span on
// the line being built, before the game clamps it to the 8-bit window registers, and the table lines that
// span was written to. They only record.
void GameHook_IrisCircleSpan(int left, int right);
void GameHook_IrisTableLines(uint16 upper_line, uint16 lower_line, uint16 word);
// The window edges for content row |row| (the one the pair HDMA just transferred draws), on a game-over
// frame covering the screen (gated): the unclamped span when the table still holds the circle the game
// built, else the pair the game wrote, both moved by the camera-lock shift so the circle follows the
// shifted scene. False on any other frame, and the renderer keeps the register values.
bool GameHook_IrisWideWindow(int row, int shift_x, int shift_y, int *left, int *right);

#endif  // GAME_HOOKS_GAME_OVER_VIEW_H
