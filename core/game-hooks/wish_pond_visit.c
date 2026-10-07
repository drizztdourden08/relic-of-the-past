/* @layer core-game-hooks @kind native */
// The seams a planned visit to an item-throwing water runs through, in handler order. The rung
// tables, the lines and the counters they read are wish_pond_plan.c.
//
// A planned visit, by ai state of Sprite_WishPond3:
//   0   contact, EDGE triggered: the player has to be out of the water for a frame before the
//       pond answers again, since none of the three outcomes below puts a box the player must
//       clear first. A rung that asks for a demand puts the demand's yes/no question in place of the
//       contact line (state 1). Any other rung left skips the contact line, its yes/no, the item
//       menu and the toss, holds the player and goes straight to the rise (state 3). A spent
//       water shows its closing line and stays at state 0.
//   1   the answer to a demand. No keeps the vendored refusal. Yes from a player who cannot pay
//       shows what she wants and ends the visit; yes from one who can takes the payment, throws
//       it in and goes to the rise (state 3). The shared visit is pond_demand_visit.c.
//   3-4 the vendored rise and palette animation, held until a thrown payment has splashed. At
//       the end of it the award line stands in for the vendored question, and the answer the
//       next state reads is fixed at yes.
//   5   the vendored answer test, which the fixed answer sends to state 6.
//   6   the branch list is skipped whole.
//   7-8 the vendored fade, which sends the fairy away.
//   9   exactly one rung is handed over, on one receipt that carries its line.
//   10  vendored: back to state 0 with the vendored pause. The branch table's closing line reads
//       sprite_head_dir, which the contact seam parked at 0, so no line shows. The next rung
//       waits for the next contact.
//
// Every seam returns false with the gate down or no plan armed for this water, and the caller
// then runs its own vendored code.
//
// Every beat a seam here takes over puts a box up, with a vendored line standing in when the
// host composed none. The handler is only held between beats while a box is open
// (Sprite_ReturnIfInactive reads submodule_index), so a silent beat runs the whole rest of the
// visit off in a handful of frames.
#include "game_hooks_internal.h"
#include "src/player.h"
#include "src/sprite.h"

// The vendored pause a water takes after a refusal before it answers contact again.
#define WISH_POND_REST 255
// The wait per volley of a thrown payment, the rupee pond's own.
#define WISH_POND_TOSS_WAIT 80

// The vendored lines that stand in when the host composed none, so every beat this file takes
// from the handler still leaves a box on screen: the water's own decline line, and the plain
// line she says when she hands something over. Neither puts a question, which is why these two
// and not the vendored expressions at the same beats, both of which ask one a plan never puts.
#define WISH_POND_DECLINE_MSG 0x14b
#define WISH_POND_GIFT_MSG 0x8c
// The vendored contact question, the stand-in for a demand with no composed ask.
#define WISH_POND_ASK_MSG 0x14a

/**
 * The contact latch: set when a visit begins, cleared on the first frame the player is not
 * touching the water. All three outcomes a planned water can have at contact run without a box
 * to answer first, so without this a player standing in the water would take rung after rung,
 * one every rest, with no input at all. The vendored pond is safe standing still because it
 * always puts a question up first, and this leaves that untouched: the latch is written only
 * while a plan owns the water.
 *
 * sprite_G is the slot's own spare scratch, and a one-shot flag is what the decompiled game
 * keeps there (sprite_main.c Soldier_Func12). No pond handler reads or writes it, the slot's
 * init zeroes it when a room loads, and it is WRAM, so a save state carries it like every other
 * sprite byte and no save byte is spent.
 *
 * The pond can only SEE the player leave on a frame it runs, and it sleeps through its own rest
 * (the vendored state 0 returns early while sprite_delay_main stands), so a player who steps out
 * and back in inside that rest is still latched and has to step out once more. That errs toward
 * never firing unasked, which is the point.
 */
#define wish_pond_visited sprite_G

// Show one beat's line: the host's when it composed one, the vendored |stand_in| when it did
// not. It always puts a box up, and that is the whole point of the function, since the box is
// what holds the handler between beats (see the file header).
static void ShowLine(int msg, uint16 stand_in) {
  Sprite_ShowMessageUnconditional(msg >= 0 ? (uint16)msg : stand_in);
}

// Hand over the rung about to be taken, as ONE receipt.
//
// A rung on a water's own vanilla slot grants that slot's vanilla id untouched: the receive
// seam's table substitutes the placed item, arms its line and marks the check.
//
// An assigned rung carries the placed item, so it takes the capacity pond's prize path: its
// line is armed on the receipt (never a box of its own ahead of it), a virtual id resolves to
// the native item it hands over (a progressive family's next tier, a capacity or wallet climb,
// a prize crystal) so nothing past the receipt arrays reaches them, and the table is kept off
// the grant because an assigned id can collide with a key it holds.
static bool GrantRung(void) {
  int new_item = 0, msg = -1;
  bool assigned = false;
  if (!GameHook_WishPondTakeRung(&new_item, &msg, &assigned)) return false;
  item_receipt_method = 2;
  if (!assigned) {
    Link_ReceiveItem((uint8)new_item, 0);
    return true;
  }
  if (msg >= 0) GameHook_ArmReceiptMessageIfClear(msg);
  uint8 grant = GameHook_ResolvePrizeItem(GameHook_ResolveGrantItem((uint8)new_item));
  if (msg < 0) GameHook_ArmReceiptClassMessage(grant, kReceiptMsg_Generic);
  GameHook_NpcOverrideBypassOnce();
  Link_ReceiveItem(grant, 0);
  printf("[Randomizer] Wish pond assigned rung: 0x%02x -> receipt 0x%02x (msg %d)\n", new_item, grant, msg);
  return true;
}

