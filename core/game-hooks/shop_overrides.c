/* @layer core-game-hooks @kind native */
// Physical substitution for the things a shop sells — the counterpart of
// standing_overrides.c for the one surface the game does not treat as a check at all. A
// shop spot in the unmodified game is a repeatable purchase: it charges its price, hands
// over its fixed stock, and is back next time the room loads. A randomized spot has to
// become a FINITE sequence instead — one assigned item per armed step, then an empty spot
// that stays empty across a save and a reload.
//
// THREE SEAMS, ONE TABLE. Three sprite families sell things, and each wants a different
// gesture and a different fallback picture, so each gets its own entry point:
//   - the shelf (Sprite_BB_Shopkeeper, subtypes 7-13) — the nine shelf shops;
//   - the cauldron (Sprite_E9_PotionShop, subtypes 2-4) — the potion seller's hut;
//   - the bomb counter (Sprite_B5_BombShop, subtype 1) — the refill, and only that one.
//     Subtype 2 of that sprite is the story bomb: it starts a follower and a cutscene
//     rather than handing an item over, so it is never armed and never reached from here.
// All three read the same armed table (shop_table.c) and share the purchase below, so a
// price, a refusal and a grant behave identically wherever the player is standing.
//
// Everything answers to kFeatures3_ShopOverrides at the application site. Gate off, or no
// entry armed for this spot, and every seam returns false so the vendored handler runs its
// original code byte-for-byte.
#include "game_hooks_internal.h"
#include "shop_table.h"
#include "src/sprite.h"
#include "src/sprite_main.h"
#include "shop_payment.h"
#include "shop_draw.h"

// First and last shelf subtype; anything else on that sprite is a clerk or a minigame.
#define SHOP_SUBTYPE_FIRST 7
#define SHOP_SUBTYPE_LAST 13
// The hut's three cauldrons; subtypes 0 and 1 are the assistant and the powder.
#define SHOP_CAULDRON_FIRST 2
#define SHOP_CAULDRON_LAST 4
// The bomb counter's one purchasable spot.
#define SHOP_BOMB_REFILL_SUBTYPE 1
// "Not enough rupees", the message every vendored spot shows on a failed purchase.
#define SHOP_MSG_TOO_POOR 0x17c

// Which refusal sound the spot makes — the only thing that differs between the three
// families once the player has pressed A and cannot pay.
enum { kShopBeep_Shop = 0, kShopBeep_Cauldron = 1 };

static void ShopBeep(int k, uint8 beep) {
  if (beep == kShopBeep_Cauldron) PotionCauldron_GoBeep(k);
  else ShopItem_PlayBeep(k);
}

// Hands the assigned item over through the game's own shop ceremony, the one
// ShopItem_HandleReceipt plays for a vendored shelf: the hold-up receipt, the shop's line
// opened over it, and the receipt cut short so the item comes down when the line is
// dismissed. The receipt's own message seam never runs in a shop room (the vendored
// receipt skips it there), so the line is shown from here, and the contextual one-shot
// armed for this location is taken rather than left standing for the next receipt.
static void GrantShopSlot(const ShopSlotOverride *entry) {
  if (entry->msg >= 0)
    GameHook_ArmReceiptMessageIfClear(entry->msg);
  uint8 grant = GameHook_ResolveGrantItem(entry->new_item);
  item_receipt_method = 0;
  // The assigned item must not be re-substituted by the receive-seam table.
  GameHook_NpcOverrideBypassOnce();
  Link_ReceiveItem(grant, 0);
  int msg = ShopPurchaseMessage(GameHook_TakeReceiptMessage());
  if (msg >= 0) Sprite_ShowMessageUnconditional((uint16)msg);
  ShopKeeper_RapidTerminateReceiveItem();
  GameHook_NotifyOverrideFired(entry->fire_id);
}

// The purchase itself, from a press that has already been detected. Shared by all three
// seams: pay or refuse, close the step BEFORE granting so an interrupted grant cannot be
// bought twice, then hand the item over. The spot stays up while it has stock left, so
// the next armed step is what it shows from the next frame on; it comes down only once
// every step has sold. Every seam ignores a press while a hold-up receipt lives, so a
// restocked spot sells one item per ceremony.
static void ShopBuyPressed(int k, const ShopSlotOverride *entry, uint8 beep) {
  if (!ShopCanPay(entry->currency, entry->amount)) {
    // The game's own refusal gesture, the line naming what the shelf wants: the vendored
    // "not enough" line for rupees, the currency's own template line for anything else.
    Sprite_ShowMessageUnconditional(
        (uint16)ShopRefusalMessage(entry->currency, entry->amount, SHOP_MSG_TOO_POOR));
    ShopBeep(k, beep);
    return;
  }
  ShopTakePayment(entry->currency, entry->amount);
  ShopMarkSold(entry);
  if (ShopSlotSoldOut(entry)) sprite_state[k] = 0;
  GrantShopSlot(entry);
  printf("[Randomizer] Shop slot: room 0x%03x area 0x%02x sub %d step %d -> 0x%02x\n",
         entry->room_id, overworld_area_index_exit, entry->subtype, entry->depth_index + 1,
         entry->new_item);
}

