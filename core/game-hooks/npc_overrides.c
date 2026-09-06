/* @layer core-game-hooks @kind native */
// Scripted-grant substitution — the NPC counterpart of item_overrides.c. Entries are
// keyed by (room, vanilla item): the room pins the giver's location so two givers of
// the same item stay distinct, and NPC_OVERRIDE_ROOM_ANY marks an outdoor giver whose
// vanilla item is unique across the armed set (the host certifies uniqueness before
// arming such an entry). A third kind keys by the giver's SPRITE TYPE instead — see
// the sprite_kind field below. The table is applied at the one seam every scripted grant
// crosses — the Link_ReceiveItem entry (player.c) — so the giver's own cutscene hands
// over the substituted item natively, receipt animation included.
//
// Two one-shots keep the seam honest about who is granting, and both are armed by the
// granting hook in the same breath as its Link_ReceiveItem call, so neither can outlive
// a grant that never fired:
// - bypass: the grant carries an ALREADY-ASSIGNED item (delivery receipt, cheat grant,
//   the queue's assigned npc trigger), so the table must not re-substitute it.
// - match-anywhere: a host trigger replays a giver's grant remotely (check_triggers.c);
//   the trigger names the check itself, so the room test would only refuse a grant the
//   caller already identified.
// Chest receipts need neither: they set item_receipt_method 1 and are excluded here,
// having substituted upstream at the chest seam (GameHook_OverrideChestItem).
#include "game_hooks_internal.h"
#include "save_bytes.h"

#define MAX_NPC_OVERRIDES 64
#define NPC_OVERRIDE_ROOM_ANY 0xFFFF
#define NPC_OVERRIDE_SPRITE_NONE 0xFF

typedef struct {
  uint16 room_id;
  uint8 vanilla_item;
  uint8 new_item;
  // Third entry kind: several roomless givers hand out the SAME vanilla item, so
  // neither the room nor the item alone can tell their grants apart. What can is
  // the giver itself: each of those grants runs inside its own sprite's handler
  // frame (certified per sprite type by the host before arming), so the sprite
  // slot the main loop is currently executing IS the granting giver. 0xFF for the
  // room-keyed and item-alone entry kinds.
  uint8 sprite_kind;
  // Pre-rendered contextual receipt-message id for THIS grant (session dialogue),
  // or -1 to fall back to the item-class template line.
  int16 msg;
  // Host-assigned completion id reported the moment this entry substitutes
  // (GameHook_NotifyOverrideFired), or -1 for no report.
  int16 fire_id;
} NpcGrantOverride;

static NpcGrantOverride g_npc_overrides[MAX_NPC_OVERRIDES];
static int g_npc_override_count = 0;
static bool g_bypass_once = false;
static bool g_match_anywhere_once = false;

// ─── Substitution-completion bits ───
// Several givers have no real completion flag: their scripts gate on POSSESSION of the
// vanilla item, which substitution never grants — so the check would re-offer forever
// and nothing persistent would say it completed. These three bytes are the missing bits.
//
// Their addresses, and the reason a save byte can live in the battery block at all, are
// in save_bytes.h — THE registry, where every hook-owned address is allocated once.
// Exposed to the host as progress-buffer bytes [21], [22] and [25] (state_queries.c).
//
// One bit per substitutable possession-gated giver, keyed by the VANILLA receive id its
// script grants (unique per giver). Byte 0 bits 0-7, byte 1 bits 0-6, byte 2 bits 0-2;
// the rest reserved. Keys 0xF0 and above are SYNTHETIC — allocation handles for grants
// whose script has no vanilla receive id at all (the upgrade pond's two purchases, the
// cave bat); they can never collide with a real id at the receive seam and are written
// via GameHook_MarkSubstitutionKey.
#define srm_substitution_taken(byte_index) (*(uint8*)(g_ram + SRM_SUBSTITUTION_TAKEN + (byte_index)))
#define srm_substitution_taken_0 srm_substitution_taken(0)
#define srm_substitution_taken_1 srm_substitution_taken(1)
#define srm_substitution_taken_2 srm_substitution_taken(2)

