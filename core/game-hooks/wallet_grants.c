/* @layer core-game-hooks @kind native */
// Virtual receive ids for the wallet upgrades: sixteen SLOTS, 0x67-0x76, into a
// per-session jump table rather than one id per step — the wallet ladder has a hundred
// rungs (0, 99, 199 … 9999), which a step-per-id scheme could not hold below 0x80. The host arms the table
// from the profile (WasmSetWalletJumpTable, record-only, never persisted, rebuilt at
// every session start); a grant of slot s climbs the ladder by table[s] rungs up to the
// profile's final index (capacity_profile.c owns the persisted index and its cap) and
// presents as the fifty-rupee receipt 0x41. A step with nothing left to climb — the cap
// reached, or an unarmed slot — is surplus and presents as the reference randomizer's
// progressive replacement, the twenty-rupee pickup 0x36, so it is never a silent no-op.
// Same contract as the other virtual families: reachable only from inside the gated
// grant seams (GrantSeamOpen, game_hooks_internal.h); the climb itself answers to
// kFeatures3_CapacityProfile through the ladder owner.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"

#define WALLET_VIRT_FIRST 0x67
#define WALLET_VIRT_LAST 0x76
#define WALLET_JUMP_SLOTS (WALLET_VIRT_LAST - WALLET_VIRT_FIRST + 1)
// Fifty rupees: the receipt a climbing slot borrows for its hold-up. Its goods are the
// profile's pickup bonus (upgrade_bonus.c); natively a flat fifty whatever the new cap.
#define WALLET_STEP_ITEM 0x41
// Twenty rupees: the reference's replacement past the cap (progressive_grants.c).
#define WALLET_SURPLUS_ITEM 0x36

// slot -> ladder rungs; 0 = unarmed.
static uint8 g_wallet_jumps[WALLET_JUMP_SLOTS];

bool GameHook_IsWalletVirtualId(uint8 item) {
  return item >= WALLET_VIRT_FIRST && item <= WALLET_VIRT_LAST;
}

// Pure presentation for the draw seams: the fifty-rupee receipt while the slot can still
// climb, the replacement once it cannot — so a drawn world item always agrees with the
// eventual grant. No arithmetic, no messages.
uint8 GameHook_WalletPresentationOf(uint8 item) {
  if (!GameHook_IsWalletVirtualId(item)) return item;
  bool surplus = g_wallet_jumps[item - WALLET_VIRT_FIRST] == 0 || GameHook_WalletLadderAtCap();
  return surplus ? WALLET_SURPLUS_ITEM : WALLET_STEP_ITEM;
}

// The resolver behind GameHook_ResolveGrantItem for a wallet slot: climb, arm the
// generic class message (the host renders the jump on its own session line), and yield
// the presentation item. Refuses the climb unless a grant seam is open.
uint8 GameHook_ResolveWalletItem(uint8 item) {
  if (!GameHook_IsWalletVirtualId(item)) return item;
  if (!GrantSeamOpen()) return GameHook_WalletPresentationOf(item);
  int slot = item - WALLET_VIRT_FIRST;
  int steps = g_wallet_jumps[slot];
  if (steps == 0)
    printf("[Randomizer] Wallet slot %d is unarmed — the host skipped the jump table push\n", slot);
  // The index before the climb: the fixed line pre-rendered for it names the caps.
  int from = GameHook_WalletLadderIndex();
  GameHook_UpgradeBonusCapture(3);
  bool surplus = GameHook_WalletLadderClimb(steps);
  uint8 presentation = surplus ? WALLET_SURPLUS_ITEM : WALLET_STEP_ITEM;
  GameHook_ArmReceiptClassMessage(presentation, kReceiptMsg_Generic);
  // The line of the climb actually made replaces the location's jump-only line.
  int msg = surplus ? -1 : GameHook_CapacityFixedLine(3, from, steps);
  if (msg >= 0) GameHook_ArmReceiptMessageReplace(msg);
  // The hold-up icon (upgrade_icon.c) only for a slot that climbed; the surplus
  // replacement keeps its own picture.
  GameHook_ArmUpgradeIcon(surplus ? -1 : 3);
  GameHook_UpgradeBonusArm(3, presentation, !surplus);
  printf("[Randomizer] Wallet grant resolved: slot %d (+%d) -> index %d, presentation 0x%02x (line %d)\n",
         slot, steps, GameHook_WalletLadderIndex(), presentation, msg);
  return presentation;
}

// Record-only setters, the shared contract: nothing here tests a gate; the read side
// (the resolver above) is reached only through gated seams.
EMSCRIPTEN_KEEPALIVE
void WasmSetWalletJumpTable(int slot, int steps) {
  if (slot < 0 || slot >= WALLET_JUMP_SLOTS) return;
  g_wallet_jumps[slot] = (uint8)clampi(steps, 0, WALLET_LADDER_LAST);
  printf("[Randomizer] Wallet jump table: slot %d -> %d rungs\n", slot, g_wallet_jumps[slot]);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearWalletJumpTable(void) {
  memset(g_wallet_jumps, 0, sizeof(g_wallet_jumps));
  printf("[Randomizer] Cleared wallet jump table\n");
}
