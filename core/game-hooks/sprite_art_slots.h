/* @layer core-game-hooks @kind native */
// A private tile block per substituted world sprite, so two of them on screen at once can
// show two different items, and a tile row per shown price symbol. See sprite_art_slots.c
// for why the shared decode slot cannot.
#ifndef GAME_HOOKS_SPRITE_ART_SLOTS_H
#define GAME_HOOKS_SPRITE_ART_SLOTS_H

#include "src/types.h"

// Charnum of the shared animated-tile decode slot, and the step from a block's top tile
// row to its bottom one (the sprite page is 16 tiles wide).
#define SPRITE_ART_SHARED_CHAR 0x24
#define SPRITE_ART_ROW_STRIDE 0x10
// One finished picture: the block's two rows of two 32 B tiles, top row first.
#define SPRITE_ART_BYTES 128

// The charnum sprite |k| draws its receipt art with this frame: its own block, or the
// shared slot when every block is taken. Claimed once per sprite per frame.
uint8 GameHook_ClaimSpriteArt(int k);

// Copies the finished picture out of the shared decode slot into |k|'s block. Called by
// each draw seam once nothing else will repaint the slot, after the capacity icon and
// the glint: the same point their own comments call "the last write before the upload".
void GameHook_CommitSpriteArt(int k);
// The same commit from a picture the caller kept (SPRITE_ART_BYTES, the slot's own
// order), for a frame in which the slot itself may not be read.
void GameHook_CommitSpriteArtBytes(int k, const uint8 *art);

// The charnum of the left tile of a 16x8 strip holding |tiles| (64 B: the left tile, then
// the right), lent to the picture |id| names for this frame; a second claim of the same
// id this frame answers the same row. 0 when every row is taken, in which case the
// caller draws nothing (charnum 0 is never a lent row).
uint8 GameHook_ClaimArtStrip(int id, const uint8 *tiles);

// Frame end: every committed row goes to its tiles, every released one gets the tiles
// it borrowed put back, and the claims are dropped for the next frame.
void GameHook_SpriteArtFrameEnd(void);

#endif  // GAME_HOOKS_SPRITE_ART_SLOTS_H
