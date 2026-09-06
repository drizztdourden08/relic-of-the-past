/* @layer core-game-hooks @kind native */
// What stands in for a blade when a seed can never hand one over.
//
// Three interactions on the critical path are written as "a blade does this and nothing else
// does": a hanging cloth door only parts for a swing, the last fight refuses a hammer outright,
// and the tower's seal throws a blow back at anyone holding less than a beam blade. A file that
// can never hold a blade is stopped at all three, so each one gets an alternative here.
//
// Like the item-power switches beside them, every bit lives in the WRAM gate word kRam_Features4
// rather than in a host gate, because the GAME branches on all of them: a host gate would be
// invisible to a save state and would desynchronise a replay (host_gates.h states that rule).
//
// Each function below is phrased as a DIVERGENCE, so with features4 clear each one returns
// exactly the expression the vendored call site used to compute inline. That is the invariant
// to check when reading this file: nothing here writes anything, and with the word clear every
// answer is the one the vendored code already had.
#include "game_hooks_internal.h"

static bool SwordlessBit(uint32 bit) {
  return (enhanced_features4 & bit) != 0;
}

// ─── A cloth door taken down by pulling it ───────────────────────────────────────────────────
//
// dungeon.c Dungeon_ProcessTorchesAndDoors owns the whole sequence that takes one down: it
// samples an anchor tile, walks the 2x2 block at it for a door attribute, and — when the door
// there is the cut-open kind — plays the sound, redraws the frame and reloads the attributes.
// Nothing of that is duplicated here. Only the two things the vendored code asks for are
// answered differently: WHEN it runs, and WHICH tile it samples.
//
// The alternative is the grab the game already has. Facing the door with A held, pulling away
// from it (kGrabWallDirs, player.c) takes it down. Arming is deliberately strict — the pull
// must already be under way, the tile faced must carry a door attribute, that door must face
// the player and must be the cut-open kind — so an armed frame is one the vendored code was
// always going to act on. Once it acts, the doorway's attributes are rewritten to the open
// door's and the check below stops matching, which is what makes the pull a single event
// rather than something that repeats while the button is held.

// The anchor an armed pull points the vendored sampler at, or -1 when nothing is armed.
static int g_pull_anchor = -1;

// player.c kGrabWallDirs: the direction that pulls AWAY from the wall being faced.
static const uint8 kPullAwayDirs[4] = { 4, 8, 1, 2 };

// dungeon.c Dungeon_ProcessTorchesAndDoors: the tile the player is pressed against, and the
// second half of the same doorway. The key-door probe at the top of that function reads exactly
// these two, so a door it would find is a door this finds.
static const int16 kFacedTileX[4] = { 0, 0, -1, 17 };
static const int16 kFacedTileY[4] = { 7, 24, 8, 8 };
static const uint16 kFacedTileStep[4] = { 0x2, 0x2, 0x80, 0x80 };

/** True when |pos| carries the attribute of a cut-open door that faces |dir|. */
static bool CurtainDoorAt(int pos, int dir) {
  uint8 attr = (uint8)(dung_bg2_attr_table[pos] & 0xfc);
  if ((attr & 0xf0) != 0xf0)
    return false;
  // The vendored sampler masks the attribute before taking the door index out of it, so the
  // index read here has to be masked the same way or the two would disagree about which door
  // is about to open.
  int k = attr & 0xf;
  if ((dung_door_direction[k] & 3) != dir)
    return false;
  return (uint8)door_type_and_slot[k] == kDoorType_Slashable;
}

/** The anchor a pull would hand over, or -1 when the player is not facing one. */
static int FacedCurtainAnchor(void) {
  int dir = link_direction_facing >> 1;
  int base = ((link_y_coord + kFacedTileY[dir]) & 0x1f8) << 3;
  base |= ((link_x_coord + kFacedTileX[dir]) & 0x1f8) >> 3;
  base |= (link_is_on_lower_level ? 0x1000 : 0);
  if (CurtainDoorAt(base, dir))
    return base;
  int step = base + kFacedTileStep[dir];
  return CurtainDoorAt(step, dir) ? step : -1;
}

/** True when this frame is a pull the door should answer, and remembers the tile it points at. */
static bool CurtainPullArmed(void) {
  g_pull_anchor = -1;
  if (!SwordlessBit(kFeatures4_PullableCurtains) || !player_is_indoors)
    return false;
  // link_grabbing_wall is 1 for the wall grab and 2 for the statue drag; only the first is a pull
  // against a doorway. link_var30d counts the pull animation, so a nonzero one means the player
  // is really hauling rather than merely holding on.
  if (link_grabbing_wall != 1 || link_var30d == 0)
    return false;
  if (!(kPullAwayDirs[link_direction_facing >> 1] & joypad1H_last))
    return false;
  g_pull_anchor = FacedCurtainAnchor();
  return g_pull_anchor >= 0;
}

// dungeon.c Dungeon_ProcessTorchesAndDoors: whether the cut-open door sequence runs this frame.
// The vendored expression is the fourth frame of a swing, returned untouched; the bit adds a
// pull beside it.
bool GameHook_CurtainSequenceRuns(void) {
  if ((button_mask_b_y & 0x80) && button_b_frames == 4) {
    g_pull_anchor = -1;
    return true;
  }
  return CurtainPullArmed();
}

// The same function's anchor tile. The vendored expression is the swing's own reach, built from
// the player's OAM offset; an armed pull substitutes the tile it was armed on.
int GameHook_CurtainSequenceAnchor(void) {
  if (g_pull_anchor >= 0)
    return g_pull_anchor;
  int pos = ((link_y_coord + (int8)player_oam_y_offset) & 0x1f8) << 3;
  pos |= ((link_x_coord + (int8)player_oam_x_offset) & 0x1f8) >> 3;
  return pos;
}

// ─── The hammer as a weapon where only a blade counted ───────────────────────────────────────
//
// Neither of the two below needs the damage subclass table touched. The blob already scores a
// hammer blow against both sprites — the last fight's standing form takes four units from the
// hammer column, the tower's seal takes eight — so all that ever stopped a hammer was the test
// in front of the damage, and that is the only thing either bit moves. The fight's second sprite
// type, the one it wears while it cannot be hurt, has a zero in every column but the silver
// arrow's, which is why letting a blow reach it changes nothing there.

// sprite.c Sprite_CheckDamageFromLink: whether a hammer blow is refused outright for the last
// fight's two sprite types before any damage is computed. Off, the refusal is the vendored one.
bool GameHook_HammerReachesLastFight(void) {
  return SwordlessBit(kFeatures4_HammerHurtsLastFight);
}

// ─── The tower's seal ────────────────────────────────────────────────────────────────────────

// sprite_main.c Sprite_EvilBarrier: whether the seal throws the blow back at the player instead
// of taking it. The vendored expression is the beam-blade test, returned untouched; the bit lets
// a hammer swung by someone who can hold no blade through it.
bool GameHook_TowerSealRepels(void) {
  // link_item_in_hand carries the hammer as bit 1; the mask is the one the melee damage class
  // uses for the same question (sprite.c Sprite_CalculateSwordDamage).
  if (SwordlessBit(kFeatures4_HammerBreaksSeal) && (link_item_in_hand & 10))
    return false;
  return link_sword_type < 2;
}
