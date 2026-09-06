/* @layer shared-game @kind data */
/**
 * Names for the game's music slots, one record per MSU-1 track number.
 *
 * Vault-only: these are the game's own vocabulary, so they never live in the public repo. The
 * loader there (shared/game/data/msu-track-names.ts) globs this path and comes up empty without it,
 * which leaves every slot reading as "Track N".
 *
 * Numbers 1-34 are the vanilla music slots every MSU-1 pack for this game uses. There is no slot 35
 * or 36. The rest are the extended per-area and per-interior slots this app's Deluxe numbering adds
 * on top, and every one of them is DERIVED, never guessed:
 *
 *   - 37-58, 110, 112 come from inverting OVERWORLD_AREA_TRACKS (shared/game/data/msu-deluxe-remap.ts).
 *     Each area index was resolved to a screen record by gameId.overworldIndex, and the track is named
 *     for the region those areas have in common.
 *   - 59-107 and 114 come from inverting ENTRANCE_TRACKS. Each entrance index was resolved against the
 *     ROM's own entrance tables (room at $82C813, palace at $82D48B, default music at $82D82E) and the
 *     overworld door/hole tables ($9BB96F / $9BBB73 / $9BB826 / $9BB84C), which say exactly which
 *     overworld area each door sits on. A group whose entrances all carry a palace index is named from
 *     PALACE_INDEX_NAMES; the rest are named from the areas their doors sit on.
 *
 * Where an interior could not be pinned down, the name states the derivation instead of inventing one.
 * A single room number can hold several unrelated interiors in different quadrants (entrances 0x69 and
 * 0x6A both land in room 0x10E yet open onto different overworld areas), and this repo's interior
 * screen records carry no quadrant, so a room number alone does not identify a place.
 *
 * Self-contained on purpose: no type import, no annotation. A vault record is synced into
 * WHATEVER branch is checked out, so importing a type that only exists on one of them breaks tsc
 * everywhere else. collectRecords casts at the consumer, so the shape is checked where it is used.
 */