// The armed entry for this sprite, or NULL. Returns false through |handled| only when the
// vendored handler should run; a spot the table owns but has emptied is despawned here and
// reported as handled, so the vanilla stock never comes back.
static const ShopSlotOverride *ShopEntryForSprite(int k, uint8 subtype, bool *handled) {
  bool sold_out = false;
  const ShopSlotOverride *entry = ShopFindEntry(subtype, &sold_out);
  if (entry != NULL) {
    *handled = true;
    return entry;
  }
  // An emptied spot shows nothing and sells nothing, and stays that way across a reload
  // because the counter that emptied it lives in the save block.
  if (sold_out) sprite_state[k] = 0;
  *handled = sold_out;
  return NULL;
}

static bool ShopGateOpen(void) {
  return (enhanced_features3 & kFeatures3_ShopOverrides) != 0;
}

// Shelf seam — called at the top of the shopkeeper-family dispatch. True = this sprite is
// a randomized shelf and has been fully handled; the vendored dispatch is skipped. False
// for every clerk, minigame and unarmed shelf, which then run untouched.
//
// The ENTRY'S OWN id goes to the draw, never a resolved one, exactly as the standing and
// drop seams pass theirs. Resolving belongs to the purchase: it climbs the ladder, arms
// the line and banks rupees, so a draw that resolved applied a whole upgrade every frame
// the shelf was merely on screen — and erased the virtual id the capacity icon and its
// palette row read the family from.
bool GameHook_OverrideShopItem(int k) {
  if (!ShopGateOpen()) return false;
  uint8 subtype = sprite_subtype2[k];
  if (subtype < SHOP_SUBTYPE_FIRST || subtype > SHOP_SUBTYPE_LAST) return false;
  bool handled = false;
  const ShopSlotOverride *entry = ShopEntryForSprite(k, subtype, &handled);
  if (entry == NULL) return handled;

  if (!GameHook_DrawShopShelf(k, entry->new_item, entry->currency, entry->amount))
    SpriteDraw_ShopItem(k);
  if (Sprite_ReturnIfInactive(k)) return true;
  Sprite_BehaveAsBarrier(k);
  if (!ShopItem_CheckForAPress(k) || GameHook_HoldUpReceiptLive()) return true;
  ShopBuyPressed(k, entry, kShopBeep_Shop);
  return true;
}

// The vendored cauldron picture for the pot this subtype is, used when the assigned item
// has no art of its own.
static void DrawVanillaCauldron(int k, uint8 subtype) {
  if (subtype == 2) GreenPotionItem_Draw(k);
  else if (subtype == 3) BluePotionItem_Draw(k);
  else RedPotionItem_Draw(k);
}

// Cauldron seam — called at the top of the potion-shop dispatch. The vendored cauldrons
// ask for a bottle to pour into and refuse without one; a randomized cauldron is selling
// an arbitrary item rather than a potion, so it asks for the price and nothing else,
// exactly as a randomized shelf does.
bool GameHook_OverrideShopCauldron(int k) {
  if (!ShopGateOpen()) return false;
  uint8 subtype = sprite_subtype2[k];
  if (subtype < SHOP_CAULDRON_FIRST || subtype > SHOP_CAULDRON_LAST) return false;
  bool handled = false;
  const ShopSlotOverride *entry = ShopEntryForSprite(k, subtype, &handled);
  if (entry == NULL) return handled;

  if (!GameHook_DrawShopShelf(k, entry->new_item, entry->currency, entry->amount))
    DrawVanillaCauldron(k, subtype);
  if (Sprite_ReturnIfInactive(k)) return true;
  Sprite_BehaveAsBarrier(k);
  if (sprite_delay_main[k]) return true;
  // The cauldron's own purchase gesture: stand against it and press A. The shelves use a
  // proximity helper instead, which is why this is not shared.
  if (!Sprite_CheckDamageToLink_same_layer(k) || !(filtered_joypad_L & 0x80)) return true;
  if (GameHook_HoldUpReceiptLive()) return true;
  ShopBuyPressed(k, entry, kShopBeep_Cauldron);
  return true;
}

// Bomb-counter seam — called at the top of the bomb-shop dispatch. Only the refill spot is
// ever ours; the clerk, the huff and the story bomb fall straight through to their own
// vendored handlers.
bool GameHook_OverrideShopBombSlot(int k) {
  if (!ShopGateOpen()) return false;
  uint8 subtype = sprite_subtype2[k];
  if (subtype != SHOP_BOMB_REFILL_SUBTYPE) return false;
  bool handled = false;
  const ShopSlotOverride *entry = ShopEntryForSprite(k, subtype, &handled);
  if (entry == NULL) return handled;

  if (!GameHook_DrawShopShelf(k, entry->new_item, entry->currency, entry->amount))
    BombShopEntity_Draw(k);
  if (Sprite_ReturnIfInactive(k)) return true;
  Sprite_BehaveAsBarrier(k);
  if (!ShopItem_CheckForAPress(k) || GameHook_HoldUpReceiptLive()) return true;
  ShopBuyPressed(k, entry, kShopBeep_Shop);
  return true;
}
