/* @layer core-game-hooks @kind native */
// The rupee pond's plan: what each throw costs, and what it hands back.
//
// Vanilla, the pond takes 5, 20, 25 or 50 rupees a throw, banks them, and lets a fairy
// rise every hundred to sell one capacity level. Under a plan the pond instead sells a
// numbered SEQUENCE of throws: throw t costs price[t], paid in a single toss, and the
// fairy rises on every one of them. What the fairy then hands over is the entry's own
// business — the seed's next pool item, a consolation, or the capacity level the vanilla
// branch would have sold (scripted_grants.c owns that half, so the substitution keeps
// going through the one path it always has).
//
// Every hook here answers to kFeatures3_PondPlan and to the host having armed a plan;
// with either missing each one hands back exactly the value the vendored expression
// already computed, so the pond's own code runs byte-for-byte as it always did.
//
// Three of the pond's own lines are the host's under a plan, because the vendored ones
// state amounts a plan does not charge: the cost prompt (vanilla offers a choice between
// two native prices), the consolation (vanilla promises a flat hundred back), and the
// refusal shown to an EXHAUSTED pond (vanilla invites the player back to a pond that will
// never sell again). Each is a pre-rendered message id or -1, and -1 everywhere leaves
// the vanilla wording in place, so a plan is playable with no composed dialogue at all.
//
// Save bytes — one counter of throws taken, allocated in save_bytes.h (THE registry).
// That single counter is the whole persistence: a prize sits at a known throw index and
// the counter never rewinds, so no prize can be handed out twice and the pond cannot be
// farmed. Zero on a vanilla file, and a vanilla read of the same file sees a byte it
// never looks at.
#include "game_hooks_internal.h"
#include "save_bytes.h"
#include "src/sprite.h"

#define POND_MAX_THROWS 20
#define POND_MAX_PRIZES 20

// The price of a throw the pond no longer sells: above any wallet, so the handler takes
// its own "come back another time" branch and the pond quietly closes. Never charged.
#define POND_CLOSED_COST 0x7FFF

// What one throw fills the pond's bank with. The vendored handler compares that bank
// against 100 and drains 100 from it, so a plan throw pays its whole price at once and
// the fairy rises on every throw, with the vendored arithmetic left exactly as written.
#define POND_POOL_FILL 100

#define srm_pond_throws (*(uint8 *)(g_ram + SRM_POND_THROWS))

typedef struct {
  int16 price;
  int8 prize;    // prize ordinal this throw hands over; -1 = it sells a capacity level
  int16 refund;  // rupees handed back when it wins nothing; always below the price
  int16 prompt;  // host line announcing the price, or -1 for no prompt at all
  int16 consolation;  // host line for a throw that wins nothing, or -1 for the vanilla one
} PondThrow;

static struct {
  uint8 armed;
  uint8 count;
  // Host line an EXHAUSTED pond shows, or -1 for the vanilla come-back-later
  // refusal. Deliberately not memset-cleared to zero: -1 is the empty value, so
  // the clear below writes it back explicitly.
  int16 closed_msg;
  PondThrow entry[POND_MAX_THROWS];
} g_pond = {.closed_msg = -1};

typedef struct { uint8 armed; uint8 new_item; int16 msg; int16 fire_id; } PondPrize;

static PondPrize g_pond_prize[POND_MAX_PRIZES];

bool GameHook_PondPlanOpen(void) {
  return (enhanced_features3 & kFeatures3_PondPlan) != 0 && g_pond.armed && g_pond.count > 0;
}

// The throw about to be paid for; count and above means the pond has nothing left.
int GameHook_PondThrowIndex(void) {
  return GameHook_PondPlanOpen() ? srm_pond_throws : -1;
}

static const PondThrow *CurrentThrow(void) {
  int index = GameHook_PondThrowIndex();
  return (index >= 0 && index < g_pond.count) ? &g_pond.entry[index] : NULL;
}

// The cost prompt seam (ai state 1): the plan announces its one price instead of the
// vanilla two-choice line, so the choice box the next state reads is never opened and
// its value stays whatever the contact question left. False leaves the vanilla line.
bool GameHook_PondPromptOverride(void) {
  const PondThrow *entry = CurrentThrow();
  if (entry == NULL) return GameHook_PondPlanOpen();
  if (entry->prompt >= 0) Sprite_ShowMessageUnconditional((uint16)entry->prompt);
  return true;
}

// The refusal seam: the line shown when the purchase does not happen. Vanilla has ONE
// line for both refusals — "come back another time" — which is right for a wallet that
// cannot pay yet and wrong for a pond that will never sell again, so only the exhausted
// case is replaced. |vanilla| back whenever a throw is still on the table.
int GameHook_PondLaterMessage(int vanilla) {
  if (!GameHook_PondPlanOpen() || CurrentThrow() != NULL) return vanilla;
  return g_pond.closed_msg >= 0 ? g_pond.closed_msg : vanilla;
}

