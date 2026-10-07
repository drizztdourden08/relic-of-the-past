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
  // Screens 0x0A and 0x4A carry no entry. The place each one names is a pocket behind a rock on a
  // screen anyone can walk onto, so the tracker reads the cave behind the rock instead (world.ts).
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
  { 0x43, kEvent_Area_DarkDeathMountainWest },
  { 0x45, kEvent_Area_DarkDeathMountainEast },
  { 0x47, kEvent_Area_TurtleRockTop },
  // Named places. A Dark World one shares its head with the region row above it, so a head
  // can record more than one event.
  { 0x00, kEvent_Area_LostWoods },
  { 0x02, kEvent_Area_Lumberjacks },
  { 0x18, kEvent_Area_Kakariko },
  { 0x13, kEvent_Area_SanctuaryGrounds },
  { 0x14, kEvent_Area_Graveyard },
  { 0x16, kEvent_Area_WitchsHut },
  { 0x0F, kEvent_Area_ZorasRiver },
  { 0x1E, kEvent_Area_EasternPalaceGrounds },
  { 0x2C, kEvent_Area_UnclesEstate },
  { 0x2A, kEvent_Area_HauntedGrove },
  { 0x3B, kEvent_Area_GreatSwamp },
  { 0x58, kEvent_Area_VillageOfOutcasts },
  { 0x5E, kEvent_Area_PalaceOfDarknessGrounds },
  { 0x7B, kEvent_Area_SwampPalaceGrounds },
  { 0x53, kEvent_Area_DarkSanctuaryGrounds },
  { 0x6C, kEvent_Area_BombShopGrounds },
};

// Areas reached, pass 2: parts of a head, each a box in the overworld's pixel frame (link_x_coord,
// link_y_coord, both ends inclusive), the walkable level around a seed with every ledge, cliff and
// water edge as its bound (the story-events thread's area-boxes.md holds the floods). Dark world
// heads carry the 0x40 bit like the head table above.
typedef struct { uint8 head; uint16 x0, x1, y0, y1; EventId event; } AreaBoxEvent;

static const AreaBoxEvent kAreaBoxEvents[] = {
  { 0x03, 1600, 2559,   32,  343, kEvent_Area_DeathMountainTop },       // the level the tower door opens on
  { 0x05, 2992, 3583,   48,  319, kEvent_Area_EastDeathMountainTop },   // the level above the spiral cave's drop ledge
  { 0x05, 3424, 3487,  360,  399, kEvent_Area_MimicLedge },             // the closed ledge the Mimic Cave's door opens on; screen 0x07 above it is the open summit
  { 0x35, 3144, 3367, 3480, 3639, kEvent_Area_LakeHyliaIsland },        // the island the Hylia Fairy's cave opens on, water on every side
  { 0x35, 2904, 3015, 3368, 3447, kEvent_Area_LakeHyliaLedgeIsland },   // the ledge-rimmed island with the heart piece
  { 0x1B, 1744, 2351, 1600, 2199, kEvent_Area_CastleTerrace },          // the level the tower door opens on, ramparts included
  { 0x30,  296,  311, 3256, 3391, kEvent_Area_DesertPalaceStairs },     // landing, staircase and walled approach
  { 0x43, 1600, 2559,   32,  327, kEvent_Area_DarkDeathMountainTop },   // the level the last tower's door opens on
  { 0x4A, 1360, 1503,  576,  671, kEvent_Area_BumperCaveLedge },        // the ledge below the cave's upper mouth, rimmed by drops
  { 0x5B, 2000, 2079, 1632, 1711, kEvent_Area_PyramidLedge },           // the walled top platform around the hole
  { 0x75, 3168, 3359, 3528, 3599, kEvent_Area_DarkLakeHyliaIsland },    // the walled forecourt of the Ice Palace, where the light world warp lands
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
