/* @layer core-game-hooks @kind native */
#include "gba_alttp.h"

#include "src/overworld.h"

void GbaAlttp_ApplyPyramidEntrance() {
  // Data present AND the player opted in — otherwise the overworld stays untouched.
  if (!GbaAlttp_IsAvailable() || !GbaAlttp_IsExtraDungeonEnabled() ||
      BYTE(overworld_screen_index) != 0x5b)
    return;

  // Reuse the Pyramid's west wall opening and its brown foreground overhang.
  // The overhang carries the native priority/collision needed to walk Link
  // into the hole while drawing the wall in front of him.
  static const uint16 kSource[] = {
    27 * 64 + 14, 27 * 64 + 15,
    28 * 64 + 14, 28 * 64 + 15,
  };
  static const uint16 kDestination[] = {
    27 * 64 + 43, 27 * 64 + 44,
    28 * 64 + 43, 28 * 64 + 44,
  };
  for (int i = 0; i < countof(kSource); i++)
    Overworld_DrawMap16_Persist(kDestination[i] * 2, dung_bg2[kSource[i]]);
  nmi_load_bg_from_vram = 1;
}
