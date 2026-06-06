/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Haptic Event Hooks ───
// Emit haptic feedback events to the JS layer via EM_ASM.
// These are called from strategic points in the game logic (player.c, sprite.c, ancilla.c)
// to notify the frontend about combat/action events that should produce vibration.
//
// Event type enum (must match HapticEventType in haptics.ts):
//   0 = SWORD_SWING
//   1 = SWORD_HIT_ENEMY
//   2 = SWORD_CLINK
//   3 = DAMAGE_TAKEN
//   4 = ITEM_USED
//   5 = ENVIRONMENTAL
//   6 = HOOKSHOT_WALL
//   7 = BOOMERANG_CATCH

void GameHook_NotifySwordSwing(int swing_type) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(0, $0);
    }
  }, swing_type);
}

void GameHook_NotifySwordHitEnemy(uint8 damage_dealt) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(1, $0);
    }
  }, damage_dealt);
}

void GameHook_NotifySwordClink(void) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(2, 0);
    }
  });
}

void GameHook_NotifyDamageTaken(uint8 damage_amount) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(3, $0);
    }
  }, damage_amount);
}

void GameHook_NotifyItemUsed(uint8 item_id) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(4, $0);
    }
  }, item_id);
}

void GameHook_NotifyEnvironmentalEvent(uint8 event_type) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(5, $0);
    }
  }, event_type);
}

void GameHook_NotifyHookshotWall(void) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(6, 0);
    }
  });
}

void GameHook_NotifyBoomerangCatch(void) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(7, 0);
    }
  });
}

