/* @layer core-game-hooks @kind native */
// The demand table every planned pond reads (pond_demands.c): one demand per rung, keyed by
// the pond and the rung's place in that pond's prize list. game_hooks.h includes it next to
// pond_hooks.h and wish_pond_hooks.h, the two plans that read it.
//
// The host empties it with WasmClearPondDemands and fills it one rung at a time with
// WasmArmPondDemand and WasmSetPondDemandLines. Host-armed session state only, never save bytes.
#ifndef GAME_HOOKS_POND_DEMANDS_H
#define GAME_HOOKS_POND_DEMANDS_H

#include "src/types.h"

// The three ponds, in the order the host's pond instances list them. A wish pond's own index in
// wish_pond_plan.c (0 the light world's water, 1 the dark world's) is one less than its key here.
enum {
  kPondDemandPond_Capacity = 0,
  kPondDemandPond_Wishing = 1,
  kPondDemandPond_Cursed = 2,
};
#define POND_DEMAND_PONDS 3
// The longest prize list any pond carries: POND_MAX_PRIZES and WISH_POND_MAX_RUNGS are both 20.
#define POND_DEMAND_RUNGS 20

// The kinds are the shelf currency tags of shop_payment.h plus one, so none is zero, and item is
// the one kind a shelf has no tag for:
//   kind      amount                     native_id
//   none      0                          0
//   rupees    rupees                     0
//   arrows    arrows                     0
//   bombs     bombs                      0
//   hearts    whole hearts               0
//   bottle    how many bottles of it      the bottle-slot value demanded (3-7)
//   item      0                          the receive id of the item to show, as a grant of
//                                        that name carries it (a progressive family's virtual id)
//
// A rupee demand at the rupee pond is the price of the throw that carries that prize, rolled
// from the same schedule, so charging the table there asks exactly what the throw asks today.
enum {
  kPondDemand_None = 0,
  kPondDemand_Rupees = 1,
  kPondDemand_Arrows = 2,
  kPondDemand_Bombs = 3,
  kPondDemand_Hearts = 4,
  kPondDemand_Bottle = 5,
  kPondDemand_Item = 6,
};

typedef struct {
  uint8 kind;
  uint8 native_id;
  uint16 amount;
} PondDemand;

// The three host lines of one demand rung, each a pre-rendered message id or -1 for none:
//   ask     the yes/no question that names the demand;
//   refuse  the line for a player who said yes and cannot pay: what she wants, come back with it;
//   award   the line she says when she rises, in place of the pond's own award line.
typedef struct {
  int16 ask;
  int16 refuse;
  int16 award;
} PondDemandLines;

// Raw read of one rung's demand; false when it has none.
bool GameHook_PondDemand(int pond, int rung, PondDemand *out);

// Raw read of one rung's lines; every field -1 when the host armed none.
void GameHook_PondDemandLines(int pond, int rung, PondDemandLines *out);

#endif  // GAME_HOOKS_POND_DEMANDS_H
