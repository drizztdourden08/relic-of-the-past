/* @layer core-game-hooks @kind native */
// Physical substitution for the free-standing key drops — the ground counterpart of
// item_overrides.c (chests) and npc_overrides.c (scripted givers). Entries are keyed by
// (room, drop size): every certified key-drop check is the only drop of its size in its
// room, and both the carrier kinds (an enemy-held drop released at death, a drop spawned
// from under a pot) funnel into the same two free-standing sprite types on the ground.
//
// Two seams, both inside the sprite layer:
// - grant: the one absorption handler every free-standing pickup crosses. A matched drop
//   skips the vanilla grant entirely (the silent counter bump for the small drop, the
//   native receive call for the large one) and instead grants the assigned item through
//   the same receive path a scripted giver uses — hold-up animation, contextual receipt
//   message, inventory write — while still writing the room's vanilla pickup bits, so
//   the drop despawns on revisit and the host's location poller sees the same flags.
// - draw: the drop lying/falling on the ground renders as the ASSIGNED item, using the
//   receipt art pipeline (the shared animated-tile decode slot + the receipt's own OAM
//   shape), so what the player sees on the floor is what the pickup will grant.
#include "game_hooks_internal.h"
#include "sprite_art_slots.h"
#include "src/sprite.h"

#define MAX_DROP_OVERRIDES 40

// The two free-standing drop sprite types (small 0xE4 / large 0xE5).
#define DROP_SPRITE_SMALL 0xe4
#define DROP_SPRITE_LARGE 0xe5

typedef struct {
  uint16 room_id;
  uint8 big;       // 1 = the large-key drop sprite, 0 = the small-key drop sprite
  uint8 new_item;
  // Pre-rendered contextual receipt-message id for THIS grant, or -1 for the class default.
  int16 msg;
  // Host-assigned completion id reported the moment this entry substitutes
  // (GameHook_NotifyOverrideFired), or -1 for no report.
  int16 fire_id;
} DropOverride;

static DropOverride g_drop_overrides[MAX_DROP_OVERRIDES];
static int g_drop_override_count = 0;

// The armed entry for sprite |k|, or NULL. Gate enforced here, at the application
// site only (the setters below record blind — the SyncGateWords latching contract).
static const DropOverride *FindDropOverride(int k) {
  if (!(enhanced_features3 & kFeatures3_DropOverrides)) return NULL;
  uint8 type = sprite_type[k];
  if (type != DROP_SPRITE_SMALL && type != DROP_SPRITE_LARGE) return NULL;
  if (!player_is_indoors) return NULL;
  uint8 big = type == DROP_SPRITE_LARGE;
  for (int i = 0; i < g_drop_override_count; i++) {
    if (g_drop_overrides[i].room_id != dungeon_room_index || g_drop_overrides[i].big != big) continue;
    // The receipt arrays are exactly 76 entries — anything past them corrupts g_ram
    // (the same bound WasmGrantItemWithReceipt enforces), so an oversized id armed by
    // a buggy host is ignored rather than granted or drawn. The virtual upgrade ids
    // are the one sanctioned exception: they resolve to a native item before any array.
    if (g_drop_overrides[i].new_item >= 76
        && !GameHook_IsVirtualGrantId(g_drop_overrides[i].new_item)) return NULL;
    return &g_drop_overrides[i];
  }
  return NULL;
}

