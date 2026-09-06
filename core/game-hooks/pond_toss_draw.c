/* @layer core-game-hooks @kind native */
// The gems a throw sends into the pond, showing the amount that was actually paid.
//
// Vanilla only ever charges 5, 20, 25 or 50 and spawns that many five-rupee gems, all
// out of one decoded sheet. A plan can charge any amount, so the toss decomposes it
// greedily over the six denominations — 300, 100, 50, 20, 5, 1 — largest first: 300 is
// one gold gem, 427 is one gold, one silver, one red, one blue and two greens.
//
// Only one sprite sheet is decoded at a time, and the coloured-gem hook recolours that
// one slot, so gems needing different sheets (or different recolours of the shared gem
// sheet) cannot be in the air together. The decomposition therefore leaves in VOLLEYS:
// gems sharing a decode key travel as one group, at most a pond slot-full, and the next
// group is spawned when the previous one has splashed. The three small values share the
// numberless gem sheet, so they always fly together; each large value gets a volley of
// its own. The grouping is identical whether or not coloured rupees are on.
//
// Presentation, per volley:
//   coloured rupees OFF — each gem draws under its own receipt id, so the cartridge's
//     own picture for that denomination is what flies in;
//   coloured rupees ON  — the shared gem sheet is decoded and recoloured once for the
//     volley's denomination (GameHook_RecolorRupeeGem), and the gems are drawn under the
//     small-gem receipt whose palette row is the one that denomination reads in, so the
//     plain coloured gem flies in instead of the numbered picture.
//
// Gate: kFeatures3_PondPlan, checked through GameHook_PondPlanOpen. Off, this spawns
// nothing and the vendored AddHappinessPondRupees runs byte-for-byte as before.
#include "game_hooks_internal.h"
#include "src/ancilla.h"
#include "src/load_gfx.h"

// The pond's own flying-gem slots (the happiness_pond_* arrays are ten deep).
#define POND_GEM_SLOTS 10
// The most gems one amount can decompose into, over the whole wallet range.
#define POND_GEM_MAX 48

// The six denominations, largest first, with the receipt id carrying each one's art and
// the key that says which of them can share a decoded sheet.
typedef struct { int16 value; uint8 receipt; uint8 decode_key; } RupeeGem;
static const RupeeGem kRupeeGems[] = {
  {300, 0x46, 3},  // gold
  {100, 0x40, 2},  // silver
  {50, 0x41, 1},   // violet
  {20, 0x36, 0},   // red    — the three small values share one sheet
  {5, 0x35, 0},    // blue
  {1, 0x34, 0},    // green
};
#define RUPEE_GEM_COUNT ((int)(sizeof(kRupeeGems) / sizeof(kRupeeGems[0])))

// The small-gem receipt whose OAM palette row is |row| — how a recoloured gem is given
// the row its denomination reads in without touching the shared draw path.
static uint8 SmallGemForRow(uint8 row) {
  return row == 2 ? 0x35 : row == 1 ? 0x36 : 0x34;
}

// The queue of gems still to leave, and where the next volley starts in it.
static struct {
  uint8 count;
  uint8 sent;
  uint8 receipt[POND_GEM_MAX];
  uint8 key[POND_GEM_MAX];
} g_toss;

// |amount| as gems, largest first, into the queue. Returns how many it took.
static int DecomposeRupees(int amount) {
  int left = amount > 0 ? amount : 0, count = 0;
  for (int i = 0; i < RUPEE_GEM_COUNT && count < POND_GEM_MAX; i++) {
    while (left >= kRupeeGems[i].value && count < POND_GEM_MAX) {
      g_toss.receipt[count] = kRupeeGems[i].receipt;
      g_toss.key[count] = kRupeeGems[i].decode_key;
      count++;
      left -= kRupeeGems[i].value;
    }
  }
  return count;
}

