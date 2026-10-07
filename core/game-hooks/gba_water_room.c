/* @layer core-game-hooks @kind native */
/**
 * The water current, and the torch that stops it.
 *
 * The cartridge marks these rooms with a layer effect of its own, which the extraction maps
 * onto this engine's flowing-water effect. Two differences: the channel runs top to bottom
 * instead of sideways, and lighting the room's torch stills the water. Returning true from the
 * current means the vanilla sideways rapids must not also run.
 */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/zelda_rtl.h"

enum { kAttrBytes = 0x1000 };

static bool g_water_room;

void GbaAlttp_ResetWaterRoom(void) {
  g_water_room = false;
}

/**
 * Give a water room the same collision on both levels.
 *
 * The engine puts a swimmer on the lower level the instant all four of its probes read deep
 * water, and the lower level reads its own attribute table - one the loader derives from the
 * covering layer. In these rooms that layer carries the water and nothing else, so the room a
 * swimmer collides against had almost none of its walls: 44 of them against the floor's 3058.
 * Being knocked about in the channel could put the player anywhere.
 *
 * These rooms are one floor with water drawn over it, not two storeys, so both levels
 * describe the same room. Copying after the overlay is what makes it the FULL room: the water
 * and the climb-out ledge are overlay records on the floor's table, not properties of a tile.
 */
void GbaAlttp_MirrorWaterRoomCollision(void) {
  enum { kFlowingWaterEffect = 3 };
  if (dung_hdr_collision_2 != kFlowingWaterEffect)
    return;
  memcpy(dung_bg1_attr_table, dung_bg2_attr_table, kAttrBytes);
}

/**
 * Is one of this room's torches burning?
 *
 * The lit torch COUNT is not the question to ask: the game only keeps that count in rooms
 * whose lighting the torches drive, so in a lit room it stays at zero however many are
 * burning. A torch's own state is the high bit of its registered position, which is what the
 * game's own torch-driven tags read.
 */
bool GbaAlttp_RoomTorchLit(void) {
  enum { kObjectSlots = 16, kLitBit = 0x8000 };
  for (int slot = 0; slot < kObjectSlots; slot++) {
    if (dung_object_tilemap_pos[slot] & kLitBit)
      return true;
  }
  return false;
}

/**
 * Should the engine's moving floor carry the player this frame?
 *
 * The engine already knows how to carry someone on a moving floor, and it does it in the one
 * place that works: inside the movement pipeline, where it sets the direction of travel and
 * lets the collision pass that runs immediately after resolve whatever the push overlaps.
 * Its own two gates are for the vanilla rooms that arrange this through tile behaviours and a
 * header byte, neither of which this room has - so this answers for it instead.
 *
 * Only a swimmer, only into water, and never mid-hop. A current is the water moving, so it
 * has no business shifting someone standing on the bank, and it must stop at the water's own
 * edge: the engine's moving floor displaces first and resolves collision after, which is
 * right for a vanilla floor walled in on every side but not for an open pool, where a push
 * that keeps going past the last water cell drives the player into whatever is beyond it.
 * The three points checked are the ones the engine's own downward probe uses, so the carry
 * stops on exactly the cells its collision would have been asked about.
 */
bool GbaAlttp_WaterCurrentCarries(void) {
  enum { kPlayerSwimming = 4, kDeepWater = 0x08, kAhead = 24 };
  static const uint8 kProbeX[] = { 0, 8, 15 };
  if (!g_water_room || !GbaAlttp_IsBakedRoomActive() || GbaAlttp_RoomTorchLit())
    return false;
  if (link_player_handler_state != kPlayerSwimming || link_auxiliary_state != 0)
    return false;
  for (int i = 0; i < 3; i++) {
    int cell = (((link_y_coord + kAhead) & 0x1f8) << 3) | (((link_x_coord + kProbeX[i]) & 0x1f8) >> 3);
    if (dung_bg2_attr_table[cell] != kDeepWater)
      return false;
  }
  return true;
}

bool GbaAlttp_ApplyWaterCurrent(void) {
  enum { kCurrentStep = 0x100 };
  if (!GbaAlttp_IsBakedRoomActive())
    return false;
  g_water_room = true;
  dung_floor_x_vel = 0;
  if (GbaAlttp_RoomTorchLit()) {
    dung_floor_y_vel = 0;
    return true;
  }
  int subpixel = dung_some_subpixel[1] + kCurrentStep;
  dung_some_subpixel[1] = (uint8)subpixel;
  dung_floor_y_vel = (uint16)(subpixel >> 8);
  return true;
}

/**
 * How long a frame of the water animation holds.
 *
 * The surface reads as moving water, not shimmering water, and it settles when the current
 * does, so the animation is part of the mechanic and not decoration. Measured off the
 * cartridge at three frames a step while the current runs; stilled water falls back to the
 * engine's own water speed, which is what the rest of the game shimmers at.
 */
uint8 GbaAlttp_AnimationPeriod(uint8 vanilla) {
  enum { kFlowingPeriod = 3 };
  if (!g_water_room || !GbaAlttp_IsBakedRoomActive())
    return vanilla;
  return GbaAlttp_RoomTorchLit() ? vanilla : kFlowingPeriod;
}

/** Is the loaded room one of the ones whose water flows? */
bool GbaAlttp_IsWaterRoom(void) {
  return g_water_room && GbaAlttp_IsBakedRoomActive();
}
