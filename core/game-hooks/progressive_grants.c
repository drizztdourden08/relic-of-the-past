/* @layer core-game-hooks @kind native */
// Virtual receive ids for the progressive equipment families (blade, shield, lift
// gloves, armor, bow). The pool carries N copies of one "progressive" item per family;
// the native receive routine SETS a tier (kValueToGiveItemTo, misc.c), it never
// increments, so a copy resolved to a fixed native id at session-arm time re-set the
// same tier on every grant. This module reserves 0x62-0x66, ABOVE the upgrade range
// 0x50-0x61 of upgrade_grants.c, so a progressive copy rides every substitution table
// unresolved and is mapped to the NEXT tier's native id from live inventory at the
// last moment before the receive flow (the same contract as the counter upgrades):
//   0x62  blade   tiers 0x49 / 0x01 / 0x02 / 0x03  (link_sword_type 0..4)
//   0x63  shield  tiers 0x04 / 0x05 / 0x06         (link_shield_type 0..3)
//   0x64  gloves  tiers 0x1b / 0x1c                (link_item_gloves 0..2)
//   0x65  armor   tiers 0x22 / 0x23                (link_armor 0..2)
//   0x66  bow     tiers 0x0b / 0x3b                (link_item_bow: 1-2 = first, 3-4 = second)
// A session may also leave RUNGS OUT of a family. The pool then carries one copy per rung that
// is still there (the option catalog's tier ticks, shared/randomizer/ap-world/progressive/), and
// a pickup climbs to the next rung that is still there rather than to the next native tier — so
// unticking a middle rung shortens the ladder instead of leaving a hole in it. The mask is
// armed per family at session start (WasmSetProgressiveTiers); an unarmed family, which is every
// family of every session that never asks, reads as every rung present and the arithmetic below
// collapses to the plain "next tier" it always was.
//
// Past the top tier the reference randomizer substitutes its "progressive replacement"
// item, the twenty-rupee pickup (newitems.asm .prog_* routines, limits per ItemPool.py);
// the same id 0x36 is handed out here so a surplus copy is never a silent no-op.
//
// The second blade tier is the one native id (0x01) whose receipt also starts the
// pedestal ceremony (misc.c AncillaAdd_ItemReceipt: submodule 43, the flash ancilla, the
// timer-driven receipt). Submodule 43 has no dungeon handler at all — the dispatch table
// stops at 30 — so that receipt would crash indoors. The reference randomizer avoids the
// id with a private "safe" variant; this module instead arms a one-shot the receive seam
// consumes right after the receipt is added (GameHook_NotifyItemReceived, still inside
// Link_ReceiveItem, before any frame runs): the ceremony state is put back and the
// hold-up ancilla continues as a plain blade receipt. Nothing here is reachable outside
// the gated grant seams; see GrantSeamOpen (game_hooks_internal.h).
#include "game_hooks_internal.h"

#define PROGRESSIVE_VIRT_FIRST 0x62
#define PROGRESSIVE_VIRT_LAST 0x66
// The reference randomizer's replacement past the top tier: twenty rupees.
#define PROGRESSIVE_CAP_ITEM 0x36
// The blade tier whose native receipt starts the pedestal ceremony.
#define PEDESTAL_BLADE_ID 0x01

typedef struct {
  const uint8 *ids;
  uint8 tier_count;
} ProgressiveFamily;

static const uint8 kBladeTierIds[4] = {0x49, 0x01, 0x02, 0x03};
static const uint8 kShieldTierIds[3] = {0x04, 0x05, 0x06};
static const uint8 kGloveTierIds[2] = {0x1b, 0x1c};
static const uint8 kArmorTierIds[2] = {0x22, 0x23};
static const uint8 kBowTierIds[2] = {0x0b, 0x3b};

static const ProgressiveFamily kFamilies[5] = {
  {kBladeTierIds, 4}, {kShieldTierIds, 3}, {kGloveTierIds, 2}, {kArmorTierIds, 2}, {kBowTierIds, 2},
};

