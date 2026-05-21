#include "game_hooks_internal.h"

// ─── Haptic Event Hooks ───
// Emit haptic feedback events to the JS layer via EM_ASM.
// These are called from strategic points in the game logic (player.c, sprite.c)
// to notify the frontend about combat/action events that should produce vibration.

void GameHook_NotifySwordSwing(void) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(0 /* SWORD_SWING */, 0);
    }
  });
}

void GameHook_NotifySwordHitEnemy(uint8 damage_dealt) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(1 /* SWORD_HIT_ENEMY */, $0);
    }
  }, damage_dealt);
}

void GameHook_NotifySwordClink(void) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(2 /* SWORD_CLINK */, 0);
    }
  });
}

void GameHook_NotifyDamageTaken(uint8 damage_amount) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(3 /* DAMAGE_TAKEN */, $0);
    }
  }, damage_amount);
}

void GameHook_NotifyItemUsed(uint8 item_id) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(4 /* ITEM_USED */, $0);
    }
  }, item_id);
}

void GameHook_NotifyEnvironmentalEvent(uint8 event_type) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onHapticEvent) {
      window.__onHapticEvent(5 /* ENVIRONMENTAL */, $0);
    }
  }, event_type);
}
