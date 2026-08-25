/* @layer core-game-hooks @kind native */
/**
 * Pins the camera to a room's real content span.
 *
 * The port padded some rooms' unused side columns with copies of the opposite side; original
 * hardware never scrolls there, so the padding is never seen. The extraction detects that
 * padding and stores the true camera range per room. This holds the engine's own room-bounds
 * registers to that range every frame, after game logic and before the draw, so the incremental
 * quadrant and transition adjustments cannot walk the camera onto the padding. Rooms with an
 * empty record — and every base-game room — keep fully vanilla camera behaviour.
 */
#include "gba_alttp_internal.h"

#include "src/variables.h"
#include "src/zelda_rtl.h"

void GbaAlttp_PinCameraBounds(void) {
  if (!GbaAlttp_IsPalaceActive())
    return;
  int index = GbaAlttpFindRoom(dungeon_room_index);
  if (index < 0)
    return;
  MemBlk rec = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetCameraBounds), index);
  if (rec.size < 6)
    return;
  uint16 flags = (uint16)(rec.ptr[0] | (rec.ptr[1] << 8));
  uint16 cam_min = (uint16)(rec.ptr[2] | (rec.ptr[3] << 8));
  uint16 cam_max = (uint16)(rec.ptr[4] | (rec.ptr[5] << 8));
  if (flags & 1) {
    room_bounds_x.a0 = room_bounds_x.b0 = cam_min;
    room_bounds_x.a1 = room_bounds_x.b1 = cam_max;
    if ((uint16)BG2HOFS_copy2 < cam_min)
      BG2HOFS_copy2 = BG1HOFS_copy2 = BG2HOFS_copy = BG1HOFS_copy = cam_min;
    if ((uint16)BG2HOFS_copy2 > cam_max)
      BG2HOFS_copy2 = BG1HOFS_copy2 = BG2HOFS_copy = BG1HOFS_copy = cam_max;
  }
}
