/* @layer core-game-hooks @kind native */
/**
 * Installs a bank room the way the second cartridge's own engine consumes it.
 *
 * The port ships each room pre-expanded: three flat tilemap layers and a collision byte per
 * cell per layer. Its engine draws those directly and never runs a drawing program, so this
 * loader does the same — copy the layers into the engine's map buffers, fold the two upper
 * layers into one with the port's layer-wide priority preserved per tile, install the port's
 * own collision, then register the verified door records through the engine's door path so
 * shutters, exits and teleport travel stay native. The attribute overlay carries the few
 * per-cell translations into this engine's attribute language (exit doorway stripes, and
 * corrections where the collision conversion is still wrong).
 *
 * A bank id with no room installs a sealed void instead, so a stray edge transition parks the
 * player in a dead room rather than reaching the base grid. With the dungeon absent or the
 * setting off, the loader declines and the vanilla path runs untouched.
 */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/dungeon.h"

enum { kCellsPerLayer = 4096, kLayerBytes = 0x2000, kAttrBytes = 0x1000, kLayersPerRoom = 3 };
enum { kAttrSolid = 0x01, kPriority = 0x2000 };
bool GbaAlttp_IsBakedRoomActive(void) {
  return player_is_indoors && GbaAlttp_IsBankRoom(dungeon_room_index);
}

/**
 * Collision comes from the engine's own attribute pass over the installed words — the same
 * derivation every vanilla room gets, and the one the stream era already proved correct for
 * these rooms. The port's converted collision arrays stay in the container as diagnostics
 * only; installing them directly put water on statues and holes in walls (the conversion's
 * tile-id masking bug). Void rooms are the exception: their sealed attributes must survive,
 * so the pass stands down for them.
 */
bool GbaAlttp_SkipAttrLoadForVoidRoom(void) {
  return GbaAlttp_IsBakedRoomActive() && GbaAlttpFindRoom(dungeon_room_index) < 0;
}

static bool TileHasVisiblePixels(uint16 map_word) {
  int tile = map_word & 0x3ff;
  const uint8 *gfx = g_gba_alttp_asset_ptrs[kGbaAssetBgGfxSnes4bpp] + tile * 32;
  for (int i = 0; i < 32; i++) {
    if (gfx[i])
      return true;
  }
  return false;
}

static void InstallVoidRoom(void) {
  memset(dung_bg2, 0, kLayerBytes);
  memset(dung_bg1, 0, kLayerBytes);
  memset(dung_bg2_attr_table, kAttrSolid, kAttrBytes);
  memset(dung_bg1_attr_table, kAttrSolid, kAttrBytes);
  dung_layout_and_starting_quadrant = 0;
}

/** Runs at the tail of the attribute pass, so the corrections land on the derived table. */
void GbaAlttp_ApplyBakedAttrOverlay(void) {
  if (!GbaAlttp_IsBakedRoomActive())
    return;
  int index = GbaAlttpFindRoom(dungeon_room_index);
  if (index < 0)
    return;
  MemBlk overlay = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetAttrOverlays), index);
  for (size_t at = 0; at + 4 <= overlay.size; at += 4) {
    uint16 cell = (uint16)(overlay.ptr[at + 1] | (overlay.ptr[at + 2] << 8));
    if (cell >= kCellsPerLayer)
      continue;
    (overlay.ptr[at] ? dung_bg1_attr_table : dung_bg2_attr_table)[cell] = overlay.ptr[at + 3];
  }
}

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
  kTeleportEnterRight = 2, kTeleportEnterLeft = 3,
  kTeleportWestMouthX = 3 * 8, kTeleportWestStop = 0x14,
  kTeleportEastMouthX = 61 * 8, kTeleportEastStop = 0xdc,
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

/**
 * Whether this room spawns the fixtures whose palettes differ from the base game's.
 *
 * The adjustment belongs only to those rooms: applied everywhere it would recolour other
 * rooms' enemies, which share the same characters.
 */
bool GbaAlttp_RoomHasFixtures(void) {
  static uint16 cached_room = 0xffff;
  static bool cached_result;
  if (!GbaAlttp_IsPalaceActive())
    return false;
  if (dungeon_room_index != cached_room) {
    cached_room = dungeon_room_index;
    cached_result = false;
    const uint8 *src = GbaAlttp_GetRoomSprites(dungeon_room_index);
    if (src) {
      for (src++; *src != 0xff; src += 3) {
        uint8 type = src[2];
        if (type == 0x5d || type == 0x66 || type == 0x67) {
          cached_result = true;
          break;
        }
      }
    }
  }
  return cached_result;
}

