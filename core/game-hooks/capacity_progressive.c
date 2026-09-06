/* @layer core-game-hooks @kind native */
// Virtual receive ids for the PROGRESSIVE capacity items: one id per family, 0x77-0x7A
// (capacity_tiers.h), above the wallet slots. A fixed-jump id (0x50-0x61, 0x67-0x76)
// carries its jump; a progressive id carries none — the pool holds N identical copies per
// family and every pickup climbs to the NEXT rung of the plan the host armed for the
// session, in plan order, whatever the shuffle did with the copies. The plan is the
// family's jump sequence (WasmSetCapacityPlanJump: entry k = the k-th pickup's rungs, plus
// the message id of that rung's pre-rendered receipt line, or -1), never persisted and
// rebuilt at every session start like the wallet jump table.
//
// The rung a pickup lands on is derived from the save bytes alone (capacity_profile.c
// owns them: tier byte + empty-rung flag, the wallet's ladder index): the pickup index k
// is the number of planned rungs already at or below the rung the family stands on, so
// the climb is to cumulative rung k+1 — a save that moved off-plan (a locked pond's native
// step) simply lands on the next planned rung ahead of it. Past the last planned rung the
// pickup is surplus and presents exactly like the fixed-jump path: the pond consolation
// for the counted families, the maxed meter's refill, the wallet's twenty-rupee
// replacement.
//
// Gate: kFeatures3_CapacityProfile through the profile owner (a family that is not Custom
// under the gate has no starting rung to plan from) and, like every virtual family, the
// grant seams (GrantSeamOpen). Without an armed plan a progressive id degrades to the
// family's one-rung fixed item, so the vanilla arithmetic is what runs; gate off, no
// virtual id ever reaches vendored code.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"

#define PLAN_FAMILY_COUNT 4
#define PLAN_MAX_JUMPS WALLET_LADDER_LAST
// Fifty rupees while the wallet still climbs; the reference's replacement past the cap.
#define WALLET_STEP_ITEM 0x41
#define WALLET_SURPLUS_ITEM 0x36

enum { kFamily_Explosives, kFamily_Projectiles, kFamily_Meter, kFamily_Wallet };

// The receipt item each family presents as (upgrade_icon.c binds its icon to the same).
static const uint8 kFamilyPresentation[PLAN_FAMILY_COUNT] = {0x31, 0x44, 0x45, WALLET_STEP_ITEM};
// The family's one-rung fixed id: what a progressive id degrades to without an armed plan.
static const uint8 kFamilyFallbackId[PLAN_FAMILY_COUNT] = {0x50, 0x58, 0x60, 0x67};

static struct {
  uint8 count;
  uint8 jumps[PLAN_MAX_JUMPS];
  int16 msgs[PLAN_MAX_JUMPS];
} g_plan[PLAN_FAMILY_COUNT];

bool GameHook_IsProgressiveCapacityId(uint8 item) {
  return item >= PROGRESSIVE_CAPACITY_VIRT_FIRST && item <= PROGRESSIVE_CAPACITY_VIRT_LAST;
}

int GameHook_ProgressiveCapacityFamilyOf(uint8 item) {
  return GameHook_IsProgressiveCapacityId(item) ? item - PROGRESSIVE_CAPACITY_VIRT_FIRST : -1;
}

// The pickup index the family's reached rung points at, and the cumulative rung it climbs
// to: k in [0, count) with |*target| = start + jumps[0..k]; count when every planned rung is
// already reached (surplus); -1 when no plan is armed for a Custom family under the gate.
static int NextPickup(int family, int *target) {
  int start = GameHook_CapacityStartRung(family);
  int count = g_plan[family].count;
  if (start < 0 || count == 0) return -1;
  int rung = GameHook_CapacityRungOf(family);
  int cum = start;
  for (int k = 0; k < count; k++) {
    cum += g_plan[family].jumps[k];
    if (cum > rung) { *target = cum; return k; }
  }
  return count;
}

// Pure presentation for the draw seams: the family's receipt item, or the wallet's
// replacement once its plan is exhausted (or absent). No arithmetic, no messages.
uint8 GameHook_ProgressiveCapacityPresentationOf(uint8 item) {
  int family = GameHook_ProgressiveCapacityFamilyOf(item);
  if (family < 0) return item;
  if (family != kFamily_Wallet) return kFamilyPresentation[family];
  int target = 0;
  int k = NextPickup(family, &target);
  bool surplus = k < 0 || k >= g_plan[family].count || GameHook_WalletLadderAtCap();
  return surplus ? WALLET_SURPLUS_ITEM : WALLET_STEP_ITEM;
}

