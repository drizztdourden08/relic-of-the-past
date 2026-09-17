/* @layer core-game-hooks @kind native */
// The two item-throwing waters and the plan that can own them: the rung tables, the host
// lines and the throw counters. The handler seams that read them are wish_pond_visit.c.
//
// Vanilla, both waters run one handler (Sprite_WishPond3): the player throws one inventory
// item in, a fairy rises, and she either climbs one of five native upgrade branches or hands
// the thrown item straight back. Under a plan a pond instead holds a numbered LADDER of rungs,
// and each visit hands over the next one. The player throws nothing and answers nothing; she
// rises, says the host's award line, and the rung follows. A pond whose
// ladder is spent stays closed for good: talking to her shows the host's closing line and
// nothing else.
//
// Every hook answers to kFeatures4_WishPondPlan and to a rung table being armed for THAT
// water; with either missing each one hands back exactly the value the vendored expression
// already computed, so both ponds run byte-for-byte as they always did.
//
// Gate: kFeatures4_WishPondPlan, in the WRAM gate word instead of a host gate, because the
// GAME branches on it. A host gate would be invisible to a save state and would desynchronise
// a replay (host_gates.h states that rule).
//
// Save bytes: one counter of rungs taken PER POND, allocated in save_bytes.h (THE registry).
// Two counters and not one, because the waters hold separate ladders and a shared counter
// would let a visit to one spend the other's rung. Neither rewinds, so no rung pays out twice
// and a spent pond stays spent across reloads. Zero on a vanilla file, and a vanilla read of a
// file we wrote sees bytes it never looks at.
#include "game_hooks_internal.h"
#include "save_bytes.h"
#include "src/sprite.h"

// The two rooms the handler serves, in counter order: the water the light world's falls feed,
// then the dark world's. Every other room answers -1, so a plan can never reach a pond it was
// not written for, and the handler running anywhere else stays wholly vendored.
//
// A THIRD water shares the same sprite and is NOT one of these. Sprite_WishPond2 sends the room
// whose LOW BYTE is 21 to Sprite_HappinessPond, the rupee pond, which pond_plan.c owns under its
// own gate. The test here is the whole 16-bit room index and not that low byte, so no room can
// fall to both files.
#define WISH_POND_ROOM_LIGHT 276
#define WISH_POND_ROOM_DARK 278
#define WISH_POND_COUNT 2

// The longest ladder a water can carry, matching the host's own ceiling (pond-ladder.data.ts).
#define WISH_POND_MAX_RUNGS 20

#define srm_wish_pond_throws(pond) (*(uint8 *)(g_ram + SRM_WISH_POND_THROWS + (pond)))

// One rung: the receive id the fairy hands over, the line she shows with it (-1 shows none),
// and the id the host is told fired. -1 there leaves the report to the receive-seam table,
// which is how a rung standing on a water's own vanilla slot is counted exactly once.
//
// |assigned| says which of the two grants the rung is. Set, |new_item| is the placed item
// itself (virtual ids included), so the grant resolves it, arms |msg| on the receipt and
// keeps the receive-seam table off it. Clear, |new_item| is the slot's VANILLA id, and the
// table is what substitutes it and marks the check.
typedef struct {
  uint8 armed;
  uint8 assigned;
  uint8 new_item;
  int16 msg;
  int16 fire_id;
} WishPondRung;

// |award_msg| is the host line she says when she rises, |closed_msg| the one a spent pond
// shows. -1 is the empty value for both, and the beat then shows a plain vendored line instead
// of nothing (wish_pond_visit.c): the vendored EXPRESSIONS at those two beats ask questions a
// plan never puts, but a beat that shows no box at all does not hold the handler.
static struct {
  uint8 armed;
  uint8 count;
  int16 award_msg;
  int16 closed_msg;
  WishPondRung rung[WISH_POND_MAX_RUNGS];
} g_wish_pond[WISH_POND_COUNT] = {{.award_msg = -1, .closed_msg = -1},
                                  {.award_msg = -1, .closed_msg = -1}};

// Whether the grant now crossing the receive seam is a planned rung's. Set by the rung grant
// just before it starts its receipt, and cleared by the next pond grant (wish_pond_visit.c).
static uint8 g_rung_in_flight;

// Which pond the player is standing in, or -1 outside both. A plain position read: it states
// where the player is and nothing more, so it answers the same with the gate up or down.
int GameHook_WishPondHere(void) {
  if (!player_is_indoors) return -1;
  if (dungeon_room_index == WISH_POND_ROOM_LIGHT) return 0;
  if (dungeon_room_index == WISH_POND_ROOM_DARK) return 1;
  return -1;
}

// True while a plan owns the water the player is in, spent or not. A planned water never
// returns to its vendored branches, so this and not the rung left is what every seam tests.
bool GameHook_WishPondPlanOpen(void) {
  int pond = GameHook_WishPondHere();
  if (pond < 0 || !(enhanced_features4 & kFeatures4_WishPondPlan)) return false;
  return g_wish_pond[pond].armed && g_wish_pond[pond].count > 0;
}