/**
 * Palettes for the dungeon's fixtures.
 *
 * Their art is already in the room's own sheets and the engine names the right characters
 * for it; what the cartridge does differently is the palette each one draws with, read from
 * its live object attribute memory in the room itself. The cannons also rise to the top
 * object priority: on the cartridge they draw in front of the covering layer (objects win
 * priority ties there), and this engine's equivalent is the priority level that beats a
 * priority-promoted upper layer.
 */
enum {
  kOamPaletteMask = 0x0e, kOamPaletteShift = 1,
  kOamPriorityMask = 0x30, kOamPriorityShift = 4,
  kPriorityOverCover = 3,  /* for the fixtures mounted on the covering layer */
  kPriorityOverFloor = 2,  /* above the floor and the water, below the covering layer */
  kCannonCharClosed = 0x2e, kCannonCharOpen = 0x0e, kBallChar = 0x24,
  kRollerCharFirst = 0x88, kRollerCharLast = 0x9e,
  kCannonPalette = 6, kBallPalette = 4, kRollerPalette = 6,
  kNoPalette = 0xff,
};

/**
 * Palette and depth for one fixture character.
 *
 * Depth needs translating, not copying: on the cartridge these objects sit in front of every
 * background but the topmost, while the level this engine gives them draws behind even plain
 * floor - which is why a roller could damage the player without ever appearing.
 */
static uint8 FixturePalette(uint8 charnum, uint8 *priority) {
  if (charnum == kCannonCharClosed || charnum == kCannonCharOpen) {
    *priority = kPriorityOverCover;
    return kCannonPalette;
  }
  if (charnum == kBallChar) {
    *priority = kPriorityOverCover;
    return kBallPalette;
  }
  if (charnum >= kRollerCharFirst && charnum <= kRollerCharLast) {
    *priority = kPriorityOverFloor;
    return kRollerPalette;
  }
  return kNoPalette;
}

uint8 GbaAlttp_AdjustSpriteOamFlags(uint8 charnum, uint8 flags) {
  if (!GbaAlttp_RoomHasFixtures())
    return flags;
  uint8 priority = 0;
  uint8 palette = FixturePalette(charnum, &priority);
  if (palette == kNoPalette)
    return flags;
  flags = (uint8)((flags & ~kOamPaletteMask) | (palette << kOamPaletteShift));
  return (uint8)((flags & ~kOamPriorityMask) | (priority << kOamPriorityShift));
}

/**
 * Let this dungeon's room tags run, minus the ones this engine has no handler for.
 *
 * Tags drive a room's behaviour - prize doors, switch-held doors, heart rewards - and the
 * cartridge stores them in the engine's own numbering, so they can be passed straight
 * through. Its own additions sit past the end of the handler table, where the vanilla
 * dispatch would read off the end of the array, so those are dropped instead.
 */
void GbaAlttp_FilterRoomTags(uint8 *first, uint8 *second) {
  enum { kTagHandlerCount = 64 };
  if (!GbaAlttp_IsBankRoom(dungeon_room_index))
    return;
  if (*first >= kTagHandlerCount)
    *first = 0;
  if (*second >= kTagHandlerCount)
    *second = 0;
}

/**
 * The water current, and the torch that stops it.
 *
 * The cartridge marks these rooms with a layer effect of its own, which the extraction maps
 * onto this engine's flowing-water effect. Two differences: the channel runs top to bottom
 * rather than sideways, and lighting the room's torch stills the water. Returning true means
 * the vanilla sideways rapids must not also run.
 */
static uint16 g_water_current_step;

bool GbaAlttp_ApplyWaterCurrent(void) {
  enum { kCurrentStep = 0x100 };
  if (!GbaAlttp_IsBakedRoomActive())
    return false;
  dung_floor_x_vel = 0;
  if (dung_num_lit_torches != 0) {
    dung_floor_y_vel = 0;
    return true;
  }
  int subpixel = dung_some_subpixel[1] + kCurrentStep;
  dung_some_subpixel[1] = (uint8)subpixel;
  /* Carries anything walking the flowing floor, the way the vanilla effect does. */
  g_water_current_step = (uint16)(subpixel >> 8);
  dung_floor_y_vel = g_water_current_step;
  return true;
}

