/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include "src/variables.h"
#include "src/zelda_rtl.h"

/**
 * Landing for teleport-door travel between non-adjacent rooms.
 *
 * The engine's transition treats every horizontal crossing as an adjacent seam: the player
 * keeps the seam offset (the room's far margin), rides the camera, then snaps to a landing
 * table keyed off the attribute under them - all derived from geometry these doors don't
 * have. Instead the arrival stands in the destination door mouth, holds still through the
 * pan, and steps out just clear of the door frame, which is where the original game leaves
 * the player.
 */
enum {
  kTeleportEnterRight = 2,
  kTeleportEnterLeft = 3,
  kTeleportWestMouthX = 3 * 8,
  kTeleportWestStop = 0x14,
  kTeleportEastMouthX = 61 * 8,
  kTeleportEastStop = 0xdc,
};
static uint8 g_teleport_arrival;

void GbaAlttp_ArmTeleportArrival(uint8 entering_left) {
  if (!GbaAlttp_IsBakedRoomActive())
    return;
  g_teleport_arrival = entering_left ? kTeleportEnterLeft : kTeleportEnterRight;
}

void GbaAlttp_PlaceTeleportArrival(void) {
  if (!g_teleport_arrival)
    return;
  uint16 mouth = g_teleport_arrival == kTeleportEnterRight ? kTeleportWestMouthX : kTeleportEastMouthX;
  /* Anchor to the room's own column base: entering rightward the coordinate still sits in
     the 512px block west of the boundary, so masking the current position picks that block. */
  link_x_coord = (uint16)((dungeon_room_index & 0xf) << 9) | mouth;
}

bool GbaAlttp_TeleportArrivalHoldsPlayer(void) {
  return g_teleport_arrival != 0;
}

bool GbaAlttp_TeleportLandingSnap(void) {
  if (!g_teleport_arrival)
    return false;
  uint8 stop = g_teleport_arrival == kTeleportEnterRight ? kTeleportWestStop : kTeleportEastStop;
  BYTE(link_x_coord) = g_teleport_arrival == kTeleportEnterRight ? stop - 8 : stop + 8;
  link_visibility_status = 0;
  return true;
}

bool GbaAlttp_TeleportWalkTarget(uint8 *target) {
  if (!g_teleport_arrival)
    return false;
  *target = g_teleport_arrival == kTeleportEnterRight ? kTeleportWestStop : kTeleportEastStop;
  return true;
}

void GbaAlttp_TeleportArrivalDone(void) {
  g_teleport_arrival = 0;
}
