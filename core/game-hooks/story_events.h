/* @layer core-game-hooks @kind native */
// The story-event surface: the ledger (events/) and the gates (story_events.c). Included from
// game_hooks.h, so every vendored call site sees it through the one hook header.
#ifndef GAME_HOOKS_STORY_EVENTS_H
#define GAME_HOOKS_STORY_EVENTS_H

#include "src/types.h"
#include "events/event_ids.h"

// The event ledger: one bit per event the game never records for itself.
// RecordEvent is a gated test-and-set (kFeatures5_EventLedger); HasEvent is never gated.
void GameHook_RecordEvent(EventId id);
bool GameHook_HasEvent(EventId id);
// The recorders. FrameEnd watches the game's own bytes for edges (areas, entrances, followers,
// the facts the game writes and erases); Receipt classifies a Link_ReceiveItem by its giver;
// BossHeartSpawned is the heart container's first activation, the moment a boss is dead.
void GameHook_EventWatchFrameEnd(void);
void GameHook_EventReceipt(uint8 item_id, uint8 method);
void GameHook_BossHeartSpawned(int k);

// True once the pedestal ceremony has been completed, which is what the game means when it reads a
// beam blade as proof the captive was taken from the sanctuary. With kFeatures5_PedestalScenes
// clear this is the vendored expression, link_sword_type >= 2.
bool GameHook_PedestalClaimed(void);

// The story gates. |vanilla| is the call site's own expression, returned untouched while the
// gate's word-5 field is zero.
typedef enum {
  kGate_PedestalScenes,   // the scenes that read a beam blade as "the pedestal ceremony happened"
  kGate_Pedestal,         // what the pedestal asks for
  kGate_Sahasrahla,       // the eastern sage's gift
  kGate_Barrier,          // what breaks the castle barrier
  kGate_BombShop,         // when the big bomb goes on sale
  kGate_Tower,            // when the last tower opens
  kGate_Ganon,            // when the last boss takes damage
  kGate_HeraMusic,        // the tower's boss music
  kGate_Vane,             // the weathervane scene and the stump
  kGate_MountainRespawn,  // the continue menu's mountain spawn
} StoryGate;
bool GameHook_StoryGate(StoryGate gate, bool vanilla);
// sprite.c Sprite_ApplyCalculatedDamage: the blow the castle barrier takes under kGate_Barrier
// (story_barrier.c); |dmg| is the table's own value and passes through while the field is zero.
uint8 GameHook_BarrierDamage(int k, uint8 dmg);
// A possession-gated re-offer with no giver bit of its own; the stump's four-way offer state.
bool GameHook_GiverTaken(EventId id, bool vanilla);
int GameHook_StumpState(int vanilla);
// The falling reward of |palace| was picked up (ledger, or an older file's own reward in hand).
bool GameHook_PrizeTaken(int palace);
void GameHook_StoryGatesFrameEnd(void);
int GameHook_StoryCount(int which);

#endif  // GAME_HOOKS_STORY_EVENTS_H
