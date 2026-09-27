/* @layer core-game-hooks @kind native */
// The frame-end watcher: records events by watching the game's own bytes for edges, from the
// once-per-frame hook the game already has (misc.c Module_MainRouting -> GameHook_ModuleFrameEnd).
// No vendored code changes for any event here.
//
// Frame end is the right moment on purpose. Several prep routines set the follower byte to load a
// sprite's graphics and put it back inside the same call; a poll at frame end never sees those.
//
// The "previous" values here are plain statics and are NOT rewound by a save-state load. That is
// fine: an edge seen twice records nothing twice, because every write is a test-and-set, and an
// edge seen once too many (a state loaded straight into a room) records a place the player was in.
#include "../game_hooks_internal.h"
#include "event_areas.h"

#define AGAHNIM_ALTAR_ROOM 0x30
#define ALTAR_SCENE_DONE_BIT 0x4000
#define AGINAH_ROOM 0x10A
#define AGINAH_FIRST_LINE 0x125
#define AGINAH_LAST_LINE 0x129
#define MODULE_MESSAGING 14
#define SUBMODULE_DIALOGUE 2
#define DESERT_PRAYER_SCREEN 0x30
#define DAM_ROOM 0x10B
#define DAM_LEVER_PULLED_BIT 0x800
// The Hookshot Fairy's cave is the east column of room 0x10C (the Mimic Cave is the west one). The
// door opens at the bottom and a pool lies across the way, its water running up to a wall at room
// y 272. Behind that wall is the ledge with the pot, floor from y 208 to 255, reached only by a
// Hookshot shot. The player's y is the top of a sprite 24 tall: on the ledge it reads 236 at most,
// wading against the pool's wall 257 at least, so the line sits between the two.
#define HOOKSHOT_FAIRY_ROOM 0x10C
#define ROOM_EAST_COLUMN_X 256
#define HOOKSHOT_FAIRY_FAR_SIDE_Y 244
#define TEMPERING_IN_PROGRESS 0x80
#define SHELF_PUSHED_START 4
#define MAP_ICONS_SAHASRAHLA 3

static uint16 s_prev_area = 0xFFFF;
static uint8 s_prev_indoors = 0xFF;

static bool LedgerOn(void) {
  return (enhanced_features5 & kFeatures5_EventLedger) != 0;
}

static void RecordArea(void) {
  uint16 head = overworld_area_index;
  // The two special places report through the screen index, above the head range.
  uint16 special = overworld_screen_index;
  uint8 key = (special == 0x80 || special == 0x81) ? (uint8)special : (uint8)head;
  for (size_t i = 0; i < sizeof(kAreaHeadEvents) / sizeof(kAreaHeadEvents[0]); i++) {
    if (kAreaHeadEvents[i].head == key) GameHook_RecordEvent(kAreaHeadEvents[i].event);
  }
}

// Pass 2: a level read, idempotent on the ledger, so the player standing anywhere in a box counts.
static void RecordAreaBoxes(void) {
  const uint8 head = (uint8)overworld_area_index;
  const uint16 x = link_x_coord, y = link_y_coord;
  for (size_t i = 0; i < sizeof(kAreaBoxEvents) / sizeof(kAreaBoxEvents[0]); i++) {
    const AreaBoxEvent *b = &kAreaBoxEvents[i];
    if (b->head == head && x >= b->x0 && x <= b->x1 && y >= b->y0 && y <= b->y1) GameHook_RecordEvent(b->event);
  }
}

static void RecordEntrance(void) {
  uint8 entrance = which_entrance;
  uint8 from = (uint8)overworld_screen_index_exit;
  for (size_t i = 0; i < sizeof(kEntranceEvents) / sizeof(kEntranceEvents[0]); i++) {
    const EntranceEvent *e = &kEntranceEvents[i];
    if (e->entrance != entrance) continue;
    if (e->exit_screen != ANY_EXIT_SCREEN && e->exit_screen != from) continue;
    GameHook_RecordEvent(e->event);
    return;
  }
}

