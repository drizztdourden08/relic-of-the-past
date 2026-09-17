/* @layer core-game-hooks @kind native */
// One demand visit for all three ponds. The rupee pond (Sprite_HappinessPond) and the two
// item-throwing waters (Sprite_WishPond3) run their own states, and each reaches this file
// through its own seams (pond_plan.c, wish_pond_visit.c), so a demand is named, tested, taken
// and thrown the same way wherever it is paid:
//
//   1  she names the demand in a yes/no box;
//   2  no: the visit ends on the pond's own refusal line, nothing is taken;
//   3  yes and the player cannot pay: she says what she wants and to come back with it;
//   4  yes and the player can pay: the payment is taken and thrown in, then she rises and hands
//      over the rung. An item is only SHOWN: its throw is drawn, the pack is never touched, and
//      her award line says she returns it with the gift.
//
// The rung is the prize the visit hands over: the current throw's prize ordinal at the rupee
// pond, the next rung of the ladder at a wish pond. The tests and the payment are the shelf's
// own (shop_payment.c), so a pond and a shelf charge a currency identically; the possession read
// an item needs is pond_demand_items.c, the throw pond_demand_toss.c.
//
// Gate: every answer runs through a plan being open for the pond the player stands in, under
// kFeatures3_PondPlan or kFeatures4_WishPondPlan. With neither, no rung asks and every seam
// hands back the value its caller passed in.
//
// State: none of its own. The demand, its lines and the rung index are all read afresh on every
// call, so a save state taken mid-visit carries nothing this file would have to restore.
#include "game_hooks_internal.h"
#include "pond_toss.h"
#include "shop_payment.h"

// The longest a handler's wait byte holds.
#define POND_VISIT_MAX_DELAY 255

bool GameHook_PondTossOwned(void) {
  return GameHook_PondPlanOpen() || GameHook_WishPondPlanOpen();
}

// The demand the visit's rung asks, and its lines. False when no rung asks.
static bool VisitDemand(PondDemand *demand, PondDemandLines *lines) {
  int water = GameHook_WishPondHere();
  int pond = water >= 0 ? water + 1 : kPondDemandPond_Capacity;
  int rung = water >= 0 ? GameHook_WishPondRungIndex() : GameHook_PondThrowPrize();
  if (rung < 0 || !GameHook_PondDemand(pond, rung, demand)) return false;
  // The rupee pond's own price flow already charges this throw its price.
  if (pond == kPondDemandPond_Capacity && demand->kind == kPondDemand_Rupees) return false;
  GameHook_PondDemandLines(pond, rung, lines);
  return true;
}

static bool CanPay(const PondDemand *demand) {
  if (demand->kind == kPondDemand_Item) return PondItemHeld(demand->native_id);
  // A bottle demand counts bottles of the content it names, which no shelf does.
  if (demand->kind == kPondDemand_Bottle) {
    return ShopBottlesHeld(demand->native_id) >= PondDemandBottles(demand);
  }
  return ShopCanPay((uint8)(demand->kind - 1), demand->amount);
}

bool GameHook_PondVisitAsks(void) {
  PondDemand demand;
  PondDemandLines lines;
  return VisitDemand(&demand, &lines);
}

int GameHook_PondVisitQuestion(int vanilla) {
  PondDemand demand;
  PondDemandLines lines;
  if (!VisitDemand(&demand, &lines)) return vanilla;
  return lines.ask >= 0 ? lines.ask : vanilla;
}

bool GameHook_PondVisitCanPay(void) {
  PondDemand demand;
  PondDemandLines lines;
  return VisitDemand(&demand, &lines) && CanPay(&demand);
}

int GameHook_PondVisitRefusal(int vanilla) {
  PondDemand demand;
  PondDemandLines lines;
  if (!VisitDemand(&demand, &lines)) return vanilla;
  return lines.refuse >= 0 ? lines.refuse : vanilla;
}

int GameHook_PondVisitTossDelay(int vanilla) {
  PondDemand demand;
  PondDemandLines lines;
  if (!VisitDemand(&demand, &lines)) return vanilla;
  int frames = vanilla * PondDemandVolleys(&demand);
  return frames > POND_VISIT_MAX_DELAY ? POND_VISIT_MAX_DELAY : frames;
}

/**
 * Take the payment and throw it in. True whenever the rung asks, so the caller never falls
 * back to a rupee throw for it. The test runs again here because the take is a plain
 * subtraction that must never underflow; a payment that stopped being payable since the
 * question is thrown and taken as nothing.
 */
bool GameHook_PondVisitPay(void) {
  PondDemand demand;
  PondDemandLines lines;
  if (!VisitDemand(&demand, &lines)) return false;
  if (!CanPay(&demand)) {
    printf("[Randomizer] Pond demand kind %d no longer payable; nothing taken\n", demand.kind);
    return true;
  }
  // The picture is read before the take, which empties a bottle's slot.
  bool thrown = PondDemandToss(&demand);
  if (demand.kind == kPondDemand_Bottle) {
    ShopTakeBottles(demand.native_id, PondDemandBottles(&demand));
  } else if (demand.kind != kPondDemand_Item) {
    ShopTakePayment((uint8)(demand.kind - 1), demand.amount);
  }
  printf("[Randomizer] Pond demand paid: kind %d, amount %d, id 0x%02x%s%s\n", demand.kind, demand.amount,
         demand.native_id, demand.kind == kPondDemand_Item ? ", shown and kept" : "", thrown ? "" : ", not drawn");
  return true;
}

int GameHook_PondVisitAwardMessage(int fallback) {
  PondDemand demand;
  PondDemandLines lines;
  if (!VisitDemand(&demand, &lines)) return fallback;
  return lines.award >= 0 ? lines.award : fallback;
}

bool GameHook_PondTossPayment(int rupees) {
  if (GameHook_PondVisitPay()) return true;
  return GameHook_PondTossRupees(rupees);
}
