/* @layer core-game-hooks @kind native */
// The text engine's hook surface: the pacing that runs its steps and the observers that let the
// host draw the message box itself. game_hooks.h includes it, so every caller sees these seams.
#ifndef GAME_HOOKS_DIALOG_HOOKS_H
#define GAME_HOOKS_DIALOG_HOOKS_H

#include "src/types.h"

// RenderText hands over its one engine step; the hook runs it once (gate off) or as many times as the
// pacing settings ask this frame, stopping at any key wait or when the box closes.
void GameHook_DialogRender(void (*step)(void));

// Whether a [Speed 00] line types one glyph per engine step instead of a whole line (dialog_pacing.c).
bool GameHook_DialogTypewriter(void);

// Walks the message just loaded into messaging_text_buffer with the engine's own decoder and records
// the widest row and the most rows it will ever show, so the host can size a box once per message
// (dialog_mirror.c). Called right after GameHook_DialogCleared.
void GameHook_DialogMeasure(void);

// Observers of the text engine, so the host can draw the box itself. All no-ops unless the host may
// hide the native box (kFeatures3_HudOverride) or pace it (kFeatures3_DialogControls).
// A glyph |c| of width |w| px was drawn on visible row |line| (0..2) at pen x |x| px.
void GameHook_DialogGlyph(uint8 c, uint8 line, uint8 x, uint8 w);
// A [Scroll] finished: every row moved up one.
void GameHook_DialogScrolled(void);
// A message started: the glyph bitmap was cleared and the parsed buffer loaded.
void GameHook_DialogCleared(void);
// The character pump decoded command |cmd| (the engine's kTextCmd_* value).
void GameHook_DialogCommand(uint8 cmd);
// True while the native box must stay off VRAM. Text_ShouldSuppressDraw ORs this in.
bool GameHook_DialogNativeHidden(void);

#endif  // GAME_HOOKS_DIALOG_HOOKS_H
