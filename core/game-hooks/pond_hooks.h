/* @layer core-game-hooks @kind native */
// The rupee pond's whole hook surface, pulled out of game_hooks.h the way icon_overlays.h
// and shop_payment.h are: one subject, one header, and game_hooks.h includes it so every
// caller that already had the pond seams still sees them.
//
// Under a plan the pond sells a numbered sequence of throws instead of its native purchase
// loop. Every hook here answers to kFeatures3_PondPlan and, with the gate down or nothing
// armed, hands back exactly the value the vendored expression already computed.
#ifndef GAME_HOOKS_POND_HOOKS_H
#define GAME_HOOKS_POND_HOOKS_H

#include "src/types.h"

// The plan (pond_plan.c):
//   GameHook_PondPlanOpen        true while a plan owns the pond.
//   GameHook_PondThrowIndex      the throw about to be paid for, or -1.
//   GameHook_PondPromptOverride  cost-prompt seam: the plan announced its own price, so
//                                the vanilla two-choice line is skipped.
//   GameHook_PondCostDigits      the digits that vanilla line quotes when it does run: the
//                                plan's price, not the two native amounts it charges for.
//   GameHook_PondChoiceOverride  award seam: a throw carrying a pool item announces it,
//                                and whether the water still holds one, in one box, in
//                                place of the vanilla capacity question.
//   GameHook_PondHoldPlayer      wrap-up seam: hold the player still through the palette
//                                fade, which only the purchase's own last state undoes.
//   GameHook_PondThrowCost       affordability seam: what this throw costs (an exhausted
//                                pond names a price no wallet holds, closing it).
//   GameHook_PondLaterMessage    refusal seam: an exhausted pond's own closing line; a
//                                wallet too light for the price keeps the vanilla one.
//   GameHook_PondThrowAmount     payment seam: the rupees actually taken and shown.
//   GameHook_PondPoolAdd         what the throw puts in the pond's own bank.
//   GameHook_PondTakeThrow       resolve the paid throw and advance the counter.
//   GameHook_PondAwardMessage    the award line that throw would show, without resolving
//                                it: the "more to come" one or the "that was the last" one.
//   GameHook_PondConsolationMessage  that throw's consolation line, without resolving it.
//   GameHook_PondPrizeSlot       the grant armed for one prize ordinal.
//   GameHook_PondThrowsTaken     the raw counter, for the progress buffer and the probes.
bool GameHook_PondPlanOpen(void);
int GameHook_PondThrowIndex(void);
bool GameHook_PondPromptOverride(void);
int GameHook_PondCostDigits(int vanilla);
bool GameHook_PondChoiceOverride(void);
void GameHook_PondHoldPlayer(void);
int GameHook_PondThrowCost(int vanilla);
int GameHook_PondLaterMessage(int vanilla);
int GameHook_PondThrowAmount(int stored);
int GameHook_PondPoolAdd(int amount);
bool GameHook_PondTakeThrow(int *prize, int *refund, int *msg);
int GameHook_PondAwardMessage(void);
int GameHook_PondConsolationMessage(void);
bool GameHook_PondPrizeSlot(int prize, int *new_item, int *msg, int *fire_id);
uint8 GameHook_PondThrowsTaken(void);

// The gems a plan throw sends into the pond (pond_toss_draw.c): the amount decomposed over
// the six denominations and spawned in volleys, one decoded sheet at a time, each gem
// under its own denomination's receipt so a volley shows every colour it carries.
// GameHook_PondTossRupees is false with no plan open, so the vendored five-rupee spawn
// runs instead; GameHook_PondTossNextVolley refills the pond's slots with the next volley
// when they are all spent, and GameHook_PondTossDelay stretches the purchase wait to cover
// them.
bool GameHook_PondTossRupees(int amount);
bool GameHook_PondTossNextVolley(void);
int GameHook_PondTossDelay(int vanilla);

// The receipt id of gem |index| of |amount|'s decomposition, largest first; -1 past the
// last gem. Pure. The probe harness pins the decomposition through it.
int GameHook_PondGemAt(int amount, int index);

// Fill the pond's slots with volley |volley| of |amount|, without the ancilla or the
// player's throw pose: the probe harness reads the receipts back out of WRAM. Returns the
// gems that volley spawned, or -1 when the amount has no such volley.
int GameHook_PondSpawnVolley(int amount, int volley);

#endif  // GAME_HOOKS_POND_HOOKS_H