typedef struct { uint8 vanilla_item; uint8 byte_index; uint8 mask; } SubstitutionBit;
static const SubstitutionBit kSubstitutionBits[] = {
  {0x1e, 0, 0x01},  // the river king's swim gear
  {0x4b, 0, 0x02},  // the first sage's running gear
  {0x21, 0, 0x04},  // the sick child's catching net
  {0x1a, 0, 0x08},  // the escorted elder's reflector
  {0x11, 0, 0x10},  // the whirlpool dweller's third medallion
  {0x29, 0, 0x20},  // the standing fungus
  {0x1d, 0, 0x40},  // the shelved tome
  {0x14, 0, 0x80},  // the dug-up instrument
  {0x0f, 1, 0x01},  // the desert tablet's medallion
  {0x10, 1, 0x02},  // the mountain tablet's medallion
  {0x02, 1, 0x04},  // the smithy's tempered blade (its record's flag bit has no vanilla writer)
  // The wish ponds' four gear upgrades: each grant crosses the receive seam with a
  // unique vanilla id, but writes no completion flag of its own.
  {0x2a, 1, 0x08},  // the wish pond's returning-weapon upgrade
  {0x05, 1, 0x10},  // the wish pond's guard-gear upgrade
  {0x03, 1, 0x20},  // the cursed pond's final blade tier
  {0x3b, 1, 0x40},  // the cursed pond's piercing-shot upgrade
  // Synthetic keys (no vanilla receive id exists for these grants at all):
  {0xf0, 2, 0x01},  // the upgrade pond's explosives-capacity purchase
  {0xf1, 2, 0x02},  // the upgrade pond's projectiles-capacity purchase
  {0xf2, 2, 0x04},  // the cave bat's meter upgrade
  // The ceremonial blade's pedestal needs no bit: its own script writes a real
  // overworld event bit at the grant, which detection already reads.
};

static const SubstitutionBit *FindSubstitutionBit(uint8 vanilla_item) {
  for (size_t i = 0; i < sizeof(kSubstitutionBits) / sizeof(kSubstitutionBits[0]); i++) {
    if (kSubstitutionBits[i].vanilla_item == vanilla_item) return &kSubstitutionBits[i];
  }
  return NULL;
}

static void MarkGrantSubstituted(uint8 vanilla_item) {
  const SubstitutionBit *bit = FindSubstitutionBit(vanilla_item);
  if (bit == NULL) return;
  if (bit->byte_index == 0) srm_substitution_taken_0 |= bit->mask;
  else if (bit->byte_index == 1) srm_substitution_taken_1 |= bit->mask;
  else srm_substitution_taken_2 |= bit->mask;
}

// The synthetic-key write path for grants with no vanilla receive id (scripted_grants.c).
// Gated by construction: only the gated substitution hooks call it.
void GameHook_MarkSubstitutionKey(uint8 key) {
  MarkGrantSubstituted(key);
}

// Read side for the vendored re-offer gates and the host: true once this giver's grant
// was substituted. Deliberately ungated — the bit is only ever WRITTEN by a substitution
// (which answers to kFeatures3_NpcOverrides), and once a check's item went out, the
// giver must stay closed even if the session later stops or Vanilla Safe engages.
bool GameHook_SubstitutedGiftTaken(uint8 vanilla_item) {
  const SubstitutionBit *bit = FindSubstitutionBit(vanilla_item);
  if (bit == NULL) return false;
  return (GameHook_SubstitutionTakenByte(bit->byte_index) & bit->mask) != 0;
}

uint8 GameHook_SubstitutionTakenByte(int byte_index) {
  if (byte_index == 0) return srm_substitution_taken_0;
  return byte_index == 1 ? srm_substitution_taken_1 : srm_substitution_taken_2;
}

// The re-offer gate for every possession-gated giver. The vanilla scripts gate on
// OWNING the item the script grants (a possession proxy for "check taken") — but with
// grants substituted, possession says nothing about THIS giver: the vanilla item can
// arrive early from another randomized check, and ORing possession into the gate then
// closes a check never taken. So while an entry for |vanilla_item| is armed, the gate
// reads ONLY the substitution-completion bit; with no armed entry (or the gate word
// down — Vanilla Safe force-clears it), the giver grants real vanilla items again and
// |vanilla_closed| (the caller's original expression, verbatim) is the correct gate.
// The scan matches by vanilla item alone — no room or sprite context, so prep-time
// and menu callers outside the sprite loop are safe; each of these givers' vanilla
// items is unique across the armed set.
bool GameHook_GiftGateClosed(uint8 vanilla_item, bool vanilla_closed) {
  if ((enhanced_features3 & kFeatures3_NpcOverrides) != 0) {
    for (int i = 0; i < g_npc_override_count; i++) {
      if (g_npc_overrides[i].vanilla_item == vanilla_item)
        return GameHook_SubstitutedGiftTaken(vanilla_item);
    }
  }
  return vanilla_closed;
}

// The continue/death menu's third spawn option rides the same proxy: vanilla gates it
// on owning the elder's gift, so it must follow his gate exactly (real completion bit
// while his grant is overridden, the vanilla possession test otherwise).
bool GameHook_MountainSpawnUnlocked(void) {
  return GameHook_GiftGateClosed(0x1a, link_item_mirror == 2);
}

