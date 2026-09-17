/* @layer core-game-hooks @kind native */
// The demand visit both pond handlers share (pond_demand_visit.c): what a planned pond asks for
// its next rung, whether the player can pay, and the payment thrown into the water. game_hooks.h
// includes it beside pond_hooks.h and wish_pond_hooks.h, whose seams call into it.
//
// A rung ASKS when the demand table (pond_demands.h) holds a demand for it, with one exception
// kept for compatibility: a rupee demand at the rupee pond is that throw's own price, so the
// rupee pond's own purchase flow charges it exactly as it always has. Every read here is false,
// -1 or |vanilla| back when no rung asks, so neither handler changes for a rung that does not.
#ifndef GAME_HOOKS_POND_DEMAND_VISIT_H
#define GAME_HOOKS_POND_DEMAND_VISIT_H

#include "src/types.h"

//   GameHook_PondTossOwned        a planned pond owns the visit, so the toss seams answer.
//   GameHook_PondVisitAsks        the rung about to be handed over asks for a demand.
//   GameHook_PondVisitQuestion    the yes/no line naming it, or |vanilla| with none composed.
//   GameHook_PondVisitCanPay      the player can pay it right now. Pure.
//   GameHook_PondVisitRefusal     the line for a yes that cannot pay, or |vanilla|.
//   GameHook_PondVisitTossDelay   how long the handler waits for the payment to land.
//   GameHook_PondVisitPay         take the payment and throw it in. An item is only thrown.
//   GameHook_PondVisitAwardMessage  the line she rises with, or |fallback|.
bool GameHook_PondTossOwned(void);
bool GameHook_PondVisitAsks(void);
int GameHook_PondVisitQuestion(int vanilla);
bool GameHook_PondVisitCanPay(void);
int GameHook_PondVisitRefusal(int vanilla);
int GameHook_PondVisitTossDelay(int vanilla);
bool GameHook_PondVisitPay(void);
int GameHook_PondVisitAwardMessage(int fallback);

// The rupee pond's payment seam (ai state 3): a rung that asks is paid and thrown here, any
// other throw shows its |rupees| as gems (GameHook_PondTossRupees). False sends the handler to
// the vendored five-rupee spawn, which only happens with no plan open.
bool GameHook_PondTossPayment(int rupees);

#endif  // GAME_HOOKS_POND_DEMAND_VISIT_H
