/* @layer core-game-hooks @kind native */
// The rupee pond's plan: what each throw costs, and what it hands back.
//
// Vanilla, the pond takes 5, 20, 25 or 50 rupees a throw, banks them, and lets a fairy
// rise every hundred to sell one capacity level. Under a plan the pond instead sells a
// numbered SEQUENCE of throws: throw t costs price[t], paid in a single toss, and the
// fairy rises on every one of them. What the fairy then hands over is the entry's own
// business: the seed's next pool item, a consolation, or the capacity level the vanilla
// branch would have sold (scripted_grants.c owns that half, so the substitution keeps
// going through the one path it always has).
//
// Every hook here answers to kFeatures3_PondPlan and to the host having armed a plan;
// with either missing each one hands back exactly the value the vendored expression
// already computed, so the pond's own code runs byte-for-byte as it always did.
//
// Several of the pond's own lines are the host's under a plan, because the vendored ones
// state amounts a plan does not charge or ask a question a plan does not put: the cost
// prompt (vanilla offers a choice between two native prices), the consolation (vanilla
// promises a flat hundred back), the refusal shown to an EXHAUSTED pond (vanilla invites
// the player back to a pond that will never sell again), and the award line of a throw
// that hands over a pool item (vanilla asks which capacity family to climb, which a pool
// item does not answer to). That last one comes in two versions, one for a water that
// still holds a prize and one for the throw that took the final one, because a player who
// is not told stops guessing and stops coming back. Each is a pre-rendered message id or
// -1, and -1 everywhere leaves the vanilla wording in place, so a plan is playable with no
// composed dialogue at all: the cost prompt then falls back to the vendored line with the
// plan's own price in its digits (GameHook_PondCostDigits), never to silence.
//
// Save bytes: one counter of throws taken, allocated in save_bytes.h (THE registry).
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
// its own "come back another time" branch and the pond closes. Never charged.
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
  // Host lines shown in place of the vanilla capacity question when the throw hands over
  // a pool item, or -1 to keep that question. Two of them, because the line also tells the
  // player whether the water still holds something: |award_more| while a later throw still
  // carries a prize, |award_last| when this one was the last. Same empty value as above.
  int16 award_more;
  int16 award_last;
  PondThrow entry[POND_MAX_THROWS];
} g_pond = {.closed_msg = -1, .award_more = -1, .award_last = -1};

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

// True while a throw PAST |index| still hands over a pool item: what the award line reads
// to say whether the water has anything left after the one it is announcing.
static bool MorePrizesAfter(int index) {
  for (int i = index + 1; i < g_pond.count; i++) {
    if (g_pond.entry[i].prize >= 0) return true;
  }
  return false;
}

// The cost prompt seam (ai state 1): the plan announces its one price instead of the
// vanilla two-choice line, so the choice box the next state reads is never opened and its
// value stays whatever the contact question left. False leaves the vanilla line, which is
// what a throw with no composed prompt takes: showing nothing there would drop a box the
// player's rhythm rests on, and the vanilla line now quotes the plan's own price
// (GameHook_PondCostDigits) instead of two native amounts nobody is charged. An EXHAUSTED
// pond keeps the seam closed: its price is unpayable, so the refusal is the only box.
bool GameHook_PondPromptOverride(void) {
  const PondThrow *entry = CurrentThrow();
  if (entry == NULL) return GameHook_PondPlanOpen();
  if (entry->prompt < 0) return false;
  Sprite_ShowMessageUnconditional((uint16)entry->prompt);
  return true;
}

/**
 * The digits the vanilla cost prompt shows, |vanilla| being the BCD byte the vendored line
 * would have quoted. A plan charges ONE price, so every slot of that line states it.
 *
 * The ceiling is two digits: each [Number] command renders one nibble of one
 * dialogue_number byte (messaging.c Text_LoadCharacterBuffer), and the baked line spends
 * exactly two of them per amount, so a price of 100 or more cannot be stated there at all.
 * Above that the vendored digits stand and the plan's own composed prompt, which carries
 * the price as text and has no digit budget, is the line that states it.
 */
