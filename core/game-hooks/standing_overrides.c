/* @layer core-game-hooks @kind native */
// Physical substitution for standing in-world prizes — the free-standing pickups the
// player touches in the world (the overworld race/ledge/island prizes and their indoor
// cave counterparts). The counterpart of drop_overrides.c for the standing prize
// sprite: same two seams, same draw discipline.
//
// Entries key by (area, sprite type): the overworld screen index for an outdoor prize,
// the room index for an indoor one. Two indoor prizes can share one room index (the
// game tells them apart by which horizontal half the sprite stands in — the same bit
// its own obtained-flag bookkeeping uses), so an indoor entry also carries that half.
//
// - grant: the touch pickup inside the prize sprite's own handler. A matched sprite
//   skips the vanilla piece-counter grant entirely and receives the ASSIGNED item
//   through the native receive path (hold-up, receipt art, inventory write), then
//   writes the vanilla obtained flag byte-for-byte via the game's own helper — so the
//   prize despawns on revisit and the host's location poller sees the same bit.
// - draw: the prize renders as the ASSIGNED item via the receipt art pipeline, so what
//   the player sees standing in the world is what the pickup will grant.
#include "game_hooks_internal.h"
#include "sprite_art_slots.h"
#include "src/sprite.h"
#include "src/sprite_main.h"

#define MAX_STANDING_OVERRIDES 24
#define STANDING_HALF_ANY 2

typedef struct {
  uint16 area;   // overworld screen index (outdoor) or room index (indoor)
  uint8 indoors; // 1 = |area| is a room index
  uint8 sprite;  // the standing prize's sprite type
  uint8 half;    // indoor only: 0 = left half of the room, 1 = right, 2 = either
  uint8 new_item;
  // Pre-rendered contextual receipt-message id for THIS grant, or -1 for the class default.
  int16 msg;
  // Host-assigned completion id reported the moment this entry substitutes
  // (GameHook_NotifyOverrideFired), or -1 for no report.
  int16 fire_id;
} StandingOverride;

static StandingOverride g_standing_overrides[MAX_STANDING_OVERRIDES];
static int g_standing_override_count = 0;

// The armed entry for sprite |k|, or NULL. Gate enforced here, at the application
// site only (the setters below record blind — the SyncGateWords latching contract).
static const StandingOverride *FindStandingOverride(int k) {
  if (!(enhanced_features3 & kFeatures3_StandingOverrides)) return NULL;
  uint16 area = player_is_indoors ? dungeon_room_index : (uint16)BYTE(overworld_screen_index);
  for (int i = 0; i < g_standing_override_count; i++) {
    const StandingOverride *entry = &g_standing_overrides[i];
    if (entry->sprite != sprite_type[k]) continue;
    if ((entry->indoors != 0) != (player_is_indoors != 0) || entry->area != area) continue;
    if (entry->indoors && entry->half != STANDING_HALF_ANY
        && entry->half != (sprite_x_hi[k] & 1)) continue;
    // The receipt arrays are exactly 76 entries — anything past them corrupts g_ram
    // (the same bound the drop table enforces), so an oversized id armed by a buggy
    // host is ignored rather than granted or drawn. The virtual ids (upgrade and
    // progressive) are the one sanctioned exception: they resolve to a native item
    // before any array.
    if (entry->new_item >= 76 && !GameHook_IsVirtualGrantId(entry->new_item)) return NULL;
    return entry;
  }
  return NULL;
}

// The shared grant tail: vanilla despawn already done by the caller, message armed,
// assigned item received natively, completion reported to the host.
static void GrantStandingEntry(const StandingOverride *entry) {
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
  printf("[Randomizer] Standing override granted: %s 0x%03x -> 0x%02x\n",
         entry->indoors ? "room" : "screen", entry->area, entry->new_item);
}