// The three sprite fields the vendored item toss would write are parked, because the states
// after it read all three and ONE sprite slot serves every visit in the room:
//   sprite_C  ai state 7 hands inventory slot 3 back its old count when this names slot 3.
//             Zero names slot 0, so that restore does nothing at all.
//   sprite_D  the count that restore would write. Unread with sprite_C off slot 3.
//   sprite_graphics  the thrown item id, which the held-item draw and the branch list read.
//             Both are diverted under a plan, and zero is what the field holds before a throw.
static void FaceTheWater(int k) {
  Link_ResetProperties_A();
  link_direction_facing = 0;
  sprite_head_dir[k] = 0;
  sprite_C[k] = 0;
  sprite_D[k] = 0;
  sprite_graphics[k] = 0;
}

// The contact seam (ai state 0, after the vendored busy test). True means the plan owns the
// contact and the vendored contact line is skipped.
bool GameHook_WishPondContact(int k) {
  if (!GameHook_WishPondPlanOpen()) return false;
  if (!Sprite_CheckDamageToLink_same_layer(k)) {
    wish_pond_visited[k] = 0;
    return true;
  }
  if (link_auxiliary_state == 2 || wish_pond_visited[k]) return true;
  wish_pond_visited[k] = 1;
  if (GameHook_PondVisitAsks()) {
    // The vendored contact shape, with the demand's question in place of its line.
    ShowLine(GameHook_PondVisitQuestion(WISH_POND_ASK_MSG), WISH_POND_ASK_MSG);
    FaceTheWater(k);
    sprite_ai_state[k] = 1;
    return true;
  }
  if (GameHook_WishPondRungIndex() < 0) {
    ShowLine(GameHook_WishPondClosedMessage(), WISH_POND_DECLINE_MSG);
    sprite_delay_main[k] = WISH_POND_REST;
    return true;
  }
  FaceTheWater(k);
  // The vendored accepting answer holds the player for the whole scene, and it is skipped
  // along with the question, so the hold is taken here.
  flag_is_link_immobilized = 1;
  sprite_ai_state[k] = 3;
  return true;
}

// The answer seam (ai state 1): a yes to a demand's question. True means the plan owns the
// answer; a no, and any rung that asked nothing, keep the vendored branch.
bool GameHook_WishPondAnswer(int k) {
  if (!GameHook_WishPondPlanOpen() || choice_in_multiselect_box != 0 || !GameHook_PondVisitAsks()) return false;
  if (!GameHook_PondVisitCanPay()) {
    ShowLine(GameHook_PondVisitRefusal(WISH_POND_DECLINE_MSG), WISH_POND_DECLINE_MSG);
    sprite_ai_state[k] = 0;
    sprite_delay_main[k] = WISH_POND_REST;
    return true;
  }
  // The rise waits on this delay and on the payment splashing (GameHook_PondTossStillFlying).
  sprite_delay_main[k] = (uint8)GameHook_PondVisitTossDelay(WISH_POND_TOSS_WAIT);
  GameHook_PondVisitPay();
  flag_is_link_immobilized = 1;
  sprite_ai_state[k] = 3;
  return true;
}

// The rise seam (ai state 4, once the palette has settled): the award line in place of the
// vendored question. The answer box the next state reads is fixed at yes, since no question
// was put. A rung that was paid for may carry its own award line. True means the vendored
// line is skipped.
bool GameHook_WishPondRiseLine(void) {
  if (!GameHook_WishPondPlanOpen()) return false;
  choice_in_multiselect_box = 0;
  ShowLine(GameHook_PondVisitAwardMessage(GameHook_WishPondAwardMessage()), WISH_POND_GIFT_MSG);
  return true;
}

// The held-item seam (WishPond2_Draw, ai states 5, 6, 11 and 12): nothing was thrown, so the
// fairy holds nothing up. True draws nothing there.
bool GameHook_WishPondHidesHeldItem(int k) {
  (void)k;
  return GameHook_WishPondPlanOpen();
}

// The branch seam (ai state 6): the vendored branch list reads the thrown item to pick an
// upgrade family, so a planned water skips it whole.
bool GameHook_WishPondPlanTakes(int k) {
  (void)k;
  return GameHook_WishPondPlanOpen();
}

// The receipt seam (ai state 9): the one rung of this visit. True means the plan owns the
// receipt, and the vendored grant of the thrown item is skipped. A planned water with no rung
// left hands over nothing here; it never falls back to that grant, whose item would be the
// parked zero.
bool GameHook_WishPondGrant(int k) {
  (void)k;
  GameHook_WishPondClearRungInFlight();
  if (!GameHook_WishPondPlanOpen()) return false;
  GrantRung();
  return true;
}
