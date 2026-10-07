/* @layer core-game-hooks @kind native */
// A demand's payment, shown flying into the water. One shape per kind of demand:
//
//   rupees          the gem volley, the same one a rupee pond throw shows (pond_toss_draw.c);
//   bombs, arrows,  the amount as pickups, largest bundle first, through the same flying-gem
//   hearts          queue: 25 bombs are two bundles of ten, a bundle of three and two singles;
//   bottle          the bottle's content, one picture per bottle demanded;
//   item            the item itself, one picture, drawn by the vendored tossed-item ancilla
//                   (AncillaAdd_TossedPondItem), the one a wish pond throw already uses.
//
// A bundle's picture is its own receipt, so each size reads its own sheet and leaves in its own
// volley. The bottle and the item go through the vendored tossed-item routine, which handles the
// shield and blade pictures by re-decompressing the player's own gear from the tier they hold;
// the item never leaves the pack, so that is the gear already on screen.
//
// Everything reads the demand before the payment is taken: a bottle's content is gone from its
// slot once paid.
#include "game_hooks_internal.h"
#include "pond_toss.h"
#include "src/ancilla.h"

// The vendored tossed-item ancilla and its slot range, as the wish pond throw spawns it.
#define ANCILLA_TOSSED_ITEM 0x28
#define ANCILLA_TOSSED_ITEM_SLOT 4

typedef struct {
  uint8 size;
  uint8 receipt;
} Bundle;

static const Bundle kBombBundles[] = {{10, 0x31}, {3, 0x28}, {1, 0x27}};
static const Bundle kArrowBundles[] = {{10, 0x44}, {1, 0x43}};
static const Bundle kHeartBundles[] = {{1, 0x42}};

// A bottle slot value (3-7) and the picture its content throws as.
static const uint8 kBottleContentToss[][2] = {{3, 0x2E}, {4, 0x2F}, {5, 0x30}, {6, 0x3D}, {7, 0x3C}};
#define BOTTLE_CONTENT_COUNT ((int)(sizeof(kBottleContentToss) / sizeof(kBottleContentToss[0])))

// How many bottles a bottle demand asks for. A placement frozen before the count existed arms
// zero there, and one bottle is what it meant, so zero reads as one.
int PondDemandBottles(const PondDemand *demand) {
  return demand->amount > 0 ? demand->amount : 1;
}

// The bundles a counted demand is thrown as, or NULL for a kind that is not counted.
static const Bundle *BundlesOf(uint8 kind, int *count) {
  switch (kind) {
  case kPondDemand_Bombs: *count = 3; return kBombBundles;
  case kPondDemand_Arrows: *count = 2; return kArrowBundles;
  case kPondDemand_Hearts: *count = 1; return kHeartBundles;
  default: *count = 0; return NULL;
  }
}

// The picture one bottle of |content| throws as, or -1 for a content nothing draws.
static int BottlePictureOf(uint8 content) {
  for (int i = 0; i < BOTTLE_CONTENT_COUNT; i++) {
    if (kBottleContentToss[i][0] == content) return kBottleContentToss[i][1];
  }
  return -1;
}

// A counted amount as bundles, largest first, each under the key of its own sheet: queued when
// |queue| is set, only counted otherwise. Returns the volleys it makes.
static int BundleVolleys(const Bundle *bundles, int count, int amount, bool queue) {
  int left = amount, volleys = 0;
  if (queue) PondTossQueueClear();
  for (int i = 0; i < count; i++) {
    int n = left / bundles[i].size;
    left %= bundles[i].size;
    for (int j = 0; queue && j < n; j++) PondTossQueuePush(bundles[i].receipt, kReceiveItemGfx[bundles[i].receipt]);
    if (n > 0) volleys += PondTossVolleysOfRun(n);
  }
  return volleys > 0 ? volleys : 1;
}

int PondDemandVolleys(const PondDemand *demand) {
  if (demand->kind == kPondDemand_Rupees) return PondTossRupeeVolleys(demand->amount);
  // Every bottle shows the same picture, so they share one sheet and leave in one run.
  if (demand->kind == kPondDemand_Bottle) return PondTossVolleysOfRun(PondDemandBottles(demand));
  int count = 0;
  const Bundle *bundles = BundlesOf(demand->kind, &count);
  return bundles != NULL ? BundleVolleys(bundles, count, demand->amount, false) : 1;
}

bool PondDemandToss(const PondDemand *demand) {
  if (demand->kind == kPondDemand_Rupees) {
    PondTossQueueRupees(demand->amount);
    return PondTossQueueLaunch();
  }
  if (demand->kind == kPondDemand_Bottle) {
    int picture = BottlePictureOf(demand->native_id);
    if (picture < 0) return false;
    PondTossQueueClear();
    for (int i = PondDemandBottles(demand); i > 0; i--) {
      PondTossQueuePush((uint8)picture, kReceiveItemGfx[picture]);
    }
    return PondTossQueueLaunch();
  }
  int count = 0;
  const Bundle *bundles = BundlesOf(demand->kind, &count);
  if (bundles != NULL) {
    BundleVolleys(bundles, count, demand->amount, true);
    return PondTossQueueLaunch();
  }
  int picture = PondItemTossId(demand->native_id);
  if (picture < 0) return false;
  AncillaAdd_TossedPondItem(ANCILLA_TOSSED_ITEM, (uint8)picture, ANCILLA_TOSSED_ITEM_SLOT);
  return true;
}