bool GameHook_OverrideStandingAbsorption(int k) {
  const StandingOverride *entry = FindStandingOverride(k);
  if (entry == NULL) return false;
  sprite_state[k] = 0;
  // The vanilla pickup bookkeeping via the game's own helper: the obtained bit is what
  // despawns the prize on revisit AND what the host's location poller reads.
  HeartUpgrade_SetObtainedFlag(k);
  GrantStandingEntry(entry);
  return true;
}

// Grant seam for the dash-item key (the standing dungeon key knocked down by a dash).
// Its vanilla pickup crosses no receive seam at all — a silent key-counter bump — so
// the interception replaces the whole grant: the vanilla taken-bit is mirrored
// byte-for-byte from the handler's own write, then the assigned item is received.
bool GameHook_OverrideBonkKeyGrant(int k) {
  const StandingOverride *entry = FindStandingOverride(k);
  if (entry == NULL) return false;
  sprite_state[k] = 0;
  dung_savegame_state_bits |= sprite_die_action[k] ? 0x2000 : 0x4000;
  GrantStandingEntry(entry);
  return true;
}

bool GameHook_DrawStandingOverride(int k) {
  const StandingOverride *entry = FindStandingOverride(k);
  if (entry == NULL) return false;
  bool drawn = GameHook_DrawSpriteAsReceiptItem(k, entry->new_item, 0, 0);
  // A capacity upgrade shows its own icon over the presentation's fresh decode.
  if (drawn) GameHook_WriteUpgradeIconFor(entry->new_item);
  // Last write before the upload, so the glint runs over the icon as well as the art.
  if (drawn) GameHook_ApplyItemSheen();
  // Finished picture into this sprite's own tiles, so a second one drawn later this frame
  // cannot overwrite it (sprite_art_slots.c).
  if (drawn) GameHook_CommitSpriteArt(k);
  return drawn;
}

// Record-only setters, the same contract as the other override tables: the gate word
// latches into WRAM a frame after the host writes it, so testing it here would silently
// drop every arm made at session start. |msg| is the entry's contextual receipt-message
// id, or -1 for the class default. |half| is 0/1 for an indoor entry pinned to one
// horizontal half of its room, 2 for either half (and for every outdoor entry).
// |fire_id| is the host's completion id for this entry, or -1 for no report.
EMSCRIPTEN_KEEPALIVE
void WasmSetStandingOverride(int area, int indoors, int sprite, int half,
                             int new_item, int msg, int fire_id) {
  for (int i = 0; i < g_standing_override_count; i++) {
    StandingOverride *entry = &g_standing_overrides[i];
    if (entry->area == (uint16)area && entry->indoors == (uint8)(indoors != 0)
        && entry->sprite == (uint8)sprite && entry->half == (uint8)half) {
      entry->new_item = (uint8)new_item;
      entry->msg = (int16)msg;
      entry->fire_id = (int16)fire_id;
      printf("[Randomizer] Updated standing override: area 0x%03x -> 0x%02x (msg %d)\n",
             area, new_item, msg);
      return;
    }
  }
  if (g_standing_override_count >= MAX_STANDING_OVERRIDES) {
    printf("[Randomizer] Standing override table full!\n");
    return;
  }
  StandingOverride *entry = &g_standing_overrides[g_standing_override_count++];
  entry->area = (uint16)area;
  entry->indoors = (uint8)(indoors != 0);
  entry->sprite = (uint8)sprite;
  entry->half = (uint8)half;
  entry->new_item = (uint8)new_item;
  entry->msg = (int16)msg;
  entry->fire_id = (int16)fire_id;
  printf("[Randomizer] Added standing override: area=0x%03x indoors=%d sprite=0x%02x half=%d -> 0x%02x (msg %d)\n",
         area, indoors != 0, sprite, half, new_item, msg);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearStandingOverrides(void) {
  g_standing_override_count = 0;
  printf("[Randomizer] Cleared all standing overrides\n");
}
