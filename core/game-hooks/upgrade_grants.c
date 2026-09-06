/* @layer core-game-hooks @kind native */
// Virtual receive ids for the counter upgrades (bomb/arrow capacity, magic meter).
// The native receipt arrays stop at 0x4B and carry no id for these upgrades — their
// vanilla grants are silent counter bumps inside scripted handlers. This module
// reserves the id space 0x50-0x61, ABOVE the native table, so an upgrade can ride
// every substitution table like a normal item:
//   0x50-0x57  capacity kind 0 (explosives), steps 1-8
//   0x58-0x5F  capacity kind 1 (projectiles), steps 1-8
//   0x60-0x61  magic-meter upgrade, steps 1-2
// A step is one ladder RUNG (capacity_tiers.h): under a Custom family it climbs the profile
// ladder from the empty rung up to the final rung, otherwise the native grid.
// A virtual id NEVER reaches vendored code: every seam that would hand one to the
// native receive flow resolves it first — the counter arithmetic runs here (the exact
// per-step arithmetic of the upgrade pond handler / the cave bat's meter write), the
// pond's own upgrade message is armed, and the matching native REFILL item is returned
// as the visible presentation (0x31 explosives / 0x44 projectiles / 0x45 magic refill:
// its receipt art matches the upgrade's nature). The goods that receipt hands over are
// the profile's pickup bonus (upgrade_bonus.c) — natively they would be the refill's own
// fixed ten, or 16 of the meter, on top of the pond arithmetic's full refill, none of it
// scaled to the ceiling.
//
// This module also owns the entry points every seam shares for ALL the virtual
// families — the counter upgrades here, the progressive equipment ids of
// progressive_grants.c (0x62-0x66), the wallet slots of wallet_grants.c
// (0x67-0x76) and the progressive capacity ids of capacity_progressive.c
// (0x77-0x7A): GameHook_IsVirtualGrantId for the bound checks,
// GameHook_GrantPresentationOf for the draw seams, GameHook_ResolveGrantItem for the
// grant itself. Gating: no gate of its own — reachable ONLY from inside the already-gated
// substitution/receipt seams; the resolvers still refuse their side effects unless one
// of those seams is open (GrantSeamOpen, game_hooks_internal.h). The tier a counted
// family may reach answers to kFeatures3_CapacityProfile (capacity_profile.c); with
// that gate closed the bound is the native eighth level, byte-for-byte.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"

// The whole virtual span: counter upgrades, progressive equipment, the wallet slots, then
// the progressive capacity ids.
#define UPGRADE_VIRT_FIRST 0x50
#define UPGRADE_VIRT_LAST PROGRESSIVE_CAPACITY_VIRT_LAST
// The counter upgrades alone.
#define UPGRADE_COUNTER_LAST 0x61
#define UPGRADE_VIRT_ARROW_BASE 0x58
#define UPGRADE_VIRT_MAGIC_BASE 0x60

bool GameHook_IsUpgradeVirtualId(uint8 item) {
  return item >= UPGRADE_VIRT_FIRST && item <= UPGRADE_COUNTER_LAST;
}

// Any virtual family: the one sanctioned exception to the 76-entry bound every
// override table and the receipt export enforce.
bool GameHook_IsVirtualGrantId(uint8 item) {
  if (item >= UPGRADE_VIRT_FIRST && item <= UPGRADE_VIRT_LAST) return true;
  // The targeted dungeon-item ids sit above the prize span with a gap between (their
  // encoding is nibble-aligned — dungeon_item_ids.h), so the answer is a disjunction
  // rather than one widened bound: widening would swallow the prize ids, which every
  // bound check here deliberately refuses.
  return GameHook_IsDungeonItemGrantId(item);
}

// Pure presentation lookup for the draw seams — no arithmetic, no messages.
uint8 GameHook_UpgradePresentationOf(uint8 item) {
  if (!GameHook_IsUpgradeVirtualId(item)) return item;
  if (item >= UPGRADE_VIRT_MAGIC_BASE) return 0x45;
  return item >= UPGRADE_VIRT_ARROW_BASE ? 0x44 : 0x31;
}

// The capacity family a grant id belongs to (0 explosives, 1 projectiles, 2 meter,
// 3 wallet — capacity_profile.c's order), -1 for any other id. Pure.
int GameHook_UpgradeFamilyOf(uint8 item) {
  if (GameHook_IsProgressiveCapacityId(item)) return GameHook_ProgressiveCapacityFamilyOf(item);
  if (GameHook_IsWalletVirtualId(item)) return 3;
  if (!GameHook_IsUpgradeVirtualId(item)) return -1;
  if (item >= UPGRADE_VIRT_MAGIC_BASE) return 2;
  return item >= UPGRADE_VIRT_ARROW_BASE ? 1 : 0;
}

