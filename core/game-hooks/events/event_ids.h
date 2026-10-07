/* @layer core-game-hooks @kind native */
// THE list of events the game never records for itself, one ledger bit each.
//
// The order is FROZEN. A value here is a bit index into SRM_EVENT_LEDGER (save_bytes.h), and a
// save file written yesterday must read the same tomorrow, so an event is only ever appended,
// never inserted, renumbered or removed. A retired event keeps its slot.
//
// What is NOT here: any event the game already keeps in the battery block (a boss room's heart
// bit, an overworld event bit, a progress flag). Those are read where they are. The ledger holds
// what the game forgets: the moment a boss dies (it only keeps the heart), a fairy entered, an
// area reached, a follower gained, and the handful of facts the game writes and then erases.
#ifndef GAME_HOOKS_EVENT_IDS_H
#define GAME_HOOKS_EVENT_IDS_H

typedef enum {
  // Boss killed, one per palace in palace order (cur_palace_index_x2 >> 1). Set when the heart
  // container spawns, so a player who leaves without the heart still has the kill.
  kEvent_BossKilled_Sewers = 0,       // unused slot: the sewers have no boss
  kEvent_BossKilled_HyruleCastle,     // unused slot
  kEvent_BossKilled_EasternPalace,
  kEvent_BossKilled_DesertPalace,
  kEvent_BossKilled_AgahnimTower,     // the first tower fight, from its room's beaten bit (event_watch.c)
  kEvent_BossKilled_SwampPalace,
  kEvent_BossKilled_PalaceOfDarkness,
  kEvent_BossKilled_MiseryMire,
  kEvent_BossKilled_SkullWoods,
  kEvent_BossKilled_IcePalace,
  kEvent_BossKilled_TowerOfHera,
  kEvent_BossKilled_ThievesTown,
  kEvent_BossKilled_TurtleRock,
  kEvent_BossKilled_GanonsTower,      // the second tower fight, from its room's beaten bit
  // The three rematches inside the last tower, by room.
  kEvent_RematchKilled_Armos,
  kEvent_RematchKilled_Lanmolas,
  kEvent_RematchKilled_Moldorm,
  kEvent_GanonBeaten,
  kEvent_GameCompleted,
  // The falling reward after a boss was picked up, one per palace in palace order. Whatever it
  // held: in a seed the reward spot can hold anything.
  kEvent_PrizeTaken_Sewers,           // unused slot
  kEvent_PrizeTaken_HyruleCastle,     // unused slot
  kEvent_PrizeTaken_EasternPalace,
  kEvent_PrizeTaken_DesertPalace,
  kEvent_PrizeTaken_AgahnimTower,     // unused slot
  kEvent_PrizeTaken_SwampPalace,
  kEvent_PrizeTaken_PalaceOfDarkness,
  kEvent_PrizeTaken_MiseryMire,
  kEvent_PrizeTaken_SkullWoods,
  kEvent_PrizeTaken_IcePalace,
  kEvent_PrizeTaken_TowerOfHera,
  kEvent_PrizeTaken_ThievesTown,
  kEvent_PrizeTaken_TurtleRock,
  kEvent_PrizeTaken_GanonsTower,      // unused slot
  // Story moments the game writes and then erases, or never writes.
  kEvent_OldManRescued,               // brought home; the mountain respawn follows this
  kEvent_MagicBatSummoned,
  kEvent_PowderBagTaken,
  kEvent_ShovelFromStump,
  kEvent_SahasrahlaGift,              // his item handed over (his map hint makes the same write)
  kEvent_SahasrahlaMapHint,
  kEvent_TemperingPaid,
  kEvent_TemperedSwordCollected,
  kEvent_ZeldaFreed,                  // she follows out of her cell
  kEvent_ShelfPushed,
  kEvent_AgahnimAltar,
  kEvent_FirstDarkWorld,
  kEvent_DesertPrayer,                // the book's prayer moved the statues
  // Followers gained, each once.
  kEvent_Follower_Kiki,
  kEvent_Follower_BigBomb,
  kEvent_Follower_Frog,
  kEvent_Follower_OldMan,
  kEvent_Follower_Maiden,
  kEvent_Follower_PurpleChest,
  // The nine small fountains that share one room, told apart by the entrance's screen.
  kEvent_Fairy_LakeHylia,
  kEvent_Fairy_Swamp,
  kEvent_Fairy_Desert,
  kEvent_Fairy_BonkLight,
  kEvent_Fairy_BonkDark,
  kEvent_Fairy_DarkLakeHylia,
  kEvent_Fairy_DarkLakeHyliaLedge,
  kEvent_Fairy_DarkDesert,
  kEvent_Fairy_DarkDeathMountain,
  // Areas reached, pass 1: whole area heads. Light World first.
  kEvent_Area_DeathMountain,
  kEvent_Area_EastDeathMountain,
  kEvent_Area_MimicLedge,
  kEvent_Area_DeathMountainEntrance,
  kEvent_Area_CastleGrounds,
  kEvent_Area_Desert,
  kEvent_Area_LakeHylia,
  kEvent_Area_PedestalMeadow,
  kEvent_Area_ZorasDomain,
  kEvent_Area_EastDarkWorld,
  kEvent_Area_NorthEastDarkWorld,
  kEvent_Area_Catfish,
  kEvent_Area_WestDarkWorld,
  kEvent_Area_SouthDarkWorld,
  kEvent_Area_DarkLakeHylia,
  kEvent_Area_DarkDesert,
  kEvent_Area_SkullWoods,
  kEvent_Area_BumperCave,
  kEvent_Area_DarkDeathMountainWest,
  kEvent_Area_DarkDeathMountainEast,
  kEvent_Area_TurtleRockTop,
  // Areas reached, pass 2: parts of a head, each one measured box.
  kEvent_Area_DeathMountainTop,
  kEvent_Area_EastDeathMountainTop,
  kEvent_Area_LakeHyliaIsland,
  kEvent_Area_CastleTerrace,
  kEvent_Area_DesertPalaceStairs,
  kEvent_Area_DarkDeathMountainTop,
  kEvent_Area_PyramidLedge,
  kEvent_Area_DarkLakeHyliaIsland,
  // Entrances the visited-room bits cannot tell apart.
  kEvent_SkullWoodsEntrance_0,
  kEvent_SkullWoodsEntrance_1,
  kEvent_SkullWoodsEntrance_2,
  kEvent_SkullWoodsEntrance_3,
  kEvent_SkullWoodsEntrance_4,
  kEvent_TurtleRockLedge_BigChest,
  kEvent_TurtleRockLedge_LaserBridge,
  // The dam's lever was pulled at least once; the game clears its own bits on the next screen.
  kEvent_FloodgatePulled,
  // Named places inside the open regions: towns, grounds and fields, one head each.
  kEvent_Area_LostWoods,
  kEvent_Area_Lumberjacks,
  kEvent_Area_Kakariko,
  kEvent_Area_SanctuaryGrounds,
  kEvent_Area_Graveyard,
  kEvent_Area_WitchsHut,
  kEvent_Area_ZorasRiver,
  kEvent_Area_EasternPalaceGrounds,
  kEvent_Area_UnclesEstate,
  kEvent_Area_HauntedGrove,
  kEvent_Area_GreatSwamp,
  kEvent_Area_VillageOfOutcasts,
  kEvent_Area_PalaceOfDarknessGrounds,
  kEvent_Area_SwampPalaceGrounds,
  kEvent_Area_DarkSanctuaryGrounds,
  kEvent_Area_BombShopGrounds,
  // The first bomb ever held. The game keeps only the count, which reads zero both before
  // the first bomb and after the last one.
  kEvent_BombsFirstHeld,
  // A word exchanged with Aginah. The game's own flag for him is set the moment his sprite runs,
  // so it says the cave was entered, never that he was spoken to.
  kEvent_AginahTalked,
  // The small island of Lake Hylia ringed by ledges, reached by the Mirror from the dark lake.
  kEvent_Area_LakeHyliaLedgeIsland,
  // The ledge the Bumper Cave's upper mouth opens on, above the screen everyone walks across.
  kEvent_Area_BumperCaveLedge,
  // Standing past the water in the Hookshot Fairy's cave. The game marks that tall room visited
  // whole on entry, so its own bits cannot tell the far side from the doorway.
  kEvent_HookshotFairyFarSide,
  kEventCount,
} EventId;

// 24 bytes hold 192 bits; the count above must stay inside them.
_Static_assert(kEventCount <= 24 * 8, "event ledger overflow: grow SRM_EVENT_LEDGER_COUNT");

#endif  // GAME_HOOKS_EVENT_IDS_H