// The affordability seam (ai state 2): what this throw really costs. |vanilla| back
// unless a plan is open; an exhausted pond names a price no wallet holds, which sends
// the handler down its own "come back another time" branch and closes the pond for good.
int GameHook_PondThrowCost(int vanilla) {
  if (!GameHook_PondPlanOpen()) return vanilla;
  const PondThrow *entry = CurrentThrow();
  return entry == NULL ? POND_CLOSED_COST : entry->price;
}

// The payment seam (ai state 3): the amount actually taken from the wallet and shown
// flying in. The handler stashed the cost in a sprite BYTE, so the price is read back
// from the plan rather than from that stash; |stored| back when no plan is open.
int GameHook_PondThrowAmount(int stored) {
  const PondThrow *entry = CurrentThrow();
  return entry == NULL ? stored : entry->price;
}

// The consolation line of the throw about to be resolved, without resolving it: -1 for
// the vanilla line, -3 when no plan owns this throw. Read-only, so a harness can pin the
// line a losing throw will show before the counter moves.
int GameHook_PondConsolationMessage(void) {
  const PondThrow *entry = CurrentThrow();
  return entry == NULL ? -3 : entry->consolation;
}

// What the throw adds to the pond's own bank. A plan throw fills it exactly, so the
// vendored ">= 100 then drain 100" test rises the fairy on every throw; |amount| back
// (the vanilla accumulation) when no plan is open.
int GameHook_PondPoolAdd(int amount) {
  return CurrentThrow() == NULL ? amount : POND_POOL_FILL;
}

/**
 * Resolve the throw that was just paid for and advance the counter. Returns false when
 * no plan owns this purchase. |prize| is the ordinal to hand over or -1, |refund| the
 * consolation in rupees (0 when there is none), |msg| the host line that consolation
 * shows (-1 for the vanilla one).
 */
bool GameHook_PondTakeThrow(int *prize, int *refund, int *msg) {
  const PondThrow *entry = CurrentThrow();
  if (entry == NULL) return false;
  *prize = entry->prize;
  *refund = entry->refund;
  *msg = entry->consolation;
  if (srm_pond_throws < POND_MAX_THROWS) srm_pond_throws++;
  return true;
}

// The armed grant of prize ordinal |prize|, or false when the seed left that slot empty.
bool GameHook_PondPrizeSlot(int prize, int *new_item, int *msg, int *fire_id) {
  if (prize < 0 || prize >= POND_MAX_PRIZES || !g_pond_prize[prize].armed) return false;
  *new_item = g_pond_prize[prize].new_item;
  *msg = g_pond_prize[prize].msg;
  *fire_id = g_pond_prize[prize].fire_id;
  return true;
}

// Record-only setters, the shared contract: gates latch a frame after the host writes
// them, so they are enforced at the application sites above, never here.
EMSCRIPTEN_KEEPALIVE
void WasmSetPondThrow(int index, int price, int prize, int refund, int prompt, int consolation) {
  if (index < 0 || index >= POND_MAX_THROWS) return;
  g_pond.entry[index] =
      (PondThrow){(int16)price, (int8)prize, (int16)refund, (int16)prompt, (int16)consolation};
  if (index >= g_pond.count) g_pond.count = (uint8)(index + 1);
  g_pond.armed = 1;
  printf("[Randomizer] Pond throw %d: %d rupees, prize %d, refund %d\n", index, price, prize, refund);
}

// The line an emptied pond shows; -1 keeps the vanilla come-back-later refusal.
EMSCRIPTEN_KEEPALIVE
void WasmSetPondClosedMessage(int msg) {
  g_pond.closed_msg = (int16)msg;
  printf("[Randomizer] Pond closing line: msg %d\n", msg);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetPondPrize(int prize, int new_item, int msg, int fire_id) {
  if (prize < 0 || prize >= POND_MAX_PRIZES) return;
  g_pond_prize[prize] = (PondPrize){1, (uint8)new_item, (int16)msg, (int16)fire_id};
  printf("[Randomizer] Armed pond prize %d -> 0x%02x\n", prize, new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearPondPlan(void) {
  memset(&g_pond, 0, sizeof(g_pond));
  g_pond.closed_msg = -1;
  memset(g_pond_prize, 0, sizeof(g_pond_prize));
  printf("[Randomizer] Cleared the pond plan\n");
}

// Raw read of the throw counter for the progress buffer and the probes (gated by its
// caller); the host uses it to know how much of the pond a file has already spent.
uint8 GameHook_PondThrowsTaken(void) {
  return srm_pond_throws;
}

EMSCRIPTEN_KEEPALIVE
int WasmPondThrowsTaken(void) {
  return srm_pond_throws;
}
