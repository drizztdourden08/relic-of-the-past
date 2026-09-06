/* @layer core-game-hooks @kind native */
// Physical substitution for the scripted grants that never cross the receive seam —
// the counterpart of npc_overrides.c for handlers whose vanilla "grant" is a bare
// counter write or a special chest path:
//   - the upgrade pond (ai states 8/12): silent capacity-counter bumps, one per kind;
//   - the cave bat's meter upgrade: a single consumption write inside its cutscene;
//   - the prize minigame's once-only top prize (its own chest routine, outside the
//     native chest table, so the chest-override seam can never key it).
// Each armed entry replaces exactly the once-only vanilla grant moment: the handler's
// own persistence write still happens where vanilla has one (the minigame room bit),
// a substitution-completion bit is recorded where vanilla has none (pond, bat), the
// assigned item goes out through the native receipt flow, and the host is notified
// via the entry's fire id.
//
// Everything answers to kFeatures3_ScriptedGrants at the application sites; the
// setters record blind (the SyncGateWords latching contract shared by every override
// table). Gate off = the hooks return false/pass-through and the vendored handlers
// run their original code byte-for-byte.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"
#include "src/sprite.h"
#include "src/load_gfx.h"

typedef struct {
  uint8 armed;
  uint8 new_item;
  int16 msg;
  int16 fire_id;
} ScriptedGrantSlot;

// [0] = pond capacity kind 0 (explosives), [1] = kind 1 (projectiles), [2] = the bat.
static ScriptedGrantSlot g_scripted_slots[3];
// The minigame prize entry (one room is enough today; keyed anyway for safety).
static struct { uint8 armed; uint16 room_id; uint8 new_item; int16 msg; int16 fire_id; } g_minigame;

// Synthetic substitution-bit keys (npc_overrides.c owns the allocation; these can
// never collide with a real receive id at any seam).
#define SUBST_KEY_POND_BOMBS 0xF0
#define SUBST_KEY_POND_ARROWS 0xF1
#define SUBST_KEY_BAT 0xF2
// Deliberately absent from that allocation: a pond-plan prize records nothing, because
// the plan's own throw counter already says which prizes are spent. Marking it is a
// no-op by construction (an unknown key finds no bit), which is exactly the intent.
#define SUBST_KEY_NONE 0xFF

static void GrantScriptedSlot(const ScriptedGrantSlot *slot, uint8 subst_key) {
  if (slot->msg >= 0)
    GameHook_ArmReceiptMessageIfClear(slot->msg);
  uint8 grant = GameHook_ResolveGrantItem(slot->new_item);
  if (slot->msg < 0)
    GameHook_ArmReceiptClassMessage(grant, kReceiptMsg_Generic);
  item_receipt_method = 0;
  // The assigned item must not be re-substituted by the receive-seam table.
  GameHook_NpcOverrideBypassOnce();
  Link_ReceiveItem(grant, 0);
  GameHook_MarkSubstitutionKey(subst_key);
  GameHook_NotifyOverrideFired(slot->fire_id);
}

// A purchase under a Custom family climbs the profile ladder through the hook's own step
// (the empty rung, the final rung) with the pond's own messages and consolation, so the
// vendored branch — native level arithmetic, its private hex tables, its `i != 8` bound —
// is never entered while the profile owns the family. With kFeatures3_CapacityProfile
// off, or the family left on the native grid, this returns false and that branch runs
// byte-for-byte.
static bool ClimbPondUnderProfile(int kind) {
  if (!GameHook_CapacityFamilyCustom(kind)) return false;
  bool maxed = GameHook_CapacityStep(kind);
  Sprite_ShowMessageUnconditional(maxed ? 0x98 : kind == 0 ? 0x96 : 0x97);
  printf("[Randomizer] Pond kind %d climbed under the profile%s\n", kind, maxed ? " (cap: consolation paid)" : "");
  return true;
}

// A capacity level sold by the pond under a plan: one rung on the family the player
// picked, with the pond's own message and the level it reached, and the pond's "nothing
// more to sell" line when the family is already at its ceiling. Deliberately NOT the
// shared CapacityStep: that one pays a hundred rupees back on a full family, which under
// a plan whose throws can cost less than a hundred would turn the pond into a money
// press. A plan throw never hands back more than it took.
static void SellCapacityLevel(int kind) {
  bool climbed = GameHook_CapacityClimb(kind);
  if (climbed && !GameHook_CapacityFamilyCustom(kind)) {
    const uint8 *hex = kind == 0 ? kCapacityTiersBombsHex : kCapacityTiersArrowsHex;
    uint8 level = kind == 0 ? link_bomb_upgrades : link_arrow_upgrades;
    if (level < CAPACITY_TIER_COUNT) {
      dialogue_number[0] = hex[level];
      if (kind == 0) link_bomb_filler = hex[level];
      else link_arrow_filler = hex[level];
    }
  }
  Sprite_ShowMessageUnconditional(climbed ? (kind == 0 ? 0x96 : 0x97) : 0x98);
}

