/**
 * Runtime entrance name lookup.
 * Source: ROM kEntranceNames table (133 entries, index = entrance ID).
 */
export const ENTRANCE_NAMES: string[] = [
  "Link's House Intro","Link's House Post-intro",'Sanctuary','Hyrule Castle West','Hyrule Castle Central',
  'Hyrule Castle East','Death Mountain Express (Lower)','Death Mountain Express (Upper)','Eastern Palace',
  'Desert Palace Central','Desert Palace East','Desert Palace West','Desert Palace Boss Lair',
  "Kakariko Elder's House West","Kakariko Elder's House East",'Kakariko Angry Bros West','Kakariko Angry Bros East',
  'Mad Batter Lair',"Under Lumberjacks' Weird Tree",'Death Mountain Maze 0000','Death Mountain Maze 0001',
  'Turtle Rock Mountainface 1','Death Mountain Cape Heart Piece Cave (Lower)',
  'Death Mountain Cape Heart Piece Cave (Upper)','Turtle Rock Mountainface 2','Turtle Rock Mountainface 3',
  'Death Mountain Maze 0002','Death Mountain Maze 0003','Death Mountain Maze 0004','Death Mountain Maze 0005',
  'Death Mountain Maze 0006','Death Mountain Maze 0007','Death Mountain Maze 0008',
  'Spectacle Rock Maze 1','Spectacle Rock Maze 2','Spectacle Rock Maze 3','Hyrule Castle Tower',
  'Swamp Palace','Palace of Darkness','Misery Mire','Skull Woods 1','Skull Woods 2','Skull Woods Big Chest',
  'Skull Woods Boss Lair',"Lost Woods Thieves' Lair",'Ice Palace','Death Mountain Escape West',
  'Death Mountain Escape East',"Death Mountain Elder's Cave (Lower)","Death Mountain Elder's Cave (Upper)",
  'Hyrule Castle Secret Cellar','Tower of Hera',"Thieves's Town",'Turtle Rock Main',
  "Ganon's Pyramid Sanctum (Lower)","Ganon's Tower",'Fairy Cave 1','Kakariko Western Well',
  'Death Mountain Maze 0009','Death Mountain Maze 0010','Treasure Shell Game 1','Storyteller Cave 1',
  'Snitch House 1','Snitch House 2','SickBoy House','Byrna Gauntlet','Kakariko Pub South',
  'Kakariko Pub North','Kakariko Inn',"Sahasrahlah's Disco Infernum","Kakariko's Lame Shop",
  'Village of Outcasts Chest Game','Village of Outcasts Orphanage','Kakariko Library','Kakariko Storage Shed',
  "Kakariko Sweeper Lady's House",'Potion Shop',"Aginah's Desert Cottage",'Watergate',
  'Death Mountain Maze 0011','Fairy Cave 2','Refill Cave 0001','Refill Cave 0002','The Bomb "Shop"',
  'Village of Outcasts Retirement Center','Fairy Cave 3','Good Bee Cave','General Store 1',
  'General Store 2','Archery Game','Storyteller Cave 2','Hall of the Invisibility Cape',
  'Pond of Wishing','Pond of Happiness','Fairy Cave 4','Swamp of Evil Heart Piece Hall',
  'General Store 3',"Blind's Old Hideout",'Storyteller Cave 3','Warped Pond of Wishing','Chez Smithies',
  'Fortune Teller 1','Fortune Teller 2','Chest Shell Game 2','Storyteller Cave 4','Storyteller Cave 5',
  'Storyteller Cave 6','Village House 1','Thief Hideout 1','Thief Hideout 2','Heart Piece Cave 1',
  'Thief Hideout 3','Refill Cave 3','Fairy Cave 5','Heart Piece Cave 2','Hyrule Castle Prison',
  'Hyrule Castle Throne Room',"Hyrule Tower Agahnim's Sanctum",'Skull Woods 3 (Drop In)',
  'Skull Woods 4 (Drop In)','Skull Woods 5 (Drop In)','Skull Woods 6 (Drop In)',
  "Lost Woods Thieves' Hideout (Drop In)","Ganon's Pyramid Sanctum (Upper)",'Fairy Cave 6 (Drop In)',
  'Hyrule Castle Secret Cellar (Drop In)','Mad Batter Lair (Drop In)',
  "Under Lumberjacks' Weird Tree (Drop In)",'Kakariko Western Well (Drop In)',
  'Hyrule Sewers Goodies Room (Drop In)','Chris Houlihan Room (Drop In)','Heart Piece Cave 3 (Drop In)',
  'Ice Rod Cave',
];

/** Classify entrance type from its name for icon display */
export type EntranceType = 'door' | 'cave' | 'hole' | 'well' | 'dungeon' | 'fairy' | 'shop' | 'house' | 'unknown';

export function classifyEntrance(id: number): EntranceType {
  const name = ENTRANCE_NAMES[id] ?? '';
  if (name.includes('Drop In') || name.includes('Hole')) return 'hole';
  if (name.includes('Well')) return 'well';
  if (name.includes('Fairy')) return 'fairy';
  if (name.includes('Palace') || name.includes('Tower') || name.includes('Turtle Rock') ||
      name.includes('Skull Woods') || name.includes('Misery Mire') || name.includes('Ice Palace') ||
      name.includes("Ganon's") || name.includes('Tower of Hera') || name.includes("Thieves's Town")) return 'dungeon';
  if (name.includes('Cave') || name.includes('Maze') || name.includes('Gauntlet') ||
      name.includes('Express') || name.includes('Escape') || name.includes('Cellar') ||
      name.includes('Hideout') || name.includes('Lair') || name.includes('Hall of')) return 'cave';
  if (name.includes('Shop') || name.includes('Store') || name.includes('Game')) return 'shop';
  if (name.includes('House') || name.includes('Inn') || name.includes('Cottage') ||
      name.includes('Library') || name.includes('Pub') || name.includes('Orphanage') ||
      name.includes('Shed') || name.includes('Smithies') || name.includes('Fortune') ||
      name.includes('Sanctuary') || name.includes('Storyteller') || name.includes('Snitch') ||
      name.includes('Watergate') || name.includes('Potion') || name.includes('Elder')) return 'house';
  if (name.includes('Castle') || name.includes('Prison') || name.includes('Throne')) return 'door';
  return 'unknown';
}
