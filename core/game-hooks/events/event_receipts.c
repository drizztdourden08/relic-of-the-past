/* @layer core-game-hooks @kind native */
// The receipt classifier: at Link_ReceiveItem, the giver names the event. It runs from
// GameHook_NotifyItemReceived (game_hooks.c), so no vendored code changes for any of these.
//
// Keyed on the GIVER, never on the item. In a seed the item a giver hands over is whatever was
// placed there, so "the powder bag was taken" has to come from the bag sprite, not from the
// powder. The executing sprite slot (cur_object_index) is live during an in-handler grant; the
// falling boss reward is the one grant with no sprite, and it carries its own receipt method.
#include "../game_hooks_internal.h"
#include "event_ids.h"

// Sprite types that grant an item once and never write a durable bit of their own.
#define SPRITE_SAHASRAHLA 0x16    // shared with the desert cave elder, who grants nothing
#define SPRITE_SMITHY 0x1A
#define SPRITE_FLUTE_KID 0x2E     // only his dark world twin ever grants
#define SPRITE_OLD_MAN 0xAD
#define SPRITE_POTION_SHOP 0xE9
#define POTION_SHOP_POWDER_BAG 1  // sprite_subtype2 of the bag on the shop counter

// The falling reward: receipt method 3, one of the four native reward ids.
#define RECEIPT_METHOD_FALLING_PRIZE 3
#define RECEIPT_METHOD_NPC 0

static bool LedgerOn(void) {
  return (enhanced_features5 & kFeatures5_EventLedger) != 0;
}

static bool IsPrizeItem(uint8 item_id) {
  return item_id == 0x20 || item_id == 0x37 || item_id == 0x38 || item_id == 0x39;
}

static void RecordPrize(void) {
  int palace = BYTE(cur_palace_index_x2) >> 1;
  if (palace < 0 || palace > 13) return;
  GameHook_RecordEvent((EventId)(kEvent_PrizeTaken_Sewers + palace));
}

static void RecordGiver(void) {
  int k = cur_object_index;
  if (k < 0 || k >= 16 || sprite_state[k] == 0) return;
  switch (sprite_type[k]) {
    case SPRITE_POTION_SHOP:
      if (sprite_subtype2[k] == POTION_SHOP_POWDER_BAG) GameHook_RecordEvent(kEvent_PowderBagTaken);
      break;
    case SPRITE_FLUTE_KID: GameHook_RecordEvent(kEvent_ShovelFromStump); break;
    case SPRITE_SAHASRAHLA: GameHook_RecordEvent(kEvent_SahasrahlaGift); break;
    case SPRITE_OLD_MAN: GameHook_RecordEvent(kEvent_OldManRescued); break;
    case SPRITE_SMITHY: GameHook_RecordEvent(kEvent_TemperedSwordCollected); break;
    default: break;
  }
}

void GameHook_EventReceipt(uint8 item_id, uint8 method) {
  if (!LedgerOn()) return;
  if (method == RECEIPT_METHOD_FALLING_PRIZE && IsPrizeItem(item_id)) {
    RecordPrize();
    return;
  }
  if (method == RECEIPT_METHOD_NPC) RecordGiver();
}

// The boss heart container's first activation (sprite_main.c Sprite_HeartContainer): the boss is
// dead whether or not the heart is ever picked up. Inside the last tower the same sprite marks
// the three rematches, told apart by the room; it despawns there, so the call sits before that.
void GameHook_BossHeartSpawned(int k) {
  (void)k;
  if (!LedgerOn()) return;
  int palace = BYTE(cur_palace_index_x2) >> 1;
  if (palace == 13) {
    switch (dungeon_room_index) {
      case 0x1C: GameHook_RecordEvent(kEvent_RematchKilled_Armos); break;
      case 0x6C: GameHook_RecordEvent(kEvent_RematchKilled_Lanmolas); break;
      case 0x4D: GameHook_RecordEvent(kEvent_RematchKilled_Moldorm); break;
      default: break;
    }
    return;
  }
  if (palace < 0 || palace > 13) return;
  GameHook_RecordEvent((EventId)(kEvent_BossKilled_Sewers + palace));
}