// The pond plan's half of the purchase, ahead of every legacy path: the throw that was
// just paid for is resolved once (pond_plan.c advances its own counter), and what it
// yields goes out through the SAME substitution the legacy pond slots use — the seed's
// pool item through the receipt flow, a consolation handed straight back, or a capacity
// level. A prize can never be handed out twice because the counter never rewinds.
static bool PondYieldUnderPlan(int kind) {
  int prize = -1, refund = 0, consolation = -1;
  if (!GameHook_PondTakeThrow(&prize, &refund, &consolation)) return false;
  int new_item = 0, msg = -1, fire_id = -1;
  if (prize >= 0 && GameHook_PondPrizeSlot(prize, &new_item, &msg, &fire_id)) {
    ScriptedGrantSlot slot = {1, (uint8)new_item, (int16)msg, (int16)fire_id};
    GrantScriptedSlot(&slot, SUBST_KEY_NONE);
    printf("[Randomizer] Pond prize %d -> 0x%02x\n", prize, new_item);
    return true;
  }
  if (refund > 0) {
    link_rupees_goal += refund;
    // The vanilla line promises a flat hundred back, which is only true of the vanilla
    // pond's own consolation; a plan's refund is half its price, so the host pre-renders
    // one line per distinct refund and 0x98 is the fallback when it composed none.
    Sprite_ShowMessageUnconditional(consolation >= 0 ? (uint16)consolation : 0x98);
    printf("[Randomizer] Pond throw won nothing; %d rupees handed back\n", refund);
    return true;
  }
  SellCapacityLevel(kind);
  return true;
}

// Pond seam — called at the top of the upgrade purchase states. True = the vanilla
// counter bump and message are skipped; the caller advances to its wrap-up state.
// The assigned item goes out ONCE: its completion bit closes the slot afterwards, so a
// second purchase climbs the ladder instead of re-granting the check's item — through
// the hook under a Custom family, natively (false) otherwise. A pond PLAN takes the
// purchase before any of that: it owns the whole sequence, prices included.
bool GameHook_OverrideCapacityGrant(int kind) {
  if (kind != 0 && kind != 1) return false;
  if (PondYieldUnderPlan(kind)) return true;
  uint8 key = kind == 0 ? SUBST_KEY_POND_BOMBS : SUBST_KEY_POND_ARROWS;
  if ((enhanced_features3 & kFeatures3_ScriptedGrants) && g_scripted_slots[kind].armed &&
      !GameHook_SubstitutedGiftTaken(key)) {
    GrantScriptedSlot(&g_scripted_slots[kind], key);
    printf("[Randomizer] Scripted grant: pond kind %d -> 0x%02x\n", kind, g_scripted_slots[kind].new_item);
    return true;
  }
  return ClimbPondUnderProfile(kind);
}

// Deliberately ungated read, same doctrine as GameHook_SubstitutedGiftTaken: the bit
// is only ever written by a substitution (gated above), and once the check's item
// went out the bat must stay closed even if the session later stops.
bool GameHook_BatGrantTaken(void) {
  return GameHook_SubstitutedGiftTaken(SUBST_KEY_BAT);
}

// Bat seam — called at the grant moment of its cutscene (before the vanilla message
// and meter write). Replicates the state bookkeeping the vanilla branch performs
// around the write so the cutscene resolves identically.
bool GameHook_OverrideBatGrant(int k) {
  if (!(enhanced_features3 & kFeatures3_ScriptedGrants)) return false;
  if (!g_scripted_slots[2].armed || GameHook_BatGrantTaken()) return false;
  Palette_Restore_BG_And_HUD();
  flag_update_cgram_in_nmi++;
  sprite_ai_state[k]++;
  GrantScriptedSlot(&g_scripted_slots[2], SUBST_KEY_BAT);
  printf("[Randomizer] Scripted grant: bat -> 0x%02x\n", g_scripted_slots[2].new_item);
  return true;
}

// Minigame seam — |t| is the prize roll after the once-only gating; the top slot (7)
// is only ever reached on the first win, with the room's own persistence bit already
// written by the vanilla routine. The substituted id is resolved here because the
// return value flows straight into the vanilla chest receive path.
uint8 GameHook_OverrideMinigamePrize(uint8 rv, int t) {
  if (!(enhanced_features3 & kFeatures3_ScriptedGrants)) return rv;
  if (!g_minigame.armed || t != 7 || dungeon_room_index != g_minigame.room_id) return rv;
  if (g_minigame.msg >= 0)
    GameHook_ArmReceiptMessageIfClear(g_minigame.msg);
  uint8 grant = GameHook_ResolveGrantItem(g_minigame.new_item);
  if (g_minigame.msg < 0)
    GameHook_ArmReceiptClassMessage(grant, kReceiptMsg_Generic);
  GameHook_NotifyOverrideFired(g_minigame.fire_id);
  printf("[Randomizer] Scripted grant: minigame prize 0x%02x -> 0x%02x\n", rv, grant);
  return grant;
}

// Record-only setters, the shared contract: gates latch a frame after the host
// writes them, so they are enforced at the application sites above, never here.
EMSCRIPTEN_KEEPALIVE
void WasmSetCapacityGrantOverride(int kind, int new_item, int msg, int fire_id) {
  if (kind != 0 && kind != 1) return;
  g_scripted_slots[kind] = (ScriptedGrantSlot){1, (uint8)new_item, (int16)msg, (int16)fire_id};
  printf("[Randomizer] Armed pond grant override: kind=%d -> 0x%02x\n", kind, new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetBatGrantOverride(int new_item, int msg, int fire_id) {
  g_scripted_slots[2] = (ScriptedGrantSlot){1, (uint8)new_item, (int16)msg, (int16)fire_id};
  printf("[Randomizer] Armed bat grant override: -> 0x%02x\n", new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetMinigamePrizeOverride(int room_id, int new_item, int msg, int fire_id) {
  g_minigame.armed = 1;
  g_minigame.room_id = (uint16)room_id;
  g_minigame.new_item = (uint8)new_item;
  g_minigame.msg = (int16)msg;
  g_minigame.fire_id = (int16)fire_id;
  printf("[Randomizer] Armed minigame prize override: room=0x%03x -> 0x%02x\n", room_id, new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearScriptedGrantOverrides(void) {
  for (int i = 0; i < 3; i++) g_scripted_slots[i].armed = 0;
  g_minigame.armed = 0;
  printf("[Randomizer] Cleared scripted grant overrides\n");
}