int GameHook_PondCostDigits(int vanilla) {
  const PondThrow *entry = CurrentThrow();
  if (entry == NULL) return vanilla;
  int price = entry->price;
  return price >= 0 && price <= 99 ? (price / 10) * 16 + (price % 10) : vanilla;
}

// The award seam (ai state 6, after the fairy has risen): vanilla asks which capacity
// family to climb, a question a pool item cannot answer, so a throw carrying a prize
// announces the prize instead and the choice the next state reads is fixed at the
// vanilla first entry.
//
// ONE BOX FOR ONE BOX: the vendored line is a single selection box, and the host line is
// a single box too, so the purchase keeps exactly the confirmations it always had. That
// is also why -1 (nothing composed) keeps the vanilla line and its question instead of
// showing nothing: an empty seam would drop a confirmation the player's rhythm rests on.
//
// A throw that sells a capacity level keeps the vanilla question, because there the two
// families really are the choice being made.
//
// The line also says whether the water still holds something. That is read from the plan,
// not from a counter: the seam runs BEFORE the throw is resolved, so "still to come" means
// a later throw carrying a prize. A pond with none left says so through its closing line
// instead, on the next visit, so the two together cover every state the player can be in.
int GameHook_PondAwardMessage(void) {
  const PondThrow *entry = CurrentThrow();
  if (entry == NULL || entry->prize < 0) return -1;
  return MorePrizesAfter(GameHook_PondThrowIndex()) ? g_pond.award_more : g_pond.award_last;
}

bool GameHook_PondChoiceOverride(void) {
  int msg = GameHook_PondAwardMessage();
  if (msg < 0) return false;
  choice_in_multiselect_box = 0;
  Sprite_ShowMessageUnconditional((uint16)msg);
  return true;
}

/**
 * The wrap-up seam (ai states 9 and 10). The purchase ends by swapping the player's sprite
 * palette row with the room's own (Palette_AssertTranslucencySwap at state 9), fading over
 * roughly two seconds, and swapping it back at state 11. That swap writes the aux buffer as
 * well as the live one, so it is undone by exactly one thing: state 11 running. Vanilla can
 * rely on that, because it holds the player still from the moment the purchase begins and
 * never lets go until state 0.
 *
 * A plan breaks the hold. Its prize goes out through the receipt ceremony instead of a
 * message, and that ceremony's cleanup clears the immobilize flag on its way out
 * (ancilla.c, the generic branch a method-0 receipt takes), which vanilla's pond never
 * reaches. The player is then free to walk out of the room mid-fade, state 11 never runs,
 * and the room's colours stay in the player's palette row for good: in a cave-lit room they
 * read as brown. Putting the flag back is the whole fix, and it is what vanilla holds here
 * anyway, so the write is a no-op on a file the plan does not own.
 *
 * Gate: nothing is written unless a plan owns the pond.
 */
void GameHook_PondHoldPlayer(void) {
  if (!GameHook_PondPlanOpen()) return;
  flag_is_link_immobilized = 1;
}

// The refusal seam: the line shown when the purchase does not happen. Vanilla has ONE
// line for both refusals ("come back another time") which is right for a wallet that
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
// from the plan instead of from that stash; |stored| back when no plan is open.
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

// The two lines a prize throw shows in place of the vanilla capacity question: |more| when
// the water still holds a prize after this one, |last| when it does not. -1 for either
// keeps that question, and with it the two-way choice, for the throws it would answer.
EMSCRIPTEN_KEEPALIVE
void WasmSetPondAwardMessage(int more, int last) {
  g_pond.award_more = (int16)more;
  g_pond.award_last = (int16)last;
  printf("[Randomizer] Pond award lines: msg %d with more to come, msg %d for the last\n", more, last);
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
  g_pond.award_more = -1;
  g_pond.award_last = -1;
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