#define PROGRESSIVE_FAMILY_COUNT 5
// Bit k set: rung k is in this seed. Zero is UNARMED, not "no rungs" — a session that never
// speaks gets the whole ladder, which is what keeps an unarmed core byte-identical.
static uint8 g_tier_mask[PROGRESSIVE_FAMILY_COUNT];
// Bit set: this family's rungs arrive as THEMSELVES rather than as nameless copies (the
// per-family order setting). Zero is the reference reading, so an unarmed core is
// byte-identical; the block at the foot of this file says what the flag really does.
static uint8 g_independent[PROGRESSIVE_FAMILY_COUNT];

// The rung a pickup lands on: the lowest one still present at or above the tier already held.
// With no mask armed that is |tier| itself, so the lookup is the vendored one. Returns the tier
// count when nothing is left above — the surplus case the caller replaces with rupees.
static int NextPresentTier(int family, int tier) {
  uint8 mask = g_tier_mask[family];
  int count = kFamilies[family].tier_count;
  if (mask == 0) return tier;
  for (int rung = tier; rung < count; rung++) {
    if (mask & (uint8)(1u << rung)) return rung;
  }
  return count;
}

// The tier the player holds right now, read from the same save bytes the native
// receipt writes. The bow byte encodes ammo in its low bit (1/2 first bow, 3/4 second),
// so its tier is the halved value.
static int CurrentTier(int family) {
  switch (family) {
    case 0: return link_sword_type;
    case 1: return link_shield_type;
    case 2: return link_item_gloves;
    case 3: return link_armor;
    default: return (link_item_bow + 1) >> 1;
  }
}

bool GameHook_IsProgressiveVirtualId(uint8 item) {
  return item >= PROGRESSIVE_VIRT_FIRST && item <= PROGRESSIVE_VIRT_LAST;
}

// Pure lookup for the draw seams and the resolver alike: the native id the NEXT tier
// grants given live inventory, the replacement past the cap. No side effect, so a world
// item can be drawn with it every frame and always agree with the eventual grant.
uint8 GameHook_ProgressivePresentationOf(uint8 item) {
  if (!GameHook_IsProgressiveVirtualId(item)) return item;
  int family = item - PROGRESSIVE_VIRT_FIRST;
  int tier = NextPresentTier(family, CurrentTier(family));
  if (tier >= kFamilies[family].tier_count) return PROGRESSIVE_CAP_ITEM;
  return kFamilies[family].ids[tier];
}

// ─── Pedestal-ceremony guard for the second blade tier ───

static struct {
  bool armed;
  uint8 submodule;
  uint8 filter_countdown;
} g_ceremony_guard;

static void ArmCeremonyGuard(void) {
  g_ceremony_guard.armed = true;
  g_ceremony_guard.submodule = submodule_index;
  g_ceremony_guard.filter_countdown = BYTE(palette_filter_countdown);
}

// Consumed by the receive seam right after AncillaAdd_ItemReceipt ran. Undoes exactly
// the ceremony branch of that routine: the module state it redirected, the flash
// ancilla it spawned, the receipt's timer-driven mode, and the pedestal chime it queued
// in place of the item jingle. The pond receipt (method 2) never enters that branch.
void GameHook_ProgressiveAfterReceipt(uint8 item) {
  if (!g_ceremony_guard.armed) return;
  g_ceremony_guard.armed = false;
  if (item != PEDESTAL_BLADE_ID || item_receipt_method == 2) return;
  submodule_index = g_ceremony_guard.submodule;
  BYTE(palette_filter_countdown) = g_ceremony_guard.filter_countdown;
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] == 0x35) ancilla_type[k] = 0;
    if (ancilla_type[k] != 0x22 || ancilla_item_to_link[k] != PEDESTAL_BLADE_ID) continue;
    // Carry the next blade id: identical art, shape and palette row, but none of the
    // ceremony branches Ancilla22_ItemReceipt keys on id 1. The inventory byte already
    // holds the second tier — the receipt wrote it before this ran.
    ancilla_item_to_link[k] = 0x02;
    ancilla_arr3[k] = 9;
    ancilla_timer[k] = 0;
  }
  if (item_receipt_method == 0) {
    sound_effect_1 = 0;
    sound_effect_2 = Link_CalculateSfxPan() | 0xf;
  }
  printf("[Randomizer] Progressive blade: pedestal ceremony suppressed\n");
}

