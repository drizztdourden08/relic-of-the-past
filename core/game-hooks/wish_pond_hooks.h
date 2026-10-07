/* @layer core-game-hooks @kind native */
// The two item-throwing waters' whole hook surface, pulled out of game_hooks.h the way
// pond_hooks.h and shop_payment.h are: one subject, one header, and game_hooks.h includes it
// so every caller sees the seams.
//
// Both waters run one vendored handler (Sprite_WishPond3). Under a plan a pond holds a
// numbered LADDER of rungs, and each visit hands over the next rung: with no throw and no
// question when the rung asks for nothing, after the shared demand visit
// (pond_demand_visit.h) when it does. A spent pond shows its closing line and nothing else. Every hook here answers
// to kFeatures4_WishPondPlan and to a rung table being armed; with either missing each one
// hands back exactly the value the vendored expression already computed.
//
// The host fills a water's rung table one rung at a time (WasmArmWishPondPlan), sets its two
// lines (WasmSetWishPondLines) and empties both waters with WasmClearWishPondPlan. What each
// rung asks for is the shared pond demand table (pond_demands.h), keyed by the pond.
//
// Either line may be -1, and a beat then falls back to a vendored line instead of showing
// nothing: the box is what holds the handler between beats (wish_pond_visit.c).
#ifndef GAME_HOOKS_WISH_POND_HOOKS_H
#define GAME_HOOKS_WISH_POND_HOOKS_H

#include "src/types.h"

// The plan (wish_pond_plan.c):
//   GameHook_WishPondHere              which pond the player is standing in, or -1.
//   GameHook_WishPondPlanOpen          true while a plan owns this pond, spent or not.
//   GameHook_WishPondRungIndex         the rung about to be handed over, or -1.
//   GameHook_WishPondTakeRung          take that rung and advance the counter.
//   GameHook_WishPondAwardMessage      the host line she says when she rises, or -1.
//   GameHook_WishPondClosedMessage     the host line a spent pond shows, or -1.
//   GameHook_WishPondRungInFlight      read side for npc_overrides.c: a planned rung's reward
//                                      is crossing the receive seam.
//   GameHook_WishPondClearRungInFlight drop that mark before the next pond grant.
//   GameHook_WishPondThrowsTaken       the raw counter of pond |pond|.
int GameHook_WishPondHere(void);
bool GameHook_WishPondPlanOpen(void);
int GameHook_WishPondRungIndex(void);
bool GameHook_WishPondTakeRung(int *new_item, int *msg, bool *assigned);
int GameHook_WishPondAwardMessage(void);
int GameHook_WishPondClosedMessage(void);
bool GameHook_WishPondRungInFlight(void);
void GameHook_WishPondClearRungInFlight(void);
uint8 GameHook_WishPondThrowsTaken(int pond);

// The handler seams (wish_pond_visit.c), in the order a planned visit meets them:
//   GameHook_WishPondContact        ai state 0: ask for the rung's demand, skip the contact line
//                                   and go to the rise, or show the closing line of a spent pond.
//   GameHook_WishPondAnswer         ai state 1: a yes to the demand, refused or paid and thrown.
//   GameHook_WishPondRiseLine       ai state 4: the award line in place of the question.
//   GameHook_WishPondHidesHeldItem  WishPond2_Draw: nothing was thrown, so nothing is held up.
//   GameHook_WishPondPlanTakes      ai state 6: skip the branch list.
//   GameHook_WishPondGrant          ai state 9: hand over this visit's one rung.
bool GameHook_WishPondContact(int k);
bool GameHook_WishPondAnswer(int k);
bool GameHook_WishPondRiseLine(void);
bool GameHook_WishPondHidesHeldItem(int k);
bool GameHook_WishPondPlanTakes(int k);
bool GameHook_WishPondGrant(int k);

#endif  // GAME_HOOKS_WISH_POND_HOOKS_H
