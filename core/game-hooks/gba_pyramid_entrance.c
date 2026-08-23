/* @layer core-game-hooks @kind native */
#include "gba_alttp.h"

#include "src/overworld.h"

/**
 * A map16 cell carries its artwork AND, in bit 13 of each of its four tiles, whether they draw
 * in front of the player. Every course of wall the opening reaches into therefore needs a twin
 * of itself that differs only in that bit — same tiles, same palette, same flips — so the wall
 * is pixel-identical whether or not the option is on and the sole change is that the player
 * passes behind it.
 *
 * The base game already ships twins for two of these courses. The other two are appended to the
 * map16 table by shared/asset-extraction/extensions/second-cartridge-tiles.ts, which is why
 * their ids are positional.
 */
enum { kBaseMap16Count = 3752 };

/** Each course of this wall paired with the twin of itself that draws in front of the player. */
static const uint16 kWallPriorityTwin[][2] = {
  { 0x0a03, 0x0a1c },
  { 0x0a04, 0x0a1d },
  { 0x0a14, kBaseMap16Count + 0 },
  { 0x0a0c, kBaseMap16Count + 1 },
};

static uint16 PriorityTwinOf(uint16 cell) {
  for (int i = 0; i < countof(kWallPriorityTwin); i++)
    if (kWallPriorityTwin[i][0] == cell)
      return kWallPriorityTwin[i][1];
  return cell;
}

bool GbaAlttp_IsExtraEntranceTilePair(uint16 lower_left, uint16 lower_right) {
  if (!GbaAlttp_IsAvailable() || !GbaAlttp_IsExtraDungeonEnabled())
    return false;
  const uint16 *map8 = GetMap16toMap8Table();
  for (int i = 0; i < countof(kWallPriorityTwin); i++) {
    uint16 twin = kWallPriorityTwin[i][1];
    if (twin < kBaseMap16Count)
      continue; // Already on the engine's own list of doorway tiles.
    const uint16 *cell = map8 + twin * 4;
    if ((cell[2] & 0x1ff) == lower_left && (cell[3] & 0x1ff) == lower_right)
      return true;
  }
  return false;
}

void GbaAlttp_ApplyPyramidEntrance() {
  // Data present AND the player opted in — otherwise the overworld stays untouched.
  if (!GbaAlttp_IsAvailable() || !GbaAlttp_IsExtraDungeonEnabled() ||
      BYTE(overworld_screen_index) != 0x5b)
    return;

  // Only the recess itself is borrowed from the base game's own opening — it is the one row
  // that has to change, because the dark opening is also what makes the cell walkable. The
  // courses above it keep this wall's own brick, promoted to foreground priority, so they are
  // drawn exactly as they are with the option off while still passing in front of the player.
  // Two of them, because the walk-in animation lifts the player high enough to clear one.
  enum { kRecessRow = 28 };
  static const uint16 kWallRows[] = { 26, 27 };
  static const uint16 kSourceColumns[] = { 14, 15 };
  static const uint16 kDestinationColumns[] = { 43, 44 };

  for (int i = 0; i < countof(kDestinationColumns); i++) {
    for (int r = 0; r < countof(kWallRows); r++) {
      int wall = kWallRows[r] * 64 + kDestinationColumns[i];
      Overworld_DrawMap16_Persist(wall * 2, PriorityTwinOf(dung_bg2[wall]));
    }
    int recess = kRecessRow * 64;
    Overworld_DrawMap16_Persist((recess + kDestinationColumns[i]) * 2,
                                dung_bg2[recess + kSourceColumns[i]]);
  }
  nmi_load_bg_from_vram = 1;
}
