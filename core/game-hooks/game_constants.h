/* @layer core-game-hooks @kind native */
#ifndef GAME_CONSTANTS_H
#define GAME_CONSTANTS_H

// ─── Named game constants shared across the hook layer ───
//
// These replace magic numbers that previously lived only in comments. Both the
// game-hooks TUs and the wasm-build TUs include this (the build adds
// `-I ../game-hooks`), so the meaning of a value is defined once.

// main_module_index values (the engine's top-level game mode).
#define MODULE_DUNGEON          7   // indoor gameplay (house / cave / palace)
#define MODULE_OVERWORLD        9   // outdoor gameplay
#define MODULE_MENU             14  // text / inventory / map overlay
#define MODULE_SPOTLIGHT_CLOSE  15  // transient spotlight (iris closing)
#define MODULE_SPOTLIGHT_OPEN   16  // transient spotlight (iris opening)
#define MODULE_FALLING_ENTRANCE 11  // dungeon pit-fall transition — also reused, unchanged, by
                                    // Overworld_CheckSpecialSwitchArea for the 3 vanilla overworld
                                    // locations reached by walking onto a switch tile. Interactive
                                    // gameplay resumes normally in that flavor even though the module
                                    // never returns to 9 — see GameHook_IsOverworldSpecialArea, the only
                                    // reliable way to tell it apart from an actual, non-interactive
                                    // pit-fall into a dungeon room.
#define OVERWORLD_SPECIAL_AREA_SCREEN_MIN 128  // overworld_screen_index floor for the flavor above —
                                                // real overworld screens (light or dark world) are 0-127.

// Sprite type ids referenced by hook branching logic.
#define SPRITE_UNCLE_PRIEST     0x73  // Uncle (sprite_E == 0) / Priest family

// Haptic event types emitted to JS via window.__onHapticEvent.
// MUST match HapticEventType in haptics.ts.
#define HAPTIC_SWORD_SWING      0
#define HAPTIC_SWORD_HIT_ENEMY  1
#define HAPTIC_SWORD_CLINK      2
#define HAPTIC_DAMAGE_TAKEN     3
#define HAPTIC_ITEM_USED        4
#define HAPTIC_ENVIRONMENTAL    5
#define HAPTIC_HOOKSHOT_WALL    6
#define HAPTIC_BOOMERANG_CATCH  7

#endif // GAME_CONSTANTS_H