// The rung about to be handed over, or -1 when no plan owns this water and when its ladder is
// spent. A rung the host left unarmed ends the ladder there.
int GameHook_WishPondRungIndex(void) {
  if (!GameHook_WishPondPlanOpen()) return -1;
  int pond = GameHook_WishPondHere();
  int index = srm_wish_pond_throws(pond);
  if (index >= g_wish_pond[pond].count || index >= WISH_POND_MAX_RUNGS) return -1;
  return g_wish_pond[pond].rung[index].armed ? index : -1;
}

// Take the rung about to be handed over: |new_item| its receive id, |msg| its line, |assigned|
// whether that id is the placed item. The pond's counter advances here, once per rung, so no
// rung is handed out twice. False when no rung is left, and nothing moves.
bool GameHook_WishPondTakeRung(int *new_item, int *msg, bool *assigned) {
  int index = GameHook_WishPondRungIndex();
  if (index < 0) return false;
  int pond = GameHook_WishPondHere();
  const WishPondRung *rung = &g_wish_pond[pond].rung[index];
  *new_item = rung->new_item;
  *msg = rung->msg;
  *assigned = rung->assigned != 0;
  srm_wish_pond_throws(pond)++;
  g_rung_in_flight = 1;
  GameHook_NotifyOverrideFired(rung->fire_id);
  printf("[Randomizer] Wish pond %d rung %d -> 0x%02x\n", pond, index, rung->new_item);
  return true;
}

// The host's award line for this water, or -1 (no plan, or no line composed).
int GameHook_WishPondAwardMessage(void) {
  return GameHook_WishPondPlanOpen() ? g_wish_pond[GameHook_WishPondHere()].award_msg : -1;
}

// The host's closing line for this water, or -1 (no plan, or no line composed).
int GameHook_WishPondClosedMessage(void) {
  return GameHook_WishPondPlanOpen() ? g_wish_pond[GameHook_WishPondHere()].closed_msg : -1;
}

void GameHook_WishPondClearRungInFlight(void) {
  g_rung_in_flight = 0;
}

// True while a planned rung's reward is crossing the receive seam. npc_overrides.c reads this
// to tell such a reward apart from the pond's own repeatable outcomes, which must never reach
// the substitution table: a rung skips the branch list, so it arrives with the sprite_head_dir
// of 0 that also marks the handed-back item, and only this flag separates the two.
bool GameHook_WishPondRungInFlight(void) {
  return g_rung_in_flight != 0;
}

// Raw read of one pond's counter for the progress buffer and the probes (gated by its caller);
// the host uses it to know how much of a water a file has already spent.
uint8 GameHook_WishPondThrowsTaken(int pond) {
  if (pond < 0 || pond >= WISH_POND_COUNT) return 0;
  return srm_wish_pond_throws(pond);
}

// Record-only setters, the shared contract: gates latch a frame after the host writes them, so
// they are enforced at the application sites, never here. One call per rung, in the order the
// water hands them over. An id past the 76 receipt entries that no resolver owns is refused,
// so it can never reach the receipt arrays.
EMSCRIPTEN_KEEPALIVE
void WasmArmWishPondPlan(int pond, int rung, int new_item, int msg, int fire_id, int assigned) {
  if (pond < 0 || pond >= WISH_POND_COUNT) return;
  if (rung < 0 || rung >= WISH_POND_MAX_RUNGS) return;
  uint8 item = (uint8)new_item;
  if (item >= 76 && !GameHook_IsVirtualGrantId(item) && !GameHook_IsPrizeGrantId(item)) {
    printf("[Randomizer] Wish pond %d rung %d refused: item 0x%02x has no receipt\n", pond, rung, new_item);
    return;
  }
  g_wish_pond[pond].rung[rung] = (WishPondRung){1, assigned != 0, item, (int16)msg, (int16)fire_id};
  if (rung >= g_wish_pond[pond].count) g_wish_pond[pond].count = (uint8)(rung + 1);
  g_wish_pond[pond].armed = 1;
  printf("[Randomizer] Armed wish pond %d rung %d -> 0x%02x (msg %d, %s)\n", pond, rung, new_item, msg,
         assigned ? "assigned" : "vanilla id");
}

// The two host lines of one water: |award| when she rises, |closed| once its ladder is spent.
// -1 for either keeps that beat on a vendored line, never on silence.
EMSCRIPTEN_KEEPALIVE
void WasmSetWishPondLines(int pond, int award, int closed) {
  if (pond < 0 || pond >= WISH_POND_COUNT) return;
  g_wish_pond[pond].award_msg = (int16)award;
  g_wish_pond[pond].closed_msg = (int16)closed;
  printf("[Randomizer] Wish pond %d lines: award msg %d, closing msg %d\n", pond, award, closed);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearWishPondPlan(void) {
  memset(g_wish_pond, 0, sizeof(g_wish_pond));
  for (int pond = 0; pond < WISH_POND_COUNT; pond++) {
    g_wish_pond[pond].award_msg = -1;
    g_wish_pond[pond].closed_msg = -1;
  }
  g_rung_in_flight = 0;
  printf("[Randomizer] Cleared the wish pond plan\n");
}

EMSCRIPTEN_KEEPALIVE
int WasmWishPondThrowsTaken(int pond) {
  return GameHook_WishPondThrowsTaken(pond);
}