/**
 * Carry a swimmer downstream, once the frame's own movement has resolved.
 *
 * Swimming owns its movement completely: it clears the velocity whenever the stick is idle
 * and settles the position through its own collision, so a current added anywhere inside
 * that path is overwritten before it reaches the screen. Applied at the end of the frame it
 * survives, and the step only lands on a cell that is still water, so the current can never
 * push the player through a wall or up onto the bank.
 */
void GbaAlttp_CarrySwimmer(void) {
  enum { kPlayerSwimming = 4, kDeepWater = 0x08, kFeetOffset = 8 };
  if (g_water_current_step == 0 || link_player_handler_state != kPlayerSwimming)
    return;
  if (!GbaAlttp_IsBakedRoomActive() || dung_num_lit_torches != 0)
    return;
  uint16 next = link_y_coord + g_water_current_step;
  int cell = (((next + kFeetOffset) & 0x1f8) << 3) | (((link_x_coord + kFeetOffset) & 0x1f8) >> 3);
  if (dung_bg2_attr_table[cell] == kDeepWater)
    link_y_coord = next;
}

static void RegisterDoors(uint16 room) {
  const uint16 *doors = GbaAlttp_GetRoomDoors(room);
  if (!doors)
    return;
  Dungeon_PrepDoorDrawLayer();
  for (int i = 0; doors[i] != 0xffff; i++)
    RoomData_DrawObject_Door(doors[i]);
  Dungeon_LoadDoorAttribute();
}

bool GbaAlttp_LoadBakedRoom(void) {
  if (!GbaAlttp_IsBakedRoomActive())
    return false;
  int index = GbaAlttpFindRoom(dungeon_room_index);
  if (index < 0) {
    InstallVoidRoom();
    return true;
  }

  MemBlk bottom = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayersSnes), index * kLayersPerRoom + 0);
  MemBlk middle = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayersSnes), index * kLayersPerRoom + 1);
  MemBlk top = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayersSnes), index * kLayersPerRoom + 2);
  if (bottom.size != kLayerBytes || middle.size != kLayerBytes || top.size != kLayerBytes) {
    InstallVoidRoom();
    return true;
  }

  memcpy(dung_bg2, bottom.ptr, kLayerBytes);
  const uint16 *bottom_words = (const uint16 *)bottom.ptr;
  const uint16 *middle_words = (const uint16 *)middle.ptr;
  const uint16 *top_words = (const uint16 *)top.ptr;
  const uint8 *header = GbaAlttp_GetRoomHeader(dungeon_room_index);
  if (header && (header[0] >> 5) == 4) {
    /* Water mode, matching the cartridge's own blend registers: the middle layer is the
       half-transparent water surface, which the engine's translucent screen mode renders
       from the upper layer, and the covering pieces of the top layer fold into the lower
       one - they are opaque, so nothing behind them ever shows anyway. */
    for (int i = 0; i < kCellsPerLayer; i++) {
      dung_bg2[i] = TileHasVisiblePixels(top_words[i]) ? top_words[i] : bottom_words[i];
      dung_bg1[i] = middle_words[i];
    }
  } else {
    for (int i = 0; i < kCellsPerLayer; i++) {
      /* The port's top layer draws in front of the player wholesale; this engine carries
         that per tile, so a visible top tile arrives with its priority bit set. */
      bool top_visible = TileHasVisiblePixels(top_words[i]);
      dung_bg1[i] = top_visible ? (uint16)(top_words[i] | kPriority) : middle_words[i];
    }
  }

  /* The engine only refreshes the animated tile frames on a full dungeon load, while a room
     transition leaves the base game's frames sitting in the window this dungeon draws from. */
  GbaAlttp_ApplyAnimatedTiles();

  /* Layout 7 is a full-size 512x512 room to the quadrant camera (kLayoutQuadrantFlags);
     anything narrower makes the camera treat the room as 256px pages and refuse to pan. */
  dung_layout_and_starting_quadrant = 7 << 2;
  RegisterDoors(dungeon_room_index);
  return true;
}
