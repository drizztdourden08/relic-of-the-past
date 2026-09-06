/* @layer core-game-hooks @kind native */
// The symbol a randomized shelf draws beside its price, naming what the price counts.
// Split out of shop_draw.c so the shelf picture stays about the shelf: this file owns
// the host-supplied strips and nothing else.
#ifndef GAME_HOOKS_SHOP_SYMBOLS_H
#define GAME_HOOKS_SHOP_SYMBOLS_H

#include "src/types.h"

#define SHOP_SYMBOL_NONE (-1)

// The symbol a price of |amount| in |currency| shows, or SHOP_SYMBOL_NONE for a value
// no symbol covers. Pure lookup.
int ShopSymbolOf(uint8 currency, uint16 amount);

// Where symbol |id|'s drawing sits inside its 16x8 strip: the first column it paints,
// its width in pixels, and the 8x8 tiles a draw spends on it. All 0 while no file is
// loaded or for SHOP_SYMBOL_NONE, so a caller can lay the price out with no symbol.
typedef struct {
  int left;
  int width;
  int tiles;
} ShopSymbolShape;
ShopSymbolShape ShopSymbolShapeOf(int id);

// Draws symbol |id| with the strip's left edge at (|x|, |y|) into |oam|, one 8x8 entry
// per tile, |priority| the sprite's own OAM flags (only the priority bits are kept).
// Returns the entries written: 0 when nothing is drawn, else the shape's tiles.
int ShopDrawSymbol(OamEnt *oam, int id, int x, int y, uint8 priority);

#endif  // GAME_HOOKS_SHOP_SYMBOLS_H