// The native item any grant id draws as: a virtual upgrade as its refill item, a
// progressive id as the next tier from live inventory, a wallet slot as its rupee
// receipt, a native id as itself.
uint8 GameHook_GrantPresentationOf(uint8 item) {
  if (GameHook_IsDungeonItemGrantId(item)) return GameHook_DungeonItemPresentationOf(item);
  if (GameHook_IsProgressiveCapacityId(item)) return GameHook_ProgressiveCapacityPresentationOf(item);
  if (GameHook_IsProgressiveVirtualId(item)) return GameHook_ProgressivePresentationOf(item);
  if (GameHook_IsWalletVirtualId(item)) return GameHook_WalletPresentationOf(item);
  // A concrete tier of a family whose rungs arrive as themselves draws as what it will
  // really hand over, which is rupees once the file already stands above that rung.
  if (!GameHook_IsUpgradeVirtualId(item)) return GameHook_IndependentTierGrantOf(item);
  return GameHook_UpgradePresentationOf(item);
}

// One capacity step, the pond handler's arithmetic per visit: the family climbs one
// rung (GameHook_CapacityClimb — the profile ladder under a Custom family, the native
// level index otherwise), the refill target and the message digits take the new
// maximum, and a step past the reachable bound pays the pond's 100-rupee consolation
// instead. Returns true for the consolation.
bool GameHook_CapacityStep(int kind) {
  if (!GameHook_CapacityClimb(kind)) { link_rupees_goal += 100; return true; }
  if (kind == 0)
    dialogue_number[0] = link_bomb_filler = kCapacityTiersBombsHex[link_bomb_upgrades];
  else
    dialogue_number[0] = link_arrow_filler = kCapacityTiersArrowsHex[link_arrow_upgrades];
  return false;
}

// Resolve a grant id for the receive flow: native ids pass through untouched; a
// progressive id becomes the next tier's native id (progressive_grants.c); a wallet
// slot climbs the ladder and becomes its rupee receipt (wallet_grants.c); a virtual
// upgrade id applies its upgrade steps, arms the pond's own upgrade message (a
// one-shot contextual line already armed by the caller wins — IfClear contract),
// and returns the native presentation item. Call at the LAST moment before the id
// enters any vanilla receive path.
uint8 GameHook_ResolveGrantItem(uint8 item) {
  if (GameHook_IsDungeonItemGrantId(item)) return GameHook_ResolveDungeonItemGrant(item);
  if (GameHook_IsProgressiveCapacityId(item)) return GameHook_ResolveProgressiveCapacityItem(item);
  if (GameHook_IsProgressiveVirtualId(item)) return GameHook_ResolveProgressiveItem(item);
  if (GameHook_IsWalletVirtualId(item)) return GameHook_ResolveWalletItem(item);
  // Same reading on the receive side, so the draw and the grant can never disagree.
  if (!GameHook_IsUpgradeVirtualId(item)) return GameHook_IndependentTierGrantOf(item);
  uint8 presentation = GameHook_UpgradePresentationOf(item);
  if (!GrantSeamOpen()) return presentation;
  int family = GameHook_UpgradeFamilyOf(item);
  // The rung before the climb: the fixed line pre-rendered for it names the values.
  int from = GameHook_CapacityRungOf(family);
  GameHook_UpgradeBonusCapture(family);
  bool climbed = false;
  if (item >= UPGRADE_VIRT_MAGIC_BASE) {
    // The meter upgrade: consumption shifts 4 -> 2 -> 1 units per use; each step
    // halves again, floored at the cave bat's own quarter setting (or the profile's
    // final rung); from the empty rung the first step makes the meter usable.
    int steps = item - UPGRADE_VIRT_MAGIC_BASE + 1;
    while (steps-- > 0 && GameHook_CapacityClimb(2)) climbed = true;
    GameHook_ArmReceiptMessageIfClear(0x111);
    // The hold-up icon (upgrade_icon.c) only for a receipt that climbed; a maxed meter
    // keeps its refill presentation.
    GameHook_ArmUpgradeIcon(climbed ? 2 : -1);
  } else {
    int kind = item >= UPGRADE_VIRT_ARROW_BASE ? 1 : 0;
    int steps = (item - (kind ? UPGRADE_VIRT_ARROW_BASE : UPGRADE_VIRT_FIRST)) + 1;
    bool maxed = false;
    for (int n = 0; n < steps; n++) maxed |= GameHook_CapacityStep(kind);
    climbed = !maxed;
    GameHook_ArmReceiptMessageIfClear(maxed ? 0x98 : (kind == 0 ? 0x96 : 0x97));
    GameHook_ArmUpgradeIcon(maxed ? -1 : kind);
  }
  // The line of the climb actually made replaces the location's jump-only line.
  int msg = climbed ? GameHook_CapacityFixedLine(family, from, GameHook_CapacityRungOf(family) - from) : -1;
  if (msg >= 0) GameHook_ArmReceiptMessageReplace(msg);
  GameHook_UpgradeBonusArm(family, presentation, climbed);
  printf("[Randomizer] Upgrade grant resolved: 0x%02x -> presentation 0x%02x (rung %d -> %d, line %d)\n",
         item, presentation, from, GameHook_CapacityRungOf(family), msg);
  return presentation;
}