void GameHook_NpcOverrideBypassOnce(void) {
  g_bypass_once = true;
}

void GameHook_NpcOverrideMatchAnywhereOnce(void) {
  g_match_anywhere_once = true;
}

static bool EntryMatchesHere(const NpcGrantOverride *entry, bool anywhere) {
  // A sprite-keyed entry matches ONLY the certified giver's own in-handler grant:
  // the executing sprite slot must hold a live sprite of the entry's type. Never
  // relaxed by match-anywhere — cur_object_index is stale outside the sprite loop,
  // and by-item matching is exactly the ambiguity this entry kind exists to solve.
  if (entry->sprite_kind != NPC_OVERRIDE_SPRITE_NONE) {
    int k = cur_object_index;
    return k < 16 && sprite_state[k] != 0 && sprite_type[k] == entry->sprite_kind;
  }
  if (anywhere || entry->room_id == NPC_OVERRIDE_ROOM_ANY) return true;
  return player_is_indoors && dungeon_room_index == entry->room_id;
}

uint8 GameHook_OverrideNpcGrantItem(uint8 item) {
  // Both one-shots are consumed on EVERY receipt, applied or not, so a stale arm can
  // never leak into a later unrelated grant (the receipt_messages.c contract).
  bool bypass = g_bypass_once;
  bool anywhere = g_match_anywhere_once;
  g_bypass_once = false;
  g_match_anywhere_once = false;
  // Neutral when the gate is off, so a populated table left over from a prior session
  // can never substitute while disabled (same rule as GameHook_OverrideChestItem).
  if (!(enhanced_features3 & kFeatures3_NpcOverrides)) return item;
  if (bypass) return item;
  // A chest receipt already substituted upstream at the chest seam; re-applying this
  // table there could double-substitute a chest-assigned item sharing a table key.
  if (item_receipt_method == 1) return item;
  for (int i = 0; i < g_npc_override_count; i++) {
    if (g_npc_overrides[i].vanilla_item != item) continue;
    if (!EntryMatchesHere(&g_npc_overrides[i], anywhere)) continue;
    printf("[Randomizer] Npc override applied: room 0x%03x item 0x%02x -> 0x%02x\n",
           g_npc_overrides[i].room_id, item, g_npc_overrides[i].new_item);
    // The giver's cutscene grants with no host in the loop, so the contextual receipt
    // message is armed natively here: the entry's own pre-rendered line when the
    // session assigned one, the item-class template otherwise (chest-seam contract).
    if (g_npc_overrides[i].msg >= 0)
      GameHook_ArmReceiptMessageIfClear(g_npc_overrides[i].msg);
    else
      GameHook_ArmReceiptClassMessage(g_npc_overrides[i].new_item, kReceiptMsg_Generic);
    // Persist completion for the possession-gated givers (gated by construction:
    // this branch is only reached with kFeatures3_NpcOverrides open).
    MarkGrantSubstituted(item);
    GameHook_NotifyOverrideFired(g_npc_overrides[i].fire_id);
    // A wish-pond grant (receipt method 2) consumed the thrown gear at toss time and
    // vanilla returns it as the upgraded tier. With the upgrade substituted away, the
    // player must keep the original piece — the check costs nothing, matching the
    // reference model of these locations. The pond handler's own scratch (executing
    // sprite frame) still holds the taken slot and its value.
    if (item_receipt_method == 2) {
      int k = cur_object_index;
      if (k < 16 && sprite_state[k] != 0 && sprite_type[k] == 0x72)
        (&link_item_bow)[sprite_C[k]] = sprite_D[k];
    }
    // A boss's falling reward is the one grant whose "already taken" record is NOT the
    // item it hands over, so the dungeon's own claimed-bit is written here (prize_grants.c
    // decides what qualifies; every other grant passes through it untouched).
    GameHook_NoteDungeonPrizeGrant(item);
    // A virtual id (upgrade, progressive or prize crystal) resolves at this last moment
    // before the receive flow. The two resolvers own disjoint id spans and each passes a
    // foreign id straight through, so composing them handles either family in one line.
    return GameHook_ResolvePrizeItem(GameHook_ResolveGrantItem(g_npc_overrides[i].new_item));
  }
  return item;
}