bool GameHook_OverrideDropAbsorption(int k) {
  const DropOverride *entry = FindDropOverride(k);
  if (entry == NULL) return false;
  sprite_state[k] = 0;
  // The vanilla pickup bookkeeping, byte for byte: the per-ordinal room state bit is
  // what despawns the drop on revisit AND what the host's location poller reads, and
  // the death flag keeps an enemy-carried drop from respawning with its carrier.
  sprite_N[k] = sprite_subtype[k];
  dung_savegame_state_bits |= kAbsorbBigKey[sprite_die_action[k] & 1] << 8;
  Sprite_ManuallySetDeathFlagUW(k);
  // Native receive of the ASSIGNED item: hold-up pose, receipt art, inventory write.
  // The entry's own pre-rendered line wins; the item-class template is the fallback
  // (the same contract as the chest and npc override tables).
  if (entry->msg >= 0)
    GameHook_ArmReceiptMessageIfClear(entry->msg);
  // A virtual upgrade id resolves here, before the receive flow ever sees it.
  uint8 grant = GameHook_ResolveGrantItem(entry->new_item);
  if (entry->msg < 0)
    GameHook_ArmReceiptClassMessage(grant, kReceiptMsg_Generic);
  item_receipt_method = 0;
  // This grant carries an already-assigned item — the npc-override seam inside the
  // receive path must not re-substitute it.
  GameHook_NpcOverrideBypassOnce();
  Link_ReceiveItem(grant, 0);
  GameHook_NotifyOverrideFired(entry->fire_id);
  printf("[Randomizer] Drop override granted: room 0x%03x %s -> 0x%02x\n",
         entry->room_id, entry->big ? "large" : "small", entry->new_item);
  return true;
}

bool GameHook_DrawDropOverride(int k) {
  const DropOverride *entry = FindDropOverride(k);
  if (entry == NULL) return false;
  // A small-drop hitbox is half a tile wide; center the receipt's full-tile art on it.
  bool drawn = GameHook_DrawSpriteAsReceiptItem(k, entry->new_item, entry->big ? 0 : -4, 0);
  // A capacity upgrade shows its own icon over the presentation's fresh decode.
  if (drawn) GameHook_WriteUpgradeIconFor(entry->new_item);
  // Last write before the upload, so the glint runs over the icon as well as the art.
  if (drawn) GameHook_ApplyItemSheen();
  // Finished picture into this sprite's own tiles, so a second drop drawn later this
  // frame cannot overwrite it (sprite_art_slots.c).
  if (drawn) GameHook_CommitSpriteArt(k);
  return drawn;
}

// Record-only setters, the same contract as WasmSetChestSlotOverride: the gate word
// latches into WRAM a frame after the host writes it, so testing it here would silently
// drop every arm made at session start. |msg| is the entry's contextual receipt-message
// id, or -1 for the class default; |fire_id| is the host's completion id for this
// entry, or -1 for no report.
EMSCRIPTEN_KEEPALIVE
void WasmSetDropOverride(int room_id, int big, int new_item, int msg, int fire_id) {
  for (int i = 0; i < g_drop_override_count; i++) {
    if (g_drop_overrides[i].room_id == (uint16)room_id && g_drop_overrides[i].big == (uint8)(big != 0)) {
      g_drop_overrides[i].new_item = (uint8)new_item;
      g_drop_overrides[i].msg = (int16)msg;
      g_drop_overrides[i].fire_id = (int16)fire_id;
      printf("[Randomizer] Updated drop override: room 0x%03x big=%d -> 0x%02x (msg %d)\n",
             room_id, big != 0, new_item, msg);
      return;
    }
  }
  if (g_drop_override_count >= MAX_DROP_OVERRIDES) {
    printf("[Randomizer] Drop override table full!\n");
    return;
  }
  g_drop_overrides[g_drop_override_count].room_id = (uint16)room_id;
  g_drop_overrides[g_drop_override_count].big = (uint8)(big != 0);
  g_drop_overrides[g_drop_override_count].new_item = (uint8)new_item;
  g_drop_overrides[g_drop_override_count].msg = (int16)msg;
  g_drop_overrides[g_drop_override_count].fire_id = (int16)fire_id;
  g_drop_override_count++;
  printf("[Randomizer] Added drop override: room=0x%03x big=%d -> 0x%02x (msg %d)\n",
         room_id, big != 0, new_item, msg);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearDropOverrides(void) {
  g_drop_override_count = 0;
  printf("[Randomizer] Cleared all drop overrides\n");
}
