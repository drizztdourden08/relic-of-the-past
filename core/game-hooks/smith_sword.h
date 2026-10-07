/* @layer core-game-hooks @kind native */
// The sword the smiths keep while they temper it (smith_sword.c). Included from game_hooks.h,
// so the smith's vendored call sites see it through the one hook header.
#ifndef GAME_HOOKS_SMITH_SWORD_H
#define GAME_HOOKS_SMITH_SWORD_H

#include "src/types.h"

void GameHook_SmithTakesSword(void);
void GameHook_SmithReturnsSword(void);
uint8 GameHook_SwordLevelOwned(void);
uint8 GameHook_SwordAtSmithsRecord(void);

#endif  // GAME_HOOKS_SMITH_SWORD_H