// Draw-only peek: the item the receive seam WOULD substitute for a grant of
// |vanilla_item| in the current context, or -1 with nothing armed. Same gate and
// matching as GameHook_OverrideNpcGrantItem, but reads only — no one-shot consumed,
// no message armed, no completion bit written, no report — so the world-item draw
// overrides can call it every drawn frame and always agree with the eventual grant.
int GameHook_PeekNpcGrantItem(uint8 vanilla_item) {
  if (!(enhanced_features3 & kFeatures3_NpcOverrides)) return -1;
  for (int i = 0; i < g_npc_override_count; i++) {
    if (g_npc_overrides[i].vanilla_item != vanilla_item) continue;
    if (!EntryMatchesHere(&g_npc_overrides[i], false)) continue;
    // The receipt arrays are exactly 76 entries — the bound every override table
    // enforces before an armed id may reach the receipt art or grant paths. A virtual
    // id peeks as its native presentation item (draw-only, no arithmetic): the
    // upgrade's refill item, or the progressive family's next tier right now.
    if (GameHook_IsVirtualGrantId(g_npc_overrides[i].new_item))
      return GameHook_GrantPresentationOf(g_npc_overrides[i].new_item);
    // A prize crystal peeks as the native crystal receipt, so the falling reward already
    // shows the assigned crystal on its way down.
    if (GameHook_IsPrizeGrantId(g_npc_overrides[i].new_item))
      return GameHook_PrizePresentationOf(g_npc_overrides[i].new_item);
    if (g_npc_overrides[i].new_item >= 76) return -1;
    return g_npc_overrides[i].new_item;
  }
  return -1;
}

// Upsert one entry; the key is (room, vanilla item, sprite discriminator).
static void RecordNpcOverride(uint16 room, uint8 vanilla_item, uint8 sprite,
                              uint8 new_item, int16 msg, int16 fire_id) {
  for (int i = 0; i < g_npc_override_count; i++) {
    if (g_npc_overrides[i].room_id == room && g_npc_overrides[i].vanilla_item == vanilla_item
        && g_npc_overrides[i].sprite_kind == sprite) {
      g_npc_overrides[i].new_item = new_item;
      g_npc_overrides[i].msg = msg;
      g_npc_overrides[i].fire_id = fire_id;
      printf("[Randomizer] Updated npc override: room 0x%03x sprite 0x%02x item 0x%02x -> 0x%02x (msg %d)\n",
             room, sprite, vanilla_item, new_item, msg);
      return;
    }
  }
  if (g_npc_override_count >= MAX_NPC_OVERRIDES) {
    printf("[Randomizer] Npc override table full!\n");
    return;
  }
  g_npc_overrides[g_npc_override_count].room_id = room;
  g_npc_overrides[g_npc_override_count].vanilla_item = vanilla_item;
  g_npc_overrides[g_npc_override_count].sprite_kind = sprite;
  g_npc_overrides[g_npc_override_count].new_item = new_item;
  g_npc_overrides[g_npc_override_count].msg = msg;
  g_npc_overrides[g_npc_override_count].fire_id = fire_id;
  g_npc_override_count++;
  printf("[Randomizer] Added npc override: room=0x%03x sprite=0x%02x item=0x%02x -> 0x%02x (msg %d)\n",
         room, sprite, vanilla_item, new_item, msg);
}

// No gate test in the exports below: they only RECORD, same contract as
// WasmSetChestSlotOverride — the gate word latches into WRAM a frame after the host
// writes it, so testing it here would silently drop every arm made at session start.
// |msg| is the entry's contextual receipt-message id, or -1 for the class default;
// |fire_id| is the host's completion id for this entry, or -1 for no report.
EMSCRIPTEN_KEEPALIVE
void WasmSetNpcGrantOverride(int room_id, int vanilla_item, int new_item, int msg, int fire_id) {
  uint16 room = room_id < 0 ? NPC_OVERRIDE_ROOM_ANY : (uint16)room_id;
  RecordNpcOverride(room, (uint8)vanilla_item, NPC_OVERRIDE_SPRITE_NONE,
                    (uint8)new_item, (int16)msg, (int16)fire_id);
}

// The sprite-keyed entry kind — for a roomless giver whose vanilla item is shared
// with other roomless givers. The host certifies (decomp audit, per sprite type)
// that the giver's grant executes inside its own sprite handler before arming one.
EMSCRIPTEN_KEEPALIVE
void WasmSetNpcGrantSpriteOverride(int sprite_type_id, int vanilla_item, int new_item,
                                   int msg, int fire_id) {
  RecordNpcOverride(NPC_OVERRIDE_ROOM_ANY, (uint8)vanilla_item, (uint8)sprite_type_id,
                    (uint8)new_item, (int16)msg, (int16)fire_id);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearNpcGrantOverrides(void) {
  g_npc_override_count = 0;
  g_bypass_once = false;
  g_match_anywhere_once = false;
  printf("[Randomizer] Cleared all npc overrides\n");
}
