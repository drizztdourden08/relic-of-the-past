/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Tracker Notifications ───
// Thin JS interop callbacks that don't belong to any larger domain.

void GameHook_NotifyItemReceived(uint8 item_id, uint8 method) {
  // The receipt was just added and no frame has run: the one moment a progressive grant
  // can take back the ceremony state a second-blade receipt starts (progressive_grants.c).
  // A no-op unless a gated resolver armed it, so this precedes the notification gate.
  GameHook_ProgressiveAfterReceipt(item_id);
  // The receipt just created owns the armed one-shot message; a stale arm is dropped here
  // (receipt_messages.c). Precedes the notification gate for the same reason.
  GameHook_ReceiptMessageClaim();
  // Opt-in gate: with tracker notifications off, fire zero JS host-calls, same contract as haptics.
  if (!(enhanced_features3 & kFeatures3_TrackerNotifications)) return;
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onItemReceived) {
      window.__onItemReceived($0, $1);
    }
  }, item_id, method);
}

// A physical override entry substituted its grant — by definition the check it stands
// for is completed this instant, so the host is told directly instead of inferring it
// from save-flag or possession polling (several giver checks have no reliable flag).
// |fire_id| is the host-assigned id the arming call carried; -1 means no report.
// No separate gate: this only ever fires from inside a substitution whose own table
// gate (npc/drop/standing overrides) was already open.
void GameHook_NotifyOverrideFired(int fire_id) {
  if (fire_id < 0) return;
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onOverrideFired) {
      window.__onOverrideFired($0);
    }
  }, fire_id);
}
