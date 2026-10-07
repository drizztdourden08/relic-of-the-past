/* @layer core-game-hooks @kind native */
// Death link for an online multiworld: a death here is reported to the host, and a death the
// host reports from another player kills the player here.
//
// The kill uses the game's own death path. The host arms it with WasmApKillLink, and the arm
// is applied at the top of Link_ControlHandler (player.c), the one place the game turns a
// pending hit into a death: health is set to zero and an eight-unit hit is queued, so the
// damage branch right below takes health under zero and enters the death module itself, with
// its sound, the blink reset and every step of the game-over sequence after it, bottled fairy
// revival included. The arm waits while that branch would refuse a hit (the cape, a hold-up or
// any other moment the game turns sprite damage off), so the player is never left standing at
// zero health. The extra-armor cheat at full strength reduces every hit to nothing; the arm
// waits then too.
//
// The report is made where the death module commits to a game over (messaging.c
// GameOver_SplatAndFade, right after its search for a bottled fairy found none), which every
// game over runs once, whatever caused it. A fairy revival returns before that line, so a
// death the fairy undoes is never reported. |cause| is 1 when the host's kill caused it and 0
// for any other death, so the host can tell a death it must send from one it received.
//
// Gate: kFeatures5_ApDeathLink. Clear, the arm is dropped unapplied and nothing is reported,
// so both seams leave the vendored code exactly as it was. The arm is session state and never
// saved.
#include "game_hooks_internal.h"

enum { kDeathCause_Game = 0, kDeathCause_Remote = 1 };
// The hit the kill queues. Taken from zero health it wraps far past the 0xA8 bound the damage
// branch reads as a death.
#define KILL_HIT 8

static bool g_kill_pending = false;
static bool g_kill_applied = false;

static bool DeathLinkGate(void) {
  return (enhanced_features5 & kFeatures5_ApDeathLink) != 0;
}

void GameHook_ApKillApply(void) {
  // A kill applied on an earlier call enters the death module in that same call, and Link's
  // handler runs again only once that module has handed the game back without a game over: a
  // bottled fairy revived him (GameOver_ResituateLink). That death never committed, so the flag
  // goes, and a later death of his own is reported as his own.
  g_kill_applied = false;
  if (!g_kill_pending) return;
  if (!DeathLinkGate()) {
    g_kill_pending = false;
    return;
  }
  // The damage branch below refuses the hit in exactly these cases.
  if (link_cape_mode || link_disable_sprite_damage) return;
  if (GameHook_ApplyExtraArmor(KILL_HIT) == 0) return;
  g_kill_pending = false;
  g_kill_applied = true;
  link_health_current = 0;
  link_give_damage = KILL_HIT;
}

void GameHook_LinkDied(void) {
  int cause = g_kill_applied ? kDeathCause_Remote : kDeathCause_Game;
  g_kill_pending = false;
  g_kill_applied = false;
  if (!DeathLinkGate()) return;
  EM_ASM({ if (typeof window !== 'undefined' && window.__onLinkDied) window.__onLinkDied($0); }, cause);
}

// Record-only, the shared latching contract: the gate is tested where the arm is applied. A kill
// that arrives while the death module already runs is dropped, so it cannot land after the
// respawn as a second death.
EMSCRIPTEN_KEEPALIVE
void WasmApKillLink(void) {
  if (main_module_index == MODULE_GAME_OVER) return;
  g_kill_pending = true;
}
