/* @layer core-game-hooks @kind native */
// How far the opening circle grows, and how fast. game_hooks.h includes it so the table builder in the
// vendored transition code can ask.
#ifndef GAME_HOOKS_SPOTLIGHT_GROWTH_H
#define GAME_HOOKS_SPOTLIGHT_GROWTH_H

#include "src/types.h"

// The size the circle grows to and the step it takes each frame, for a view larger than the original
// picture. Writes the stock pair and returns false with the corrections off, on a circle that is closing
// instead of opening, and on the partial opening that never covered the screen to begin with.
bool GameHook_SpotlightGrowth(int base_delta, int base_goal, int current, int *delta, int *goal);

#endif  // GAME_HOOKS_SPOTLIGHT_GROWTH_H