// The climb of one pickup: |steps| rungs (0 = surplus) applied through the same hooks the
// fixed-jump ids use, so the digits, the consolation and the icon behave identically.
static uint8 ApplyPickup(int family, int steps, int msg) {
  uint8 presentation = kFamilyPresentation[family];
  GameHook_UpgradeBonusCapture(family);
  bool climbed = false;
  if (family == kFamily_Wallet) {
    bool surplus = GameHook_WalletLadderClimb(steps);
    climbed = !surplus;
    presentation = surplus ? WALLET_SURPLUS_ITEM : WALLET_STEP_ITEM;
    if (!climbed || msg < 0) GameHook_ArmReceiptClassMessage(presentation, kReceiptMsg_Generic);
  } else if (family == kFamily_Meter) {
    int left = steps > 0 ? steps : 1;
    while (left-- > 0 && GameHook_CapacityClimb(kFamily_Meter)) climbed = true;
    if (!climbed || msg < 0) GameHook_ArmReceiptMessageIfClear(0x111);
  } else {
    bool maxed = false;
    int left = steps > 0 ? steps : 1;
    for (int n = 0; n < left; n++) maxed |= GameHook_CapacityStep(family);
    climbed = !maxed;
    if (!climbed || msg < 0) GameHook_ArmReceiptMessageIfClear(maxed ? 0x98 : (family == 0 ? 0x96 : 0x97));
  }
  // The rung's own line replaces whatever the seam armed for the location: the jump is
  // only known here.
  if (climbed && msg >= 0) GameHook_ArmReceiptMessageReplace(msg);
  GameHook_ArmUpgradeIcon(climbed ? family : -1);
  GameHook_UpgradeBonusArm(family, presentation, climbed);
  return presentation;
}

// The resolver behind GameHook_ResolveGrantItem for a progressive id. Refuses the climb
// unless a grant seam is open; degrades to the family's one-rung fixed item without an
// armed plan.
uint8 GameHook_ResolveProgressiveCapacityItem(uint8 item) {
  int family = GameHook_ProgressiveCapacityFamilyOf(item);
  if (family < 0) return item;
  if (!GrantSeamOpen()) return GameHook_ProgressiveCapacityPresentationOf(item);
  int target = 0;
  int k = NextPickup(family, &target);
  if (k < 0) {
    printf("[Randomizer] Progressive capacity 0x%02x: no plan armed for family %d, one fixed rung\n", item, family);
    return GameHook_ResolveGrantItem(kFamilyFallbackId[family]);
  }
  bool surplus = k >= g_plan[family].count;
  int steps = surplus ? 0 : target - GameHook_CapacityRungOf(family);
  int msg = surplus ? -1 : g_plan[family].msgs[k];
  uint8 presentation = ApplyPickup(family, steps, msg);
  printf("[Randomizer] Progressive capacity 0x%02x: family %d pickup %d/%d (+%d rungs -> %d), presentation 0x%02x\n",
         item, family, k + 1, g_plan[family].count, steps, GameHook_CapacityRungOf(family), presentation);
  return presentation;
}

// Record-only setters, the shared contract: nothing here tests a gate; the read side is
// reached only through gated seams. Entries are pushed in plan order, so the count is the
// highest index seen plus one.
EMSCRIPTEN_KEEPALIVE
void WasmSetCapacityPlanJump(int family, int index, int jump, int msg) {
  if (family < 0 || family >= PLAN_FAMILY_COUNT || index < 0 || index >= PLAN_MAX_JUMPS) return;
  g_plan[family].jumps[index] = (uint8)clampi(jump, 1, WALLET_LADDER_LAST);
  g_plan[family].msgs[index] = (int16)msg;
  if (index + 1 > g_plan[family].count) g_plan[family].count = (uint8)(index + 1);
  printf("[Randomizer] Capacity plan: family %d pickup %d -> %d rungs (msg %d)\n", family, index + 1,
         g_plan[family].jumps[index], msg);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearCapacityPlan(void) {
  memset(g_plan, 0, sizeof(g_plan));
  printf("[Randomizer] Cleared capacity plan\n");
}
