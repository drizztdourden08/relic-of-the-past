/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Haptic Event Hooks ───
// Emit haptic feedback events to the JS layer via EM_ASM.
// These are called from specific points in the game logic (player.c, sprite.c,
// ancilla.c) to notify the frontend about combat/action events that should
// produce vibration. Event-type constants (HAPTIC_*) live in game_constants.h
// and must match HapticEventType in haptics.ts.

// Single JS-interop site: every notifier funnels through here so the
// window-guard and the __onHapticEvent contract are defined exactly once.
static void EmitHaptic(int type, int arg) {
  // Opt-in gate: with haptics off, fire zero JS host-calls (no EM_ASM at all).
  if (!(enhanced_features0 & kFeatures0_Haptics)) return;
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent($0, $1);
    }
  }, type, arg);
}

void GameHook_NotifySwordSwing(int swing_type) {
  EmitHaptic(HAPTIC_SWORD_SWING, swing_type);
}

void GameHook_NotifySwordHitEnemy(uint8 damage_dealt) {
  EmitHaptic(HAPTIC_SWORD_HIT_ENEMY, damage_dealt);
}

void GameHook_NotifySwordClink(void) {
  EmitHaptic(HAPTIC_SWORD_CLINK, 0);
}

void GameHook_NotifyDamageTaken(uint8 damage_amount) {
  EmitHaptic(HAPTIC_DAMAGE_TAKEN, damage_amount);
}

void GameHook_NotifyItemUsed(uint8 item_id) {
  EmitHaptic(HAPTIC_ITEM_USED, item_id);
}

void GameHook_NotifyEnvironmentalEvent(uint8 event_type) {
  EmitHaptic(HAPTIC_ENVIRONMENTAL, event_type);
}

void GameHook_NotifyHookshotWall(void) {
  EmitHaptic(HAPTIC_HOOKSHOT_WALL, 0);
}

void GameHook_NotifyBoomerangCatch(void) {
  EmitHaptic(HAPTIC_BOOMERANG_CATCH, 0);
}
