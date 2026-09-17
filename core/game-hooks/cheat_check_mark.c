/* @layer core-game-hooks @kind native */
// Recording a check as collected WITHOUT handing anything over.
//
// The cheat console's "From Check" grant used to be one call: set the slot's chest-open bit and
// hand over an item in the same breath (GameHook_TriggerCheck). That works only while the item is
// a NATIVE receive id, because the receive path it ends in indexes 76-entry tables. A randomized
// file routinely places an item whose id is virtual (a progressive family, a counter upgrade, a
// wallet rung, a dungeon-flavoured key), and those resolve to a real grant only at a substitution
// or receipt seam. So the console splits the two halves: the item goes through the receipt export,
// which resolves whatever it is given, and the completion comes from here.
//
// WHERE a completion lives is not one place. A chest records it in the room word AND in the tile
// the player walks into; a possession-gated giver records it in the substitution-completion bits
// and nowhere else. Writing the wrong one of those leaves the tracker and the game disagreeing,
// so the host picks the write from the check's own detection, the same fact the tracker reads.
// A chest is recorded through WasmCheatTriggerCheck with the no-item sentinel, which opens the
// tiles through the same store a delivered chest uses (check_triggers.c).
#include "game_hooks_internal.h"
#include "src/dungeon.h"

/**
 * The cheat console's chest trigger, and the only caller of the console route in check_triggers.c.
 * Answers to the cheat item-grant gate alone, so a simulator run or a delivery session never takes
 * that route. Item 0xFF records the chest and hands nothing over.
 */
EMSCRIPTEN_KEEPALIVE
void WasmCheatTriggerCheck(int room_id, int chest_index, int item_id) {
  if (!CheatGate(kFeatures3_CheatItemGrant)) {
    printf("[Cheat] TriggerCheck blocked: the cheat item-grant gate is closed\n");
    return;
  }
  if (room_id < 0 || room_id >= (int)(kDungeonRoomOffs_SIZE / 2) || item_id < 0 || item_id > 0xff) {
    printf("[Cheat] TriggerCheck blocked: room 0x%03x item 0x%02x out of range\n", room_id, item_id);
    return;
  }
  GameHook_TriggerCheckFromConsole((uint16)room_id, (uint8)chest_index, (uint8)item_id);
}

/**
 * The completion a possession-gated giver records: one bit keyed by the vanilla receive id its own
 * script grants (npc_overrides.c owns the table). For the wish ponds and the other givers whose
 * scripts gate on OWNING the item, this bit is the only persistent fact that says the check was
 * taken, so it is both what the tracker reads and what keeps the giver from offering again
 * (GameHook_GiftGateClosed). GameHook_MarkSubstitutionKey carries no gate of its own, because its
 * only other callers are already inside gated substitution seams, so the gate is added here.
 */
EMSCRIPTEN_KEEPALIVE
void WasmCheatMarkSubstitutionTaken(int vanilla_item_id) {
  if (!CheatGate(kFeatures3_CheatItemGrant)) {
    printf("[Cheat] MarkSubstitutionTaken blocked: the cheat item-grant gate is closed\n");
    return;
  }
  if (vanilla_item_id < 0 || vanilla_item_id > 0xff) return;
  GameHook_MarkSubstitutionKey((uint8)vanilla_item_id);
  printf("[Cheat] MarkSubstitutionTaken: key=0x%02x\n", vanilla_item_id);
}
