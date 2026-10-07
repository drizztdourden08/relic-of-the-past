/* @layer core-game-hooks @kind native */
// What goes into the water when a pond is paid, shared by the files that fill the toss: the
// flying-gem queue (pond_toss_queue.c), the rupee decomposition (pond_toss_draw.c), the other
// currencies (pond_demand_toss.c) and the possession reads an item demand needs
// (pond_demand_items.c). Internal: only those files and pond_demand_visit.c include it, so the
// renderer-facing surface stays in pond_hooks.h and pond_demand_visit.h.
#ifndef GAME_HOOKS_POND_TOSS_H
#define GAME_HOOKS_POND_TOSS_H

#include "src/types.h"
#include "pond_demands.h"

// The pond's own flying-gem slots (the happiness_pond_* arrays are ten deep).
#define POND_GEM_SLOTS 10
// The most pictures one toss can queue, over the whole wallet range.
#define POND_GEM_MAX 48

// The queue (pond_toss_queue.c). A picture is a receipt id and the key of the sheet it is
// decoded from: pictures sharing a key leave together, at most a slot-full at a time, and the
// next run is spawned when the previous one has splashed.
void PondTossQueueClear(void);
void PondTossQueuePush(uint8 receipt, uint8 key);
int PondTossQueueCount(void);
int PondTossQueueSent(void);
// The ancilla, the throw pose, the sound and the first volley. False when the queue is empty.
bool PondTossQueueLaunch(void);
// The next volley, for the ancilla once its slots are spent. False when the queue is empty.
bool PondTossQueueNext(void);
// How many volleys |count| pictures sharing one key leave in.
int PondTossVolleysOfRun(int count);

// Rupees (pond_toss_draw.c): |amount| as gems into the queue, and the volleys that makes.
int PondTossQueueRupees(int amount);
int PondTossRupeeVolleys(int amount);

// The other currencies (pond_demand_toss.c): the payment of |demand| shown flying in, and the
// volleys it leaves in. Both read the demand before anything is taken. PondDemandBottles is how
// many bottles a bottle demand asks for, which is what the test, the take and the toss all
// count; an amount of zero is a placement frozen before the count existed and means one.
bool PondDemandToss(const PondDemand *demand);
int PondDemandVolleys(const PondDemand *demand);
int PondDemandBottles(const PondDemand *demand);

// Possession (pond_demand_items.c): whether the player holds the item receive id |id| names,
// and the receipt id its toss shows (-1 when the id names nothing the player can hold).
bool PondItemHeld(uint8 id);
int PondItemTossId(uint8 id);

#endif  // GAME_HOOKS_POND_TOSS_H