// Resolve a progressive id for the receive flow: the next tier's native id, with the
// ceremony guard armed when that id is the pedestal blade. Refuses (returns the
// presentation untouched, no guard) unless a grant seam is open — the same belt and
// suspenders as the upgrade resolver.
uint8 GameHook_ResolveProgressiveItem(uint8 item) {
  uint8 native = GameHook_ProgressivePresentationOf(item);
  if (!GrantSeamOpen()) return native;
  if (native == PEDESTAL_BLADE_ID) ArmCeremonyGuard();
  printf("[Randomizer] Progressive grant resolved: 0x%02x -> 0x%02x (tier %d)\n",
         item, native, CurrentTier(item - PROGRESSIVE_VIRT_FIRST));
  return native;
}

// Record-only setters, the shared contract: nothing here tests a gate; the read side is reached
// only through the gated grant seams. |mask| carries one bit per rung, bit 0 the first; zero
// disarms the family and gives it the whole ladder back.
EMSCRIPTEN_KEEPALIVE
void WasmSetProgressiveTiers(int family, int mask) {
  if (family < 0 || family >= PROGRESSIVE_FAMILY_COUNT) return;
  g_tier_mask[family] = (uint8)(mask & ((1 << kFamilies[family].tier_count) - 1));
  printf("[Randomizer] Progressive tiers: family %d mask 0x%02x\n", family, g_tier_mask[family]);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearProgressiveTiers(void) {
  memset(g_tier_mask, 0, sizeof(g_tier_mask));
  memset(g_independent, 0, sizeof(g_independent));
  printf("[Randomizer] Cleared progressive tier masks\n");
}

// ─── Families whose rungs arrive as themselves ───
//
// A session may put a family's rungs in the pool AS THE RUNGS rather than as nameless
// copies (the per-family order setting, shared/randomizer/ap-world/progressive/). Those
// pickups carry the tier's own native id, so they never reach the resolver above and the
// ladder mask never touches them: finding the top rung first really does hand over the
// top rung, which is the whole point of the setting.
//
// One thing does need saying here. The native receipt SETS a tier rather than raising it
// (kValueToGiveItemTo, misc.c), so a lower rung found after a higher one already held
// would walk the family back down — a pickup that takes something away. The reference
// randomizer never has to answer this because it patches the receipt; this module answers
// it the way it answers a surplus progressive copy, by handing over the twenty-rupee
// replacement instead. Nothing is ever lost and nothing is silently no-op.
//
// Armed per family at session start (WasmSetProgressiveIndependent) and zero otherwise, so
// a core that is never armed — every session that does not ask — is byte-identical.

// The rung a concrete tier id stands for, or -1 when the id is not one of them.
static int TierOfNativeId(int family, uint8 item) {
  for (int rung = 0; rung < kFamilies[family].tier_count; rung++) {
    if (kFamilies[family].ids[rung] == item) return rung;
  }
  return -1;
}

// The id a concrete tier pickup really hands over: itself, unless its family arrives out
// of order and the tier it names is one the file already stands at or above. Pure, so the
// draw seams and the receive flow agree frame for frame.
uint8 GameHook_IndependentTierGrantOf(uint8 item) {
  for (int family = 0; family < PROGRESSIVE_FAMILY_COUNT; family++) {
    if (!g_independent[family]) continue;
    int rung = TierOfNativeId(family, item);
    if (rung < 0) continue;
    // The bow byte counts from one and carries ammo in its low bit, so its rung is the
    // halved value — the same reading CurrentTier uses.
    if (CurrentTier(family) > rung) return PROGRESSIVE_CAP_ITEM;
    return item;
  }
  return item;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetProgressiveIndependent(int family, int independent) {
  if (family < 0 || family >= PROGRESSIVE_FAMILY_COUNT) return;
  g_independent[family] = independent ? 1 : 0;
  printf("[Randomizer] Progressive order: family %d independent %d\n", family, g_independent[family]);
}