static void RecordFollower(uint8 follower) {
  switch (follower) {
    case 1: GameHook_RecordEvent(kEvent_ZeldaFreed); break;
    case 4: GameHook_RecordEvent(kEvent_Follower_OldMan); break;
    case 6: GameHook_RecordEvent(kEvent_Follower_Maiden); break;
    case 7: GameHook_RecordEvent(kEvent_Follower_Frog); break;
    case 10: GameHook_RecordEvent(kEvent_Follower_Kiki); break;
    case 12: GameHook_RecordEvent(kEvent_Follower_PurpleChest); break;
    case 13: GameHook_RecordEvent(kEvent_Follower_BigBomb); break;
    default: break;
  }
}

// Facts the game writes and later erases, or keeps only in volatile bytes. Level reads, not edges:
// each is idempotent on the ledger, so seeing it every frame costs nothing.
static void RecordLevels(void) {
  if (savegame_is_darkworld & 0x40) GameHook_RecordEvent(kEvent_FirstDarkWorld);
  if (sram_progress_indicator_3 & TEMPERING_IN_PROGRESS) GameHook_RecordEvent(kEvent_TemperingPaid);
  if (which_starting_point == SHELF_PUSHED_START) GameHook_RecordEvent(kEvent_ShelfPushed);
  if (link_item_bombs != 0) GameHook_RecordEvent(kEvent_BombsFirstHeld);
  // One of Aginah's five lines is on screen, in his cave: he was spoken to.
  if (player_is_indoors && dungeon_room_index == AGINAH_ROOM && main_module_index == MODULE_MESSAGING
      && submodule_index == SUBMODULE_DIALOGUE && dialogue_message_index >= AGINAH_FIRST_LINE
      && dialogue_message_index <= AGINAH_LAST_LINE)
    GameHook_RecordEvent(kEvent_AginahTalked);
  if (player_is_indoors && dungeon_room_index == AGAHNIM_ALTAR_ROOM && (dung_savegame_state_bits & ALTAR_SCENE_DONE_BIT))
    GameHook_RecordEvent(kEvent_AgahnimAltar);
  // The dam's own bit is erased by the next overworld load, so the pull is kept here.
  if (player_is_indoors && dungeon_room_index == DAM_ROOM && (dung_savegame_state_bits & DAM_LEVER_PULLED_BIT))
    GameHook_RecordEvent(kEvent_FloodgatePulled);
  // Past the water in the Hookshot Fairy's cave: read from where the player stands inside the room.
  if (player_is_indoors && dungeon_room_index == HOOKSHOT_FAIRY_ROOM && (link_x_coord & 0x1ff) >= ROOM_EAST_COLUMN_X
      && (link_y_coord & 0x1ff) < HOOKSHOT_FAIRY_FAR_SIDE_Y)
    GameHook_RecordEvent(kEvent_HookshotFairyFarSide);
  // The prayer is said outdoors, in front of the statues on the desert screen.
  if (!player_is_indoors && BYTE(overworld_screen_index) == DESERT_PRAYER_SCREEN && byte_7E02F0)
    GameHook_RecordEvent(kEvent_DesertPrayer);
  // The map hint and the gift make the identical write; the gift is recorded by its receipt
  // during the frame, so at frame end "3 and no gift yet" can only be the hint.
  if (savegame_map_icons_indicator == MAP_ICONS_SAHASRAHLA && !GameHook_HasEvent(kEvent_SahasrahlaGift)
      && !GameHook_HasEvent(kEvent_SahasrahlaMapHint))
    GameHook_RecordEvent(kEvent_SahasrahlaMapHint);
}

void GameHook_EventWatchFrameEnd(void) {
  if (!LedgerOn()) {
    s_prev_area = 0xFFFF;
    s_prev_indoors = 0xFF;
    return;
  }
  const uint8 indoors = player_is_indoors;
  const uint16 area = overworld_area_index;
  const uint8 follower = follower_indicator;

  if (!indoors && (area != s_prev_area || indoors != s_prev_indoors)) RecordArea();
  if (!indoors) RecordAreaBoxes();
  if (indoors && !s_prev_indoors && s_prev_indoors != 0xFF) RecordEntrance();
  // A level read, like the rest: a state loaded with someone already following, or a ledger
  // armed after they joined, still records them. Frame end never sees the graphics-load
  // flickers of the byte, and the record is a test-and-set.
  if (follower != 0) RecordFollower(follower);
  RecordLevels();

  s_prev_area = area;
  s_prev_indoors = indoors;
}