const MSU_TRACK_NAMES = [
  { trackNum: 1, name: 'Title ~ Link to the Past' },
  { trackNum: 2, name: 'Hyrule Field Main Theme' },
  { trackNum: 3, name: 'Time of the Falling Rain' },
  { trackNum: 4, name: 'The Silly Pink Rabbit' },
  { trackNum: 5, name: 'Forest of Mystery' },
  { trackNum: 6, name: 'Seal of Seven Maidens' },
  { trackNum: 7, name: 'Kakariko Village' },
  { trackNum: 8, name: 'Mirror Warp' },
  { trackNum: 9, name: 'Dark Golden Land' },
  { trackNum: 10, name: 'Unsealing the Master Sword' },
  { trackNum: 11, name: 'Beginning of the Journey' },
  { trackNum: 12, name: 'Soldiers of Kakariko Village' },
  { trackNum: 13, name: 'Black Mist' },
  { trackNum: 14, name: 'Guessing Game House' },
  { trackNum: 15, name: 'Triforce Fanfare (unused)' },
  { trackNum: 16, name: 'Majestic Castle' },
  { trackNum: 17, name: 'Lost Ancient Ruins' },
  { trackNum: 18, name: 'Dank Dungeons' },
  { trackNum: 19, name: 'Great Victory!' },
  { trackNum: 20, name: 'Safety in the Sanctuary' },
  { trackNum: 21, name: 'Anger of the Guardians' },
  { trackNum: 22, name: 'Dungeon of Shadows' },
  { trackNum: 23, name: 'Fortune Teller' },
  { trackNum: 24, name: 'Dank Dungeons (second cave theme)' },
  { trackNum: 25, name: 'Princess Zelda\'s Rescue' },
  { trackNum: 26, name: 'Meeting the Maidens' },
  { trackNum: 27, name: 'The Goddess Appears' },
  { trackNum: 28, name: 'Priest of the Dark Order' },
  { trackNum: 29, name: 'Release of Ganon' },
  { trackNum: 30, name: 'Ganon\'s Message' },
  { trackNum: 31, name: 'The Prince of Darkness' },
  { trackNum: 32, name: 'Power of the Gods' },
  { trackNum: 33, name: 'Ending Sequence' },
  { trackNum: 34, name: 'Staff Roll' },

  // Per-area replacements, inverted from OVERWORLD_AREA_TRACKS.
  { trackNum: 37, name: 'Light World: Lost Woods' },
  { trackNum: 38, name: 'Light World: Death Mountain' },
  { trackNum: 39, name: 'Light World: Eastern Summit' },
  { trackNum: 40, name: 'Light World: Coven of Commerce and Zora Ridge' },
  { trackNum: 41, name: 'Light World: Zora Falls and Northern River' },
  { trackNum: 42, name: 'Light World: fields and roads (default)' },
  { trackNum: 43, name: 'Light World: Kakariko Village' },
  { trackNum: 44, name: 'Light World: Desert of Mystery' },
  { trackNum: 45, name: 'Light World: Eastern Ruins' },
  { trackNum: 46, name: 'Light World: Lake Hylia' },
  { trackNum: 47, name: 'Light World: Hyrule Castle grounds' },
  { trackNum: 48, name: 'Light World: Haunted Grove and Hyrule Wetlands' },
  { trackNum: 49, name: 'Dark World: Skull Woods' },
  { trackNum: 50, name: 'Dark World: Death Mountain' },
  { trackNum: 51, name: 'Dark World: fields and roads (default)' },
  { trackNum: 52, name: 'Dark World: Village of Outcasts' },
  { trackNum: 53, name: 'Dark World: Swamp of Evil' },
  { trackNum: 54, name: 'Dark World: Maze of Darkness' },
  { trackNum: 55, name: 'Dark World: Lake Dielia' },
  { trackNum: 56, name: 'Dark World: Pyramid of Power' },
  { trackNum: 57, name: 'Dark World: Wilted Wetlands and Depressing Grove' },
  { trackNum: 58, name: 'Dark World: Digging Game Field' },

  // Per-entrance replacements, inverted from ENTRANCE_TRACKS.
  { trackNum: 59, name: 'Houses: Starting House and village homes' },
  { trackNum: 60, name: 'Sanctuary' },
  { trackNum: 61, name: 'Hyrule Castle' },
  { trackNum: 62, name: 'Caves (default interior theme)' },
  { trackNum: 63, name: 'Eastern Palace' },
  { trackNum: 64, name: 'Desert Palace' },
  { trackNum: 65, name: 'Interior: Kakariko (entrances 0x0D, 0x0E)' },
  { trackNum: 66, name: 'Interior: Kakariko Maze and South Annex (entrances 0x0F, 0x10)' },
  { trackNum: 67, name: 'Interior: entrances 0x12, 0x55, 0x71, 0x7F' },
  { trackNum: 68, name: 'Turtle Rock' },
  { trackNum: 69, name: 'Castle Tower' },
  { trackNum: 70, name: 'Swamp Palace' },
  { trackNum: 71, name: 'Palace of Darkness' },
  { trackNum: 72, name: 'Misery Mire' },
  { trackNum: 73, name: 'Skull Woods' },
  { trackNum: 74, name: 'Ice Palace' },
  { trackNum: 75, name: 'Interior: entrances 0x30, 0x31, 0x3D, 0x62, 0x6F' },
  { trackNum: 76, name: 'Interior: entrances 0x32, 0x41, 0x5A, 0x7D' },
  { trackNum: 77, name: 'Tower of Hera' },
  { trackNum: 78, name: 'Thieves\' Town' },
  { trackNum: 79, name: 'Interior: Pyramid of Power (entrance 0x36)' },
  { trackNum: 80, name: 'Ganon\'s Tower' },
  { trackNum: 81, name: 'Interior: entrances 0x38, 0x5C, 0x5E, 0x7C' },
  { trackNum: 82, name: 'Interior: Lost Woods (entrance 0x3C)' },
  { trackNum: 83, name: 'Interior: entrances 0x46, 0x57, 0x58, 0x60' },
  { trackNum: 84, name: 'Interior: Coven of Commerce (entrance 0x4C)' },
  { trackNum: 85, name: 'Interior: Death Mountain (entrance 0x50)' },
  { trackNum: 86, name: 'Interior: Bomb Shop Grounds (entrance 0x53)' },
  { trackNum: 87, name: 'Interior: Archery Shop Grounds (entrance 0x59)' },
  { trackNum: 88, name: 'Interior: entrances 0x5B, 0x5F' },
  { trackNum: 89, name: 'Interior: Kakariko (entrance 0x61)' },
  { trackNum: 90, name: 'Interior: Smithy Estate (entrance 0x64)' },
  { trackNum: 91, name: 'Interior: fortune tellers (entrances 0x65, 0x66)' },
  { trackNum: 92, name: 'Interior: entrances 0x68, 0x6A' },
  { trackNum: 93, name: 'Interior: entrances 0x69, 0x6C' },
  { trackNum: 94, name: 'Interior: Uncle\'s Estate East (entrance 0x82)' },
  { trackNum: 95, name: 'Interior: Desert of Mystery (entrance 0x4D)' },
  { trackNum: 96, name: 'Interior: Eastern Ruins (entrance 0x45)' },
  { trackNum: 97, name: 'Interior: Pyramid of Power (entrance 0x63)' },
  { trackNum: 98, name: 'Interior: Lake Hylia (entrance 0x5D)' },
  { trackNum: 99, name: 'Interior: Village of Outcasts (entrance 0x47)' },
  { trackNum: 100, name: 'Interior: Kakariko South Annex (entrance 0x67)' },
  { trackNum: 102, name: 'Interior: Lost Woods (entrances 0x2C, 0x7A)' },
  { trackNum: 103, name: 'Interior: Frosty Caves (entrances 0x56, 0x84)' },
  { trackNum: 104, name: 'Interior: Watergate Grounds (entrance 0x4E)' },
  { trackNum: 105, name: 'Desert Palace: Big Chest Room entrance' },
  { trackNum: 106, name: 'Skull Woods: Pot Prison entrance' },
  { trackNum: 107, name: 'Interior: Via of Mystery (entrance 0x6D)' },
  { trackNum: 110, name: 'Dark World: Info Hub and A Terrible Vacation Spot' },
  { trackNum: 112, name: 'Light World: Kakariko Maze and South Annex' },
  { trackNum: 114, name: 'Interior: Pyramid of Power hole (entrance 0x7B)' },
];

export { MSU_TRACK_NAMES };
