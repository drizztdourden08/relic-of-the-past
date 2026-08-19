/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Tracker Notifications ───
// This is the only function remaining in game_hooks.c — it's a thin
// JS interop callback that doesn't belong to any larger domain.

void GameHook_NotifyItemReceived(uint8 item_id, uint8 method) {
  // Opt-in gate: with tracker notifications off, fire zero JS host-calls, same contract as haptics.
  if (!(enhanced_features3 & kFeatures3_TrackerNotifications)) return;
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onItemReceived) {
      window.__onItemReceived($0, $1);
    }
  }, item_id, method);
}
