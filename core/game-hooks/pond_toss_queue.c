/* @layer core-game-hooks @kind native */
// The flying-gem queue: every picture a pond payment sends into the water, whatever it is paid
// in. The pond's own flying-gem ancilla (0x42) carries ten slots, and each slot draws the
// receipt it names (Ancilla_ReceiveItem_Draw through WishPondItem_Draw), so a slot can hold a
// rupee, a bomb or an arrow alike.
//
// Only one sprite sheet is decoded at a time, so pictures needing different sheets cannot be in
// the air together. The queue therefore leaves in VOLLEYS: pictures sharing a decode key travel
// as one group, at most a slot-full, and the next group is spawned when the previous one has
// splashed (GameHook_PondTossNextVolley, called by the ancilla once its slots are spent).
//
// Gate: the seam answers only while a planned pond owns the visit (GameHook_PondTossOwned), so
// with every plan down the ancilla ends exactly where the vendored one does.
#include "game_hooks_internal.h"
#include "pond_toss.h"
#include "src/ancilla.h"
#include "src/load_gfx.h"

// The queue of pictures still to leave, and where the next volley starts in it.
static struct {
  uint8 count;
  uint8 sent;
  uint8 receipt[POND_GEM_MAX];
  uint8 key[POND_GEM_MAX];
} g_toss;

void PondTossQueueClear(void) {
  g_toss.count = 0;
  g_toss.sent = 0;
}

void PondTossQueuePush(uint8 receipt, uint8 key) {
  if (g_toss.count >= POND_GEM_MAX) return;
  g_toss.receipt[g_toss.count] = receipt;
  g_toss.key[g_toss.count] = key;
  g_toss.count++;
}

int PondTossQueueCount(void) {
  return g_toss.count;
}

int PondTossQueueSent(void) {
  return g_toss.sent;
}

int PondTossVolleysOfRun(int count) {
  return (count + POND_GEM_SLOTS - 1) / POND_GEM_SLOTS;
}

// Fill the pond's slots with the |n| queued pictures from |base|, each under its own receipt,
// laid out the way the vendored spawn lays out its five-rupee group: the slots count down from
// the top, the same start position, the same arcs.
static void SpawnVolley(int base, int n) {
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
    happiness_pond_item_to_link[slot] = g_toss.receipt[base + i];
    happiness_pond_x_lo[slot] = (uint8)x;
    happiness_pond_x_hi[slot] = (uint8)(x >> 8);
    happiness_pond_y_lo[slot] = (uint8)y;
    happiness_pond_y_hi[slot] = (uint8)(y >> 8);
  }
}

// Decode the sheet this volley draws from. A rupee under coloured rupees reads the one gem
// sheet, and pond_gem_tiles.c then lays the second picture beside it and borrows the violet row,
// so a whole volley of mixed gems is served by a single decode. Anything else is its own
// receipt's picture, decoded the way the vendored spawn decodes it.
static void PrepareVolleyArt(uint8 receipt) {
  uint8 item = receipt, pal = 0;
  if (GameHook_ColoredRupeeGem(receipt, &item, &pal)) {
    DecodeAnimatedSpriteTile_variable(kReceiveItemGfx[item]);
    GameHook_PondGemPrepareArt();
    return;
  }
  DecodeAnimatedSpriteTile_variable(kReceiveItemGfx[receipt]);
}

bool PondTossQueueNext(void) {
  if (g_toss.sent >= g_toss.count) return false;
  uint8 key = g_toss.key[g_toss.sent];
  int n = 0;
  while (g_toss.sent + n < g_toss.count && n < POND_GEM_SLOTS && g_toss.key[g_toss.sent + n] == key) n++;
  PrepareVolleyArt(g_toss.receipt[g_toss.sent]);
  SpawnVolley(g_toss.sent, n);
  g_toss.sent = (uint8)(g_toss.sent + n);
  return true;
}

// The spawn itself: the pond's flying-gem ancilla, the sound and the throw pose the vendored
// spawn sets, then the first volley. An ancilla table with no room shows nothing and takes
// nothing back, which is what the vendored spawn does too.
bool PondTossQueueLaunch(void) {
  if (g_toss.count == 0) return false;
  int k = Ancilla_AddAncilla(0x42, 9);
  if (k < 0) return true;
  sound_effect_2 = Link_CalculateSfxPan() | 0x13;
  link_state_bits = 0x80;
  link_picking_throw_state = 0;
  link_direction_facing = 0;
  link_animation_steps = 0;
  PondTossQueueNext();
  return true;
}

/**
 * The keep-alive seam (the pond's own flying-gem ancilla, once its slots are all spent): refill
 * them with the next volley instead of ending. False lets the ancilla end.
 */
bool GameHook_PondTossNextVolley(void) {
  if (GameHook_PondTossOwned() && PondTossQueueNext()) return true;
  GameHook_PondGemReleaseArt();
  return false;
}