/**
 * The receipt id of gem |index| of the decomposition of |amount|, largest first, or -1
 * past the last gem. Pure — no queue, no spawn — so the probe harness can pin the same
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

// Fill the pond's slots with |n| gems drawn as receipt |receipt|, laid out the way the
// vendored spawn lays out its five-rupee group: the slots count down from the top, the
// same start position, the same arcs.
static void SpawnVolley(int n, uint8 receipt) {
  static const int8 kTossXvel[POND_GEM_SLOTS] = {0, -12, -6, 6, 12, -9, -5, 0, 5, 9};
  static const int8 kTossYvel[POND_GEM_SLOTS] = {-40, -40, -40, -40, -40, -32, -32, -32, -32, -32};
  static const int8 kTossZvel[POND_GEM_SLOTS] = {20, 20, 20, 20, 20, 16, 16, 16, 16, 16};
  memset(happiness_pond_arr1, 0, POND_GEM_SLOTS);
  int x = link_x_coord + 4, y = link_y_coord - 12;
  for (int i = 0; i < n; i++) {
    int slot = POND_GEM_SLOTS - 1 - i;
    happiness_pond_arr1[slot] = 1;
    happiness_pond_z_vel[slot] = kTossZvel[i];
    happiness_pond_y_vel[slot] = kTossYvel[i];
    happiness_pond_x_vel[slot] = kTossXvel[i];
    happiness_pond_z[slot] = 0;
    happiness_pond_step[slot] = 0;
    happiness_pond_timer[slot] = 16;
    happiness_pond_item_to_link[slot] = receipt;
    happiness_pond_x_lo[slot] = (uint8)x;
    happiness_pond_x_hi[slot] = (uint8)(x >> 8);
    happiness_pond_y_lo[slot] = (uint8)y;
    happiness_pond_y_hi[slot] = (uint8)(y >> 8);
  }
}

// Decode the sheet this volley draws from and pick the receipt id its gems carry.
static uint8 PrepareVolleyArt(uint8 receipt) {
  uint8 item = receipt, pal = 0;
  if (GameHook_ColoredRupeeGem(receipt, &item, &pal)) {
    DecodeAnimatedSpriteTile_variable(kReceiveItemGfx[item]);
    GameHook_RecolorRupeeGem(receipt);
    return SmallGemForRow(pal);
  }
  DecodeAnimatedSpriteTile_variable(kReceiveItemGfx[receipt]);
  return receipt;
}

// Spawn the next run of queued gems sharing a decode key. False when the queue is empty.
static bool SendNextVolley(void) {
  if (g_toss.sent >= g_toss.count) return false;
  uint8 key = g_toss.key[g_toss.sent], receipt = g_toss.receipt[g_toss.sent];
  int n = 0;
  while (g_toss.sent + n < g_toss.count && n < POND_GEM_SLOTS && g_toss.key[g_toss.sent + n] == key) n++;
  SpawnVolley(n, PrepareVolleyArt(receipt));
  g_toss.sent = (uint8)(g_toss.sent + n);
  return true;
}

/**
 * The spawn seam (ai state 3): show |amount| as the gems that add up to it. False when
 * no plan is open, so the vendored five-rupee spawn runs instead.
 */
bool GameHook_PondTossRupees(int amount) {
  if (!GameHook_PondPlanOpen()) return false;
  g_toss.count = (uint8)DecomposeRupees(amount);
  g_toss.sent = 0;
  if (g_toss.count == 0) return true;
  int k = Ancilla_AddAncilla(0x42, 9);
  if (k < 0) return true;
  sound_effect_2 = Link_CalculateSfxPan() | 0x13;
  link_state_bits = 0x80;
  link_picking_throw_state = 0;
  link_direction_facing = 0;
  link_animation_steps = 0;
  SendNextVolley();
  printf("[Randomizer] Pond toss: %d rupees as %d gems\n", amount, g_toss.count);
  return true;
}

/**
 * The keep-alive seam (the pond's own flying-gem ancilla, once its slots are all spent):
 * refill them with the next volley instead of ending. False lets the ancilla end.
 */
bool GameHook_PondTossNextVolley(void) {
  return GameHook_PondPlanOpen() && SendNextVolley();
}

// How many volleys |amount| leaves in: one per run of gems sharing a decode key, split
// again whenever a run outgrows the pond's slots. Counted without touching the queue,
// because the delay is set before the toss is armed.
static int VolleysOf(int amount) {
  int left = amount > 0 ? amount : 0, volleys = 0, small = 0;
  for (int i = 0; i < RUPEE_GEM_COUNT; i++) {
    int n = left / kRupeeGems[i].value;
    left %= kRupeeGems[i].value;
    // The three small values share a sheet, so they add up into one run of their own.
    if (kRupeeGems[i].decode_key == 0) small += n;
    else if (n > 0) volleys += (n + POND_GEM_SLOTS - 1) / POND_GEM_SLOTS;
  }
  if (small > 0) volleys += (small + POND_GEM_SLOTS - 1) / POND_GEM_SLOTS;
  return volleys > 0 ? volleys : 1;
}

// How long the purchase state waits before the fairy rises: long enough for every volley
// to land. |vanilla| back when no plan is open, and the wait is capped at the byte the
// vendored delay field holds.
int GameHook_PondTossDelay(int vanilla) {
  if (!GameHook_PondPlanOpen()) return vanilla;
  int frames = vanilla * VolleysOf(GameHook_PondThrowAmount(0));
  return frames > 255 ? 255 : frames;
}
