/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

// ─── Host-owned gear tiers ───
// The host pause menu lets the player set the sword, shield and mail tier directly. Writing the field
// alone would be half the change: the tier is both a gameplay number (damage dealt, damage taken) and
// a palette. The player's own colors come from the gear palettes, and the gloves color is refreshed
// separately on top of them. Doing all three here is what makes a tier change repaint the character
// and change the numbers in the same breath, instead of leaving the sprite a frame behind.
//
// The fourth kind is not a tier at all. See SetArrowType.

enum {
  kGearKind_Sword = 0,
  kGearKind_Shield = 1,
  kGearKind_Mail = 2,
  kGearKind_Arrows = 3,
};

enum {
  kMaxSwordTier = 4,   // 0 = none, 1-4 the four blades
  kMaxShieldTier = 3,  // 0 = none, 1-3
  kMaxMailTier = 2,    // 0-2, the three outfits
  kMaxArrowType = 1,   // 0 = plain, 1 = silver. A TYPE, not a rank
};

// The launcher register encodes TWO facts in one byte, which is why it cannot be written the way the
// three tier fields are:
//
//   1 = plain, empty      2 = plain, carrying
//   3 = silver, empty     4 = silver, carrying
//
// The type is therefore the step of two and "is anything on hand" is the remaining half, and a write
// derived from the type alone would silently empty a full quiver or hand over a free supply. So the
// carrying half is read back out of the LIVE value and put straight back, and only the type moves:
// 1<->3 and 2<->4, never 2->3.
//
// Zero is a third state, "nothing to fire with at all", and this menu never leaves it: the row is
// about which ammunition is nocked, not about owning the launcher, so a press with nothing held is
// refused instead of granting one. Returns false when the write was declined.
static bool SetArrowType(int type) {
  uint8 live = link_item_bow;
  if (live == 0)
    return false;
  uint8 carrying = (uint8)(live == 2 || live == 4);
  link_item_bow = (uint8)(1 + clampi(type, 0, kMaxArrowType) * 2 + carrying);
  return true;
}

// GATE: HostMenu. |kind| is one of kGearKind_*, |tier| is clamped into that kind's range instead
// of refused, so a renderer built against a longer tier list cannot write a value the palette
// tables have no row for.
EMSCRIPTEN_KEEPALIVE
void WasmHostSetGear(int kind, int tier) {
  if (!HostMenuGate())
    return;
  switch (kind) {
  case kGearKind_Sword:
    link_sword_type = (uint8)clampi(tier, 0, kMaxSwordTier);
    break;
  case kGearKind_Shield:
    link_shield_type = (uint8)clampi(tier, 0, kMaxShieldTier);
    break;
  case kGearKind_Mail:
    link_armor = (uint8)clampi(tier, 0, kMaxMailTier);
    break;
  case kGearKind_Arrows:
    // Nothing held: no write, and no repaint either, because the tail below would cost an NMI update for a
    // frame in which nothing changed.
    if (!SetArrowType(tier))
      return;
    break;
  default:
    return;
  }
  // Reloading the gear palettes with unchanged arguments is what an arrow write wants too: it is a
  // no-op for the colors and keeps one exit path, while the HUD flag below is the half that matters
  // there, because the equipped-item readout draws a different sprite for each half of the pair above.
  LoadGearPalettes(link_sword_type, link_shield_type, link_armor);
  Palette_UpdateGlovesColor();
  flag_update_hud_in_nmi++;
}
