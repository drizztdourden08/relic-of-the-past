/* @layer core-game-hooks @kind native */
// The capacity profile: per family (0 explosives, 1 projectiles, 2 meter, 3 wallet) the
// starting and final RUNG a Custom setting chose (capacity_tiers.h: rung 0 is the empty
// tier, rung r >= 1 native level r-1), armed by the host once per session. Every
// application site answers to kFeatures3_CapacityProfile:
//   - the new-file seam (select_file.c, right after the kSramInit_Normal memcpy): a
//     fresh file starts at the Custom families' starting rungs;
//   - the cap readers (hud.c refill drain and digit color, the shop refusals, ui_state.c,
//     the cheats): GameHook_CapacityMax maps a level byte to its capacity, 0 on the empty
//     rung;
//   - the meter cost (player.c LinkCheckMagicCost): GameHook_MagicCost makes every use
//     unpayable on the empty rung;
//   - the meter capacity (hud.c refill drain and potion/victory refill, the cheat clamp):
//     GameHook_MagicCapacity is the full-meter value the readers held, 0 on the empty rung,
//     so every refill drains to nothing and the meter reads as full at 0;
//   - the climb (upgrade_grants.c CapacityStep, the pond seam in scripted_grants.c): a
//     stepped family climbs rung by rung and stops at its final rung;
//   - the wallet cap (hud.c MaxRupees, the cheat clamp, the UI bridge): the rupee ceiling
//     follows the wallet ladder index persisted in the save block.
// The setter records blind (the SyncGateWords latching contract shared by every override
// table); gate off => every hook here collapses to a no-op or hands back the value it was
// given, so the vanilla file bytes, the native tables, the cost lookup and MaxRupees's own
// expression are untouched.
//
// Save bytes — addresses allocated in save_bytes.h, THE registry: the wallet ladder index,
// and one empty-rung flag per counted family (explosives, projectiles, meter). The tier
// byte and the meter level keep their vanilla meaning (0 = the first native level) and the
// flag says the family is still BELOW it, so a vanilla read of the same file sees a sane
// first-level file, never an out-of-grid index.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"
#include "save_bytes.h"
#include "wallet_cheat.h"

#define srm_wallet_ladder_index (*(uint8 *)(g_ram + SRM_WALLET_LADDER_INDEX))
#define srm_empty_rung(family) (*(uint8 *)(g_ram + SRM_EMPTY_RUNG + (family)))

// The new-file seam hands over the init block (sram + 0x340); a WRAM address of a file
// byte maps onto it by subtracting the file base and the block base. Every address
// below is the variables.h definition of the byte it names.
#define INIT_BLOCK_BASE 0x340
#define BLOCK_OFFS(wram_addr) ((wram_addr) - SAVE_BLOCK_BASE - INIT_BLOCK_BASE)
#define WRAM_BOMB_COUNT 0xF343         // link_item_bombs
#define WRAM_MAGIC_POWER 0xF36E        // link_magic_power
#define WRAM_BOMB_TIER 0xF370          // link_bomb_upgrades
#define WRAM_ARROW_TIER 0xF371         // link_arrow_upgrades
#define WRAM_ARROW_COUNT 0xF377        // link_num_arrows
#define WRAM_METER_LEVEL 0xF37B        // link_magic_consumption
// The two hook-owned bytes the same seam initialises; allocated in save_bytes.h.
#define WRAM_WALLET_LADDER_INDEX SRM_WALLET_LADDER_INDEX
#define WRAM_EMPTY_RUNG_BASE SRM_EMPTY_RUNG

// A cost no meter can pay. The vendored check subtracts the cost from the 0-128 meter in
// a byte and refuses when the sign bit of the result is set; 129 sets it for every meter
// value from 1 to 128 (an empty meter is refused before the subtraction).
#define MAGIC_COST_UNPAYABLE 0x81
// The full meter every vendored reader spelled as 128 / 0x80.
#define MAGIC_METER_FULL 0x80

enum { kFamily_Explosives, kFamily_Projectiles, kFamily_Meter, kFamily_Wallet, kFamilyCount };

static const uint8 kFamilyLastRung[kFamilyCount] = {CAPACITY_LAST_RUNG, CAPACITY_LAST_RUNG,
                                                    METER_LAST_RUNG, WALLET_LADDER_LAST};

static struct {
  uint8 armed;
  uint8 custom[kFamilyCount];      // 1 = Custom; 0 = vanilla or vanilla-in-pool (native grid)
  uint8 start_rung[kFamilyCount];
  uint8 max_rung[kFamilyCount];
} g_capacity;

static bool ProfileOpen(void) {
  return (enhanced_features3 & kFeatures3_CapacityProfile) != 0 && g_capacity.armed;
}

static bool FamilyCustom(int family) {
  return ProfileOpen() && g_capacity.custom[family];
}

