/* @layer core-game-hooks @kind native */
// The gems a throw sends into the pond, showing the amount that was actually paid.
//
// Vanilla only ever charges 5, 20, 25 or 50 and spawns that many five-rupee gems, all
// out of one decoded sheet. A plan can charge any amount, so the toss decomposes it
// greedily over the six denominations (300, 100, 50, 20, 5, 1) largest first: 300 is
// one gold gem, 427 is one gold, one silver, one red, one blue and two greens.
//
// Only one sprite sheet is decoded at a time, so gems needing different sheets cannot be in
// the air together: the gems go into the shared queue (pond_toss_queue.c) under the key of the
// sheet each one reads, and leave in volleys of gems sharing a key.
//
// Every slot carries its own denomination's receipt, and it is that id the draw reads its
// picture and its OAM palette row from, so a volley is mixed by construction.
//
// Presentation, per gem:
//   coloured rupees OFF: it draws under its own numbered picture, which each large value
//     has to itself, so it needs a volley to itself; the three small values share a sheet
//     and fly together;
//   coloured rupees ON:  the one gem sheet is decoded and pond_gem_tiles.c gives the draw a
//     picture and a row per denomination out of it, so every value shares a decode key and
//     the whole amount goes into the water in a single volley.
//
// Gate: kFeatures3_PondPlan, checked through GameHook_PondPlanOpen. Off, this spawns
// nothing and the vendored AddHappinessPondRupees runs byte-for-byte as before.
#include "game_hooks_internal.h"
#include "pond_toss.h"

// The six denominations, largest first, with the receipt id carrying each one's art and
// the key that says which of them can share a decoded sheet.
typedef struct { int16 value; uint8 receipt; uint8 decode_key; } RupeeGem;
static const RupeeGem kRupeeGems[] = {
  {300, 0x46, 3},  // gold
  {100, 0x40, 2},  // silver
  {50, 0x41, 1},   // violet
  {20, 0x36, 0},   // red: the three small values share one sheet
  {5, 0x35, 0},    // blue
  {1, 0x34, 0},    // green
};
#define RUPEE_GEM_COUNT ((int)(sizeof(kRupeeGems) / sizeof(kRupeeGems[0])))

// The sheet a gem of |receipt| is decoded from, as a key gems sharing it can be grouped by.
// With coloured rupees on every denomination reads the ONE decoded gem sheet, differing by
// the picture and the row pond_gem_tiles.c hands the draw, so they all share a key and one
// volley carries the lot. Off, each large value has its own numbered picture and its own key.
static uint8 DecodeKeyOf(const RupeeGem *gem) {
  return (enhanced_features3 & kFeatures3_ColoredRupees) ? 0 : gem->decode_key;
}

// |amount| as gems, largest first, into the queue. Returns how many it took.
int PondTossQueueRupees(int amount) {
  int left = amount > 0 ? amount : 0;
  PondTossQueueClear();
  for (int i = 0; i < RUPEE_GEM_COUNT && PondTossQueueCount() < POND_GEM_MAX; i++) {
    while (left >= kRupeeGems[i].value && PondTossQueueCount() < POND_GEM_MAX) {
      PondTossQueuePush(kRupeeGems[i].receipt, DecodeKeyOf(&kRupeeGems[i]));
      left -= kRupeeGems[i].value;
    }
  }
  return PondTossQueueCount();
}

/**
 * The receipt id of gem |index| of the decomposition of |amount|, largest first, or -1
 * past the last gem. Pure: no queue, no spawn, so the probe harness can pin the same
 * decomposition the toss uses without a pond in front of it.
 */
int GameHook_PondGemAt(int amount, int index) {
  int left = amount > 0 ? amount : 0, at = 0;
  for (int i = 0; i < RUPEE_GEM_COUNT; i++) {
    int n = left / kRupeeGems[i].value;
    left %= kRupeeGems[i].value;
    if (index < at + n) return kRupeeGems[i].receipt;
    at += n;
  }
  return -1;
}

/**
 * Queue |amount| and send volleys up to and including |volley|, filling the pond's slots
 * exactly as a toss does but without the ancilla, the sound or the player's throw pose:
 * what a headless harness calls before reading the receipt each slot carries back out of
 * WRAM. Returns the gems that volley spawned, or -1 when the amount has no such volley.
 */
int GameHook_PondSpawnVolley(int amount, int volley) {
  PondTossQueueRupees(amount);
  int spawned = -1;
  for (int i = 0; i <= volley; i++) {
    int before = PondTossQueueSent();
    if (!PondTossQueueNext()) return -1;
    spawned = PondTossQueueSent() - before;
  }
  return spawned;
}

/**
 * The rupee spawn (ai state 3 under a plan): show |amount| as the gems that add up to it. False
 * when no plan is open, so the vendored five-rupee spawn runs instead. Reached through the
 * payment seam, GameHook_PondTossPayment (pond_demand_visit.c).
 */
bool GameHook_PondTossRupees(int amount) {
  if (!GameHook_PondPlanOpen()) return false;
  PondTossQueueRupees(amount);
  if (!PondTossQueueLaunch()) return true;
  printf("[Randomizer] Pond toss: %d rupees as %d gems\n", amount, PondTossQueueCount());
  return true;
}

// How many volleys |amount| leaves in: one per run of gems sharing a decode key, split
// again whenever a run outgrows the pond's slots. Counted without touching the queue,
// because the delay is set before the toss is armed.
int PondTossRupeeVolleys(int amount) {
  int left = amount > 0 ? amount : 0, volleys = 0, small = 0;
  for (int i = 0; i < RUPEE_GEM_COUNT; i++) {
    int n = left / kRupeeGems[i].value;
    left %= kRupeeGems[i].value;
    // The values sharing a sheet add up into one run of their own.
    if (DecodeKeyOf(&kRupeeGems[i]) == 0) small += n;
    else if (n > 0) volleys += PondTossVolleysOfRun(n);
  }
  if (small > 0) volleys += PondTossVolleysOfRun(small);
  return volleys > 0 ? volleys : 1;
}

// How long the purchase state waits before the fairy rises: long enough for every volley
// to land. |vanilla| back when no plan is open, and the wait is capped at the byte the
// vendored delay field holds. A throw paid in something else waits on its own volleys.
int GameHook_PondTossDelay(int vanilla) {
  if (!GameHook_PondPlanOpen()) return vanilla;
  if (GameHook_PondVisitAsks()) return GameHook_PondVisitTossDelay(vanilla);
  int frames = vanilla * PondTossRupeeVolleys(GameHook_PondThrowAmount(0));
  return frames > 255 ? 255 : frames;
}
