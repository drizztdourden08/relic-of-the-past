/* @layer core-game-hooks @kind native */
// Retro bow, the world half: arrows stop turning up on the ground.
//
// The reference takes every arrow out of the world it can reach with a patch. The
// five-arrow and ten-arrow prizes become the blue and the red rupee in the enemy
// prize packs, the dig prizes, the tree pulls, the rupee crab, the stunned-enemy and
// saved-fish prizes (Rom.py prize_replacements, 0xE1 -> 0xDA and 0xE2 -> 0xDB, applied
// whether or not the packs are shuffled), under pots (0x301FC) and in the bottle
// merchant's fish reward (0x30052). The thief and the pikit read an empty arrow
// counter so they steal rupees instead (0xECB4E, 0xF0D96), and the chest game hands
// over rupees where it handed over arrows (0xEDA5). Every one of those writes exists
// because the counter is the quiver (retro_bow.c): an arrow that landed in it would
// hand the player a quiver they never bought.
//
// This file reaches the same set through the two places every ground prize is given
// its type, rather than through the tables one by one:
//   - Sprite_SpawnDynamicallyEx, which every dynamic spawn runs through: the pot
//     secrets, the thief's spill, the merchant's fish, the tree pulls and the crab;
//   - PrepareEnemyDrop, which every death drop runs through: the prize packs and the
//     pikit's stolen goods.
// Plus the two thefts and the chest game's prize roll, which read a value rather than
// spawn a sprite. Gate off, every seam hands back exactly what it was given.
#include "game_hooks_internal.h"
#include "src/sprite.h"

// The two arrow prizes, and the rupees the reference turns them into.
#define PRIZE_ARROWS_5 0xe1
#define PRIZE_ARROWS_10 0xe2
#define PRIZE_RUPEE_BLUE 0xda
#define PRIZE_RUPEE_RED 0xdb

// The chest game's two arrow rewards and their rupee stand-ins (Rom.py 0xEDA5).
#define RECEIPT_SINGLE_ARROW 0x43
#define RECEIPT_ARROWS_10 0x44
#define RECEIPT_RUPEES_5 0x35
#define RECEIPT_RUPEES_50 0x41

// The sprite type a ground prize is really given. |type| is what the vendored spawn
// was about to write; with retro off it is written unchanged.
uint8 GameHook_RetroPrizeType(uint8 type) {
  if (!GameHook_RetroBowActive()) return type;
  if (type == PRIZE_ARROWS_5) return PRIZE_RUPEE_BLUE;
  if (type == PRIZE_ARROWS_10) return PRIZE_RUPEE_RED;
  return type;
}

// What the thief and the pikit see when they roll for arrows. With retro on the
// counter is the quiver and cannot be stolen, so they see an empty one and the roll
// falls through exactly as it does for a player carrying no arrows.
uint8 GameHook_StealableArrows(void) {
  return GameHook_RetroBowActive() ? 0 : link_num_arrows;
}

// The chest game's rolled reward, before it reaches the receive path.
uint8 GameHook_RetroMinigamePrize(uint8 item) {
  if (!GameHook_RetroBowActive()) return item;
  if (item == RECEIPT_SINGLE_ARROW) return RECEIPT_RUPEES_5;
  if (item == RECEIPT_ARROWS_10) return RECEIPT_RUPEES_50;
  return item;
}

// Headless probes, gated on the REQUESTED developer-tools bit like every other probe
// (capacity_probes.c). WasmProbeDropPickup spawns a ground prize of |type| through the
// vendored dynamic spawn, which is the seam itself, then absorbs it exactly as walking
// over it would, and hands back the type the sprite really carried. The harness reads
// the arrow and rupee counters around it.
static bool ProbeGate(void) {
  return (g_wanted_gate_words[0] & kFeatures0_DeveloperTools) != 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeDropPickup(int prize_type) {
  if (!ProbeGate()) return -1;
  SpriteSpawnInfo info;
  int j = Sprite_SpawnDynamicallyEx(0, (uint8)prize_type, &info, 15);
  if (j < 0) return -1;
  uint8 spawned = sprite_type[j];
  Sprite_HandleAbsorptionByPlayer(j);
  return spawned;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeStealableArrows(void) {
  return ProbeGate() ? GameHook_StealableArrows() : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeMinigamePrize(int item) {
  return ProbeGate() ? GameHook_RetroMinigamePrize((uint8)item) : -1;
}