static bool IsStepped(int family) {
  return family >= kFamily_Explosives && family <= kFamily_Meter;
}

// The native level byte of a stepped family.
static uint8 *LevelByte(int family) {
  if (family == kFamily_Explosives) return &link_bomb_upgrades;
  if (family == kFamily_Projectiles) return &link_arrow_upgrades;
  return &link_magic_consumption;
}

// The rung a stepped family stands on: the empty rung while its flag is set and the level
// byte is still 0 (any native increment past 0 leaves the empty rung on its own), else
// level + 1.
static int FamilyRung(int family) {
  uint8 level = *LevelByte(family);
  return (level == 0 && srm_empty_rung(family)) ? 0 : level + 1;
}

static void SetFamilyRung(int family, int rung) {
  *LevelByte(family) = (uint8)(rung > 0 ? rung - 1 : 0);
  srm_empty_rung(family) = (uint8)(rung == 0);
}

// Record-only setter, the shared contract: the gate latches a frame after the host
// writes it, so it is enforced at the application sites below, never here. Rungs are
// clamped to the family's ladder and ordered so max >= start.
EMSCRIPTEN_KEEPALIVE
void WasmSetCapacityProfile(int family, int custom, int start_tier, int max_tier) {
  if (family < 0 || family >= kFamilyCount) return;
  int last = kFamilyLastRung[family];
  int start = clampi(start_tier, 0, last);
  g_capacity.armed = 1;
  g_capacity.custom[family] = (uint8)!!custom;
  g_capacity.start_rung[family] = (uint8)start;
  g_capacity.max_rung[family] = (uint8)clampi(max_tier, start, last);
  printf("[Randomizer] Capacity profile: family %d custom=%d rungs %d..%d\n", family, !!custom,
         g_capacity.start_rung[family], g_capacity.max_rung[family]);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearCapacityProfile(void) {
  memset(&g_capacity, 0, sizeof(g_capacity));
  printf("[Randomizer] Cleared capacity profile\n");
}

// New-file seam: |block| is the fresh file's init block, already kSramInit_Normal. Only
// Custom families are written; the others keep the block's own bytes. A stepped family
// starts at its rung: the level byte (rung - 1, or 0 with the empty-rung flag raised) and,
// for the counted families, a full count for that rung (the decimal cap the HUD compares
// against, kMaxBombsForLevel / kMaxArrowsForLevel — not the display-coded hex grid, which
// is the message-and-refill encoding; 0 on the empty rung). The meter on its empty rung
// holds nothing: the shipped block already starts it at 0, written again here so the
// file opens at 0 whatever the template says. Never runs on a file load.
void GameHook_InitNewFileCounters(uint8 *block) {
  if (!ProfileOpen()) return;
  static const uint16 kTierByte[3] = {WRAM_BOMB_TIER, WRAM_ARROW_TIER, WRAM_METER_LEVEL};
  for (int family = kFamily_Explosives; family <= kFamily_Meter; family++) {
    if (!g_capacity.custom[family]) continue;
    int rung = g_capacity.start_rung[family];
    block[BLOCK_OFFS(kTierByte[family])] = (uint8)(rung > 0 ? rung - 1 : 0);
    block[BLOCK_OFFS(WRAM_EMPTY_RUNG_BASE + family)] = (uint8)(rung == 0);
    if (family == kFamily_Explosives)
      block[BLOCK_OFFS(WRAM_BOMB_COUNT)] = rung > 0 ? kMaxBombsForLevel[rung - 1] : 0;
    if (family == kFamily_Projectiles)
      block[BLOCK_OFFS(WRAM_ARROW_COUNT)] = rung > 0 ? kMaxArrowsForLevel[rung - 1] : 0;
    if (family == kFamily_Meter && rung == 0) block[BLOCK_OFFS(WRAM_MAGIC_POWER)] = 0;
  }
  if (g_capacity.custom[kFamily_Wallet])
    block[BLOCK_OFFS(WRAM_WALLET_LADDER_INDEX)] = g_capacity.start_rung[kFamily_Wallet];
  printf("[Randomizer] New file counters seeded from the capacity profile\n");
}

bool GameHook_CapacityFamilyCustom(int kind) {
  return IsStepped(kind) && FamilyCustom(kind);
}

// The cap-table seam (hud.c, sprite_main.c, ui_state.c, cheats.c): the native table entry
// for |level| — the exact expression the vendored readers wrote — unless the family is
// Custom under the gate and stands on the empty rung, where the capacity is 0.
int GameHook_CapacityMax(int kind, int level) {
  const uint8 *table = kind == kFamily_Explosives ? kMaxBombsForLevel : kMaxArrowsForLevel;
  int native = table[level];
  if (!FamilyCustom(kind)) return native;
  return (level == 0 && srm_empty_rung(kind)) ? 0 : native;
}

// The meter cost seam (player.c LinkCheckMagicCost): |cost| back untouched unless a Custom
// meter under the gate stands on the empty rung, where no use is payable.
uint8 GameHook_MagicCost(uint8 cost) {
  if (!FamilyCustom(kFamily_Meter) || FamilyRung(kFamily_Meter) != 0) return cost;
  return MAGIC_COST_UNPAYABLE;
}

// The meter capacity seam (hud.c Hud_RefillLogic and Hud_RefillMagicPower, the cheat clamp):
// the full meter every reader spelled, 0x80, unless a Custom meter under the gate stands on
// the empty rung, where the meter holds nothing — the refill drain stops at 0 the way the
// counted drains stop at GameHook_CapacityMax's 0, and a potion or victory refill sees a
// meter already at capacity.
uint8 GameHook_MagicCapacity(void) {
  if (!FamilyCustom(kFamily_Meter) || FamilyRung(kFamily_Meter) != 0) return MAGIC_METER_FULL;
  return 0;
}

// One rung up for a stepped family. Custom under the gate: up to the profile's final rung.
// Otherwise the native arithmetic the handlers wrote — level + 1 up to the grid's last
// level, the empty-rung flag ignored. False when nothing is left to climb.
bool GameHook_CapacityClimb(int kind) {
  if (!IsStepped(kind)) return false;
  if (FamilyCustom(kind)) {
    int rung = FamilyRung(kind);
    if (rung >= g_capacity.max_rung[kind]) return false;
    SetFamilyRung(kind, rung + 1);
    return true;
  }
  uint8 *level = LevelByte(kind);
  int levels = kind == kFamily_Meter ? METER_LEVEL_COUNT : CAPACITY_TIER_COUNT;
  if (*level + 1 >= levels) return false;
  (*level)++;
  return true;
}

// A direct level write (the cheats) lands on the native grid, so it leaves the empty rung.
void GameHook_CapacityLeaveEmptyRung(int kind) {
  if (IsStepped(kind)) srm_empty_rung(kind) = 0;
}

// Raw read of a family's empty-rung flag for the progress buffer (gated by its caller).
uint8 GameHook_CapacityEmptyRungFlag(int kind) {
  return IsStepped(kind) ? srm_empty_rung(kind) : 0;
}

// The rung |family| stands on right now, read off the save bytes: a stepped family's rung
// (tier byte + empty-rung flag), the wallet's persisted ladder index. Pure read.
int GameHook_CapacityRungOf(int family) {
  if (family == kFamily_Wallet) return srm_wallet_ladder_index;
  return IsStepped(family) ? FamilyRung(family) : 0;
}

// The starting rung the profile armed for |family|, the base of its planned ladder; -1
// unless the family is Custom under the gate (the progressive climb then has no plan).
int GameHook_CapacityStartRung(int family) {
  if (family < 0 || family >= kFamilyCount || !FamilyCustom(family)) return -1;
  return g_capacity.start_rung[family];
}

// hud.c MaxRupees seam. |vanilla| is the expression the vendored code already computes
// (999, or 9999 under CarryMoreRupees); the ladder only ever lowers it, never raises.
int GameHook_WalletMax(int vanilla) {
  if (!FamilyCustom(kFamily_Wallet)) return vanilla;
  int cap = WalletCapOfIndex(srm_wallet_ladder_index);
  return cap < vanilla ? cap : vanilla;
}

// The cheat's direct write (wallet_cheat.h): the persisted index becomes |rung|, so the
// ceiling, the climb and the progress buffer all read the same rung afterwards.
bool GameHook_WalletLadderSet(int rung) {
  if (!FamilyCustom(kFamily_Wallet)) return false;
  srm_wallet_ladder_index = (uint8)WalletLadderIndexClamp(rung);
  return true;
}

// Raw read of the persisted index for the progress buffer (gated by its caller).
uint8 GameHook_WalletLadderIndex(void) {
  return srm_wallet_ladder_index;
}

// True when a wallet step has nothing left to climb: the profile's final index is
// reached, or there is no Custom wallet to climb at all.
bool GameHook_WalletLadderAtCap(void) {
  if (!FamilyCustom(kFamily_Wallet)) return true;
  return srm_wallet_ladder_index >= g_capacity.max_rung[kFamily_Wallet];
}

// Climb |steps| rungs up to the profile's final index. Returns true when any step was
// surplus (nothing to climb, an empty jump, or the cap reached mid-climb) so the caller
// can present the reference's replacement instead. Writes nothing without a Custom
// wallet under the gate.
bool GameHook_WalletLadderClimb(int steps) {
  if (!FamilyCustom(kFamily_Wallet)) return true;
  int cap = g_capacity.max_rung[kFamily_Wallet];
  bool surplus = steps <= 0;
  while (steps-- > 0) {
    if (srm_wallet_ladder_index < cap) srm_wallet_ladder_index++;
    else surplus = true;
  }
  return surplus;
}
