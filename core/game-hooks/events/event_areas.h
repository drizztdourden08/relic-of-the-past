/* @layer core-game-hooks @kind native */
// Areas reached, pass 1: which overworld area head means which event. The game keeps the current
// head in overworld_area_index (a 2x2 area reports one value for its four screens, the dark world
// adds 0x40), and the two special places (the pedestal meadow, the waterfall domain) are their own
// values in overworld_screen_index, 0x80 and 0x81. Pass 2 (parts of a head) is a box each in the
// overworld's own pixel frame, measured by flooding the map's collision from a seed on that level.
#ifndef GAME_HOOKS_EVENT_AREAS_H
#define GAME_HOOKS_EVENT_AREAS_H

#include "event_ids.h"

typedef struct { uint8 head; EventId event; } AreaHeadEvent;

// Light world heads, then dark world heads (already carrying the 0x40 world bit).
static const AreaHeadEvent kAreaHeadEvents[] = {
  { 0x03, kEvent_Area_DeathMountain },
  { 0x05, kEvent_Area_EastDeathMountain },
  { 0x07, kEvent_Area_MimicLedge },
  { 0x0A, kEvent_Area_DeathMountainEntrance },
  { 0x1B, kEvent_Area_CastleGrounds },
  { 0x30, kEvent_Area_Desert },
  { 0x35, kEvent_Area_LakeHylia },
  { 0x80, kEvent_Area_PedestalMeadow },
  { 0x81, kEvent_Area_ZorasDomain },
  { 0x5B, kEvent_Area_EastDarkWorld }, { 0x5D, kEvent_Area_EastDarkWorld }, { 0x5E, kEvent_Area_EastDarkWorld },
  { 0x65, kEvent_Area_EastDarkWorld }, { 0x6D, kEvent_Area_EastDarkWorld }, { 0x6E, kEvent_Area_EastDarkWorld },
  { 0x6F, kEvent_Area_EastDarkWorld },
  { 0x55, kEvent_Area_NorthEastDarkWorld }, { 0x56, kEvent_Area_NorthEastDarkWorld }, { 0x57, kEvent_Area_NorthEastDarkWorld },
  { 0x4F, kEvent_Area_Catfish },
  { 0x50, kEvent_Area_WestDarkWorld }, { 0x51, kEvent_Area_WestDarkWorld }, { 0x52, kEvent_Area_WestDarkWorld },
  { 0x58, kEvent_Area_WestDarkWorld }, { 0x5A, kEvent_Area_WestDarkWorld }, { 0x62, kEvent_Area_WestDarkWorld },
  { 0x68, kEvent_Area_SouthDarkWorld }, { 0x69, kEvent_Area_SouthDarkWorld }, { 0x6A, kEvent_Area_SouthDarkWorld },
  { 0x6B, kEvent_Area_SouthDarkWorld }, { 0x6C, kEvent_Area_SouthDarkWorld }, { 0x72, kEvent_Area_SouthDarkWorld },
  { 0x73, kEvent_Area_SouthDarkWorld }, { 0x74, kEvent_Area_SouthDarkWorld }, { 0x7B, kEvent_Area_SouthDarkWorld },
  { 0x75, kEvent_Area_DarkLakeHylia },
  { 0x70, kEvent_Area_DarkDesert }, { 0x7A, kEvent_Area_DarkDesert },
  { 0x40, kEvent_Area_SkullWoods },
  { 0x4A, kEvent_Area_BumperCave },
  { 0x43, kEvent_Area_DarkDeathMountainWest },
  { 0x45, kEvent_Area_DarkDeathMountainEast },
  { 0x47, kEvent_Area_TurtleRockTop },
};

// Areas reached, pass 2: parts of a head, each a box in the overworld's pixel frame (link_x_coord,
// link_y_coord, both ends inclusive), the walkable level around a seed with every ledge, cliff and
// water edge as its bound (the story-events thread's area-boxes.md holds the floods). Dark world
// heads carry the 0x40 bit like the head table above.
typedef struct { uint8 head; uint16 x0, x1, y0, y1; EventId event; } AreaBoxEvent;

static const AreaBoxEvent kAreaBoxEvents[] = {
  { 0x03, 1600, 2559,   32,  343, kEvent_Area_DeathMountainTop },       // the level the tower door opens on
  { 0x05, 2992, 3583,   48,  319, kEvent_Area_EastDeathMountainTop },   // the level above the spiral cave's drop ledge
  { 0x35, 2904, 3015, 3368, 3447, kEvent_Area_LakeHyliaIsland },        // the ledge-rimmed island with the heart piece
  { 0x1B, 1744, 2351, 1600, 2199, kEvent_Area_CastleTerrace },          // the level the tower door opens on, ramparts included
  { 0x30,  296,  311, 3256, 3391, kEvent_Area_DesertPalaceStairs },     // landing, staircase and walled approach
  { 0x43, 1600, 2559,   32,  327, kEvent_Area_DarkDeathMountainTop },   // the level the last tower's door opens on
  { 0x5B, 2000, 2079, 1632, 1711, kEvent_Area_PyramidLedge },           // the walled top platform around the hole
  { 0x75, 2888, 3031, 3368, 3479, kEvent_Area_DarkLakeHyliaIsland },    // enclosed by water on every side
};

// Entrances the visited-room bits cannot tell apart, keyed by the entrance id and, where several
// entrances share an id, by the overworld screen the player came from (overworld_screen_index_exit).
// The seven small fountains share entrance 0x5E and one room; the two bonk fountains share 0x71.
typedef struct { uint8 entrance; uint8 exit_screen; EventId event; } EntranceEvent;
#define ANY_EXIT_SCREEN 0xFF

static const EntranceEvent kEntranceEvents[] = {
  { 0x5E, 0x2E, kEvent_Fairy_LakeHylia },
  { 0x5E, 0x34, kEvent_Fairy_Swamp },
  { 0x5E, 0x3A, kEvent_Fairy_Desert },
  { 0x5E, 0x6E, kEvent_Fairy_DarkLakeHylia },
  { 0x5E, 0x77, kEvent_Fairy_DarkLakeHyliaLedge },
  { 0x5E, 0x70, kEvent_Fairy_DarkDesert },
  { 0x5E, 0x43, kEvent_Fairy_DarkDeathMountain },
  { 0x71, 0x2B, kEvent_Fairy_BonkLight },
  { 0x71, 0x6B, kEvent_Fairy_BonkDark },
  // Skull Woods front: two holes and three doors that meet inside.
  { 0x28, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_0 }, { 0x79, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_0 },
  { 0x29, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_1 },
  { 0x2A, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_2 }, { 0x76, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_2 },
  { 0x77, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_3 },
  { 0x78, ANY_EXIT_SCREEN, kEvent_SkullWoodsEntrance_4 },
  // Turtle Rock's two side doors, reachable from inside too.
  { 0x15, ANY_EXIT_SCREEN, kEvent_TurtleRockLedge_BigChest }, { 0x19, ANY_EXIT_SCREEN, kEvent_TurtleRockLedge_BigChest },
  { 0x18, ANY_EXIT_SCREEN, kEvent_TurtleRockLedge_LaserBridge },
};

#endif  // GAME_HOOKS_EVENT_AREAS_H
