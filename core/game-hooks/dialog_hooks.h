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

// The whole of Text_ShouldSuppressDraw's answer, latched per message (dialog_suppress.c). |wanted| is
// what the settings ask for right now; the answer is what the message it belongs to must keep, so the
// box that was drawn is the box that gets torn down.
bool GameHook_DialogSuppressDraw(bool wanted);

// ─── Highlight spans (dialog_highlight.c, dialog_highlight_draw.c) ───
// The pseudo-command a highlight byte decodes to, one past the engine's own kTextCmd_* values.
enum { kDialogCmd_Highlight = 27 };
enum { kHighlightEnd = 0, kHighlightPrimary = 1, kHighlightSecondary = 2 };
enum { kHighlightTileRows = 6, kHighlightTileCols = 21 };
// Text_DecodeCmd asks this first: the packed command for a highlight byte at |a|, or 0 for any other
// byte and whenever the gate is down.
uint32 GameHook_DialogHighlightDecode(uint8 a, const uint8 *src);
// The character pump met a highlight command: the pen is now in span |kind| (kHighlightEnd closes).
void GameHook_DialogHighlightSet(uint8 kind);
// VWF_RenderSingle finished a glyph: a highlighted one takes the highlight index.
void GameHook_DialogGlyphDrawn(void);
// Text_DecodeCmd asks this second: the letter an extra-glyph escape draws (dialog_extra_glyphs.c), or 0
// for any other byte and whenever the gate is down.
uint32 GameHook_DialogExtraGlyphDecode(uint8 a, const uint8 *src);
// ZeldaDrawPpuFrame brackets its draw with these.
void GameHook_DialogHighlightDrawBegin(void);
void GameHook_DialogHighlightDrawEnd(void);
// For the mirror and the draw.
uint8 DialogHighlight_Kind(void);
bool DialogHighlight_Used(void);
uint16 DialogHighlight_Color(uint8 kind);
bool DialogHighlight_SecondaryTile(int row, int col);
void DialogHighlight_GlyphAt(uint8 line, uint8 x, uint8 w);
void DialogHighlight_Scrolled(void);
void DialogHighlight_Cleared(void);

#endif  // GAME_HOOKS_DIALOG_HOOKS_H
