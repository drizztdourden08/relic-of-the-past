/* @layer shared-asset-extraction @kind data */
/**
 * Lookup tables for room/overworld/sprite name resolution.
 * Ported from: core/zelda3/assets/tables.py
 */

// ─── Type 0 names (room objects 0x00-0xF7) ───

const type0_names = [
  'Ceiling [L-R]','[N]Wall Horz: [L-R]','[S]Wall Horz: [L-R]','[N]Wall Horz: (LOW) [L-R]','[S]Wall Horz: (LOW) [L-R]',
  '[N]Wall Column [L-R]','[S]Wall Column [L-R]','[N]Wall Pit [L-R]','[S]Wall Pit [L-R]',
  '/ Wall Wood Bot (HIGH) [NW]','\\ Wall Wood Bot (HIGH) [SW]','\\ Wall Wood Bot (HIGH) [NE]','/ Wall Wood Bot (HIGH) [SE]',
  '/ Wall Tile Bot (HIGH) [NW]','\\ Wall Tile Bot (HIGH) [SW]','\\ Wall Tile Bot (HIGH) [NE]','/ Wall Tile Bot (HIGH) [SE]',
  '/ Wall Tile2 Bot (HIGH) [NW]','\\ Wall Tile2 Bot (HIGH) [SW]','\\ Wall Tile2 Bot (HIGH) [NE]','/ Wall Tile2 Bot (HIGH) [SE]',
  '/ Wall Tile Top (LOW)[NW]','\\ Wall Tile Top (LOW)[SW]','\\ Wall Tile Top (LOW)[NE]','/ Wall Tile Top (LOW)[SE]',
  '/ Wall Tile Bot (LOW)[NW]','\\ Wall Tile Bot (LOW)[SW]','\\ Wall Tile Bot (LOW)[NE]','/ Wall Tile Bot (LOW)[SE]',
  '/ Wall Tile2 Bot (LOW)[NW]','\\ Wall Tile2 Bot (LOW)[SW]','\\ Wall Tile2 Bot (LOW)[NE]','/ Wall Tile2 Bot (LOW)[SE]',
  'Mini Stairs [L-R]','Horz: Rail Thin [L-R]','Pit [N]Edge [L-R]','Pit [N]Edge [L-R]','Pit [N]Edge [L-R]','Pit [N]Edge [L-R]','Pit [N]Edge [L-R]',
  'Pit [S]Edge [L-R]','Pit [S]Edge [L-R]','Pit [N]Edge [L-R]','Pit [SE]Corner [L-R]','Pit [SW]Corner [L-R]','Pit [NE]Corner [L-R]','Pit [NW]Corner [L-R]',
  'Rail Wall [L-R]','Rail Wall [L-R]','Unused -empty','Unused -empty','Red Carpet Floor [L-R]','Red Carpet Floor Trim [L-R]','Unused -empty',
  '[N]Curtain [L-R]','[W]Curtain [L-R]-unused-','Statue [L-R]','Column [L-R]','[N]Wall Decor: [L-R]','[S]Wall Decor: [L-R]','Double Chair [L-R]',
  'Stand Torch [L-R]','[N]Wall Column [L-R]','Water Edge [L-R]','Water Edge [L-R]','Water Edge [L-R]','Water Edge [L-R]','Water Edge [L-R]',
  'Water Edge [L-R]','Water Edge [L-R]','Water Edge [L-R]','Unused Waterfall [L-R]','Unused Waterfall [L-R]','N/A','N/A',
  '[S]Wall Column [L-R]','Bar [L-R]','Shelf [L-R]','Shelf [L-R]','Shelf [L-R]','Cane Ride [L-R]','[N]Canon Hole [L-R]','[S]Canon Hole [L-R]',
  'Cane Ride [L-R]','Unused [L-R]','[N]Wall Torches [L-R]','[S]Wall Torches [L-R]','Unused','Unused','Unused','Unused',
  '[N]Canon Hole [L-R]','[S]Canon Hole [L-R]','Large Horz: Rail [L-R]','Block [L-R]','Long Horz: Rail [L-R]','Ceiling [U-D]',
  '[W]Wall Vert: [U-D]','[E]Wall Vert: [U-D]','[W]Wall Vert: (LOW) [U-D]','[E]Wall Vert: (LOW) [U-D]',
  '[W]Wall Column [U-D]','[E]Wall Column [U-D]','[W]Wall Pit [U-D]','[E]Wall Pit [U-D]','Vert: Rail Thin [U-D]',
  '[W]Pit Edge [U-D]','[E]Pit Edge [U-D]','[W]Rail Wall [U-D]','[E]Rail Wall [U-D]','Unused','Unused',
  'Red Floor/Wire Floor [U-D]','Red Carpet Floor Trim [U-D]','Unused','[W]Curtain [U-D]','[E]Curtain [U-D]','Column [U-D]',
  '[W]Wall Decor: [U-D]','[E]Wall Decor: [U-D]','[W]Wall Top Column [U-D]','Water Edge [U-D]','Water Edge [U-D]',
  '[E]Wall Top Column [U-D]','Cane Ride [U-D]','Pipe Ride [U-D]','Unused','[W]Wall Torches [U-D]','[E]Wall Torches [U-D]',
  '[W]Wall Decor: [U-D]','[E]Wall Decor: [U-D]','[W]Wall Decor:?? [U-D]','[E]Wall Decor:?? [U-D]',
  '[W]Wall Canon Hole [U-D]','[E]Wall Canon Hole [U-D]','Floor Torch [U-D]','Large Vert: Rail [U-D]','Block Vert: [U-D]',
  'Long Vert: Rail [U-D]','[W]Vert: Jump Edge [U-D]','[E]Vert: Jump Edge [U-D]','[W]Edge [U-D]','[E]Edge [U-D]','N/A',
  '[W]Wall Vert: [U-D]','[E]Wall Horz: [U-D]','Blue Peg Block [U-D]','Orange Peg Block [U-D]','Invisible Floor [U-D]',
  'Fake Pot [U-D]','Hammer Peg Block [U-D]','Unused','Unused','Unused','Unused','Unused','Unused','Unused','Unused','Unused',
  '/ Ceiling [NW]','\\ Ceiling [SW]','\\ Ceiling [NE]','/ Ceiling [SE]','Hole [4-way]',
  '/ Ceiling [Trans][NW]','\\ Ceiling [Trans][SW]','\\ Ceiling [Trans][NE]','/ Ceiling [Trans][SE]',
  '/ Ceiling [BG2 X-RAY][SE]','\\ Ceiling [BG2 X-RAY][NE]','\\ Ceiling [BG2 X-RAY][SW]','/ Ceiling [BG2 X-RAY][NW]',
  'N/A','N/A','N/A','[S]Horz: Jump Edge [L-R]','[S]Horz: Jump Edge [L-R]','Floor? [L-R]','N/A','N/A','N/A',
  '[N]Wall Decor: 1/2 [L-R]','[S]Wall Decor: 1/2 [L-R]','Blue Switch Block [L-R]','Red Switch Block [L-R]','Invisible Floor [L-R]',
  'N/A','fake pots [L-R]','Hammer Pegs [L-R]','Unused','Unused','Ceiling Large [4-way]','Chest Pedastal [4-way]',
  'Falling Edge Mask [4-way]','Falling Edge Mask [4-way]','Doorless Room Transition','Floor3 [4-way]','BG2 X-RAY Overlay [4-way]',
  'Floor4 [4-way]','Water Floor [4-way]','Water Floor2 [4-way]','Floor5 [4-way]','Unused','Unused',
  'Moving Wall Right [4-way]','Moving Wall Left [4-way]','Unused','Unused','Water Floor3 [4-way]','Floor6 [4-way]',
  'Unused','Unused','Unused','N/A','overlay tile? [4-way]','Lava Background? [4-way]','Swimming Overlay [4-way]',
  'Lava Background 2 [4-way]','Floor2 [4-way]','Chest Platform? [4-way]','Table / Rock [4-way]','Spike Block [4-way]',
  'Spike Floor [4-way]','Floor7 [4-way]','Floor9 [4-way]','Rupee Floor [4-way]','Moving Floor Up [4-way]',
  'Moving Floor Down [4-way]','Moving Floor Left [4-way]','Moving Floor Right [4-way]','Moving Floor/Water [4-way]',
  'Weird Floor? [4-way]','Unused','Unused','Unused','Unused','Unused','Unused','Unused','Unused','Unused','Unused','Unused',
  'Unused','Unused','Unused','Unused',
  // F8+ (type1 names stored contiguously)
  'Water Face','Waterfall Face','Waterfall Face Longer','Cane Ride Spawn [?]Block','Cane Ride Node [4-way]',
  'Cane Ride Node [S-E]','Cane Ride Node [N-E]','Cane Ride Node [S-E]-2','Cane Ride Node [N-E]-2',
  'Cane Ride Node [W-S-E]','Cane Ride Node [W-N-E]','Cane Ride Node [N-E-S]','Cane Ride Node [N-W-S]',
  'Prison Cell','Cane Ride Spawn [?]Block','?','?','?','Rupee Floor','Telepathic Tile','Down Warp Door',
  'Kholdstare Shell - BG2','Single Hammer Peg','Cell','Cell Lock','Chest','Open Chest','Stair','Stair [S](Layer)',
  'Stair Wet [S](Layer)','Staircase going Up(Up)','Staircase Going Down (Up)','Staircase Going Up (Down)',
  'Staircase Going Down (Down)','Pit Wall Corner','Pit Wall Corner','Pit Wall Corner','Pit Wall Corner',
  'Staircase Going Up (Lower)','Staircase Going Up (Lower)','Staircase Going Down (Lower)','Staircase Going Down (Lower)',
  'Dark Room BG2 Mask','Staircase Going Down (Lower)','Large Pick Up Block','Agahnim Altar','Agahnim Room','Pot','??',
  'Big Chest','Big Chest Open','Stairs Submerged [S](layer)','???','???','???','???','???','???',
  'Pipe Ride Mouth [S]','Pipe Ride Mouth [N]','Pipe Ride Mouth [E]','Pipe Ride Mouth [W]',
  'Pipe Ride Corner [S-E]','Pipe Ride Corner [N-E]','Pipe Ride Corner [S-W]','Pipe Ride Corner [N-W]',
  'Pipe Ride Tunnel [N]','Pipe Ride Tunnel [S]','Pipe Ride Tunnel [W]','Pipe Ride Tunnel [E]',
  'Pipe Ride Over Mask [U-D]','Bomb Floor','Fake Bomb Floor','Fake Bomb Floor','Warp Tile','???','???','???','???',
  'Inactive Warp','Floor Switch','Skull Pot','Single Blue Peg','Single Red Peg','','???',
  'Bar Corner [NW]','Bar Corner [SW]','Bar Corner [NE]','Bar Corner [SE]','Plate on Table','Water Troof',
  'Bookshelf','Forge','???','Bottles on Bar','???','Left Warp Door','Right Warp Door','Fake Floor Switch',
  'Fireball Shooter','Medusa Head','Hole','Top Crack Wall','Bottom Crack Wall','Left Crack Wall','Right Crack Wall',
  'Throne/Decor: Object','???','???','???','???','Window Light','Floor Light Blind BG2','Boss Goo/Shell BG2',
  'Bg2 Full Mask','Boss Entrance','Minigame Chest','???','???','???','???','???','Vitreous Boss?','???','???','???','???',
];

// ─── Type 2 names (room objects subtype 2) ───

const type2_names = [
  'Wall Outer Corner (HIGH) [NW]','Wall Outer Corner (HIGH) [SW]','Wall Outer Corner (HIGH) [NE]','Wall Outer Corner (HIGH) [SE]',
  'Wall Inner Corner (HIGH) [NW]','Wall Inner Corner (HIGH) [SW]','Wall Inner Corner (HIGH) [NE]','Wall Inner Corner (HIGH) [SE]',
  'Wall Outer Corner (LOW) [NW]','Wall Outer Corner (LOW) [SW]','Wall Outer Corner (LOW) [NE]','Wall Outer Corner (LOW) [SE]',
  'Wall Inner Corner (LOW) [NW]','Wall Inner Corner (LOW) [SW]','Wall Inner Corner (LOW) [NE]','Wall Inner Corner (LOW) [SE]',
  'Wall S-Bend (LOW) [N1]','Wall S-Bend (LOW) [S1]','Wall S-Bend (LOW) [N2]','Wall S-Bend (LOW) [S2]',
  'Wall S-Bend (LOW) [W1]','Wall S-Bend (LOW) [W2]','Wall S-Bend (LOW) [E1]','Wall S-Bend (LOW) [E2]',
  'Wall Pit Corner (Lower) [NW]','Wall Pit Corner (Lower) [SW]','Wall Pit Corner (Lower) [NE]','Wall Pit Corner (Lower) [SE]',
  'Fairy Pot','Statue','Star Tile Off','Star Tile On','Torch Lit','Barrel','Weird Bed','Table','Decoration',
  '???','???','Chair','Bed','Decoration','Wall Painting','???','???',
  'Floor Stairs Up (room)','Floor Stairs Down (room)','Floor Stairs Down2 (room)',
  'Stairs [N](unused)','Stairs [N](layer)','Stairs [N](layer)','Stairs Submerged [N](layer)',
  'Block','Water Ladder','Water Ladder','Water Gate Large',
  'Door Staircase Up R','Door Staircase Down L','Door Staircase Up R (Lower)','Door Staircase Down L (Lower)',
  'Sanctuary Wall','???','Church Pew','???','Ceiling [L-R]',
];

// ─── Derived name arrays ───

/** Room object type 0 names: "XX-Name" for indices 0x00-0xF7 */
const kType0Names: string[] = Array.from({ length: 0xf8 }, (_, i) =>
  `${i.toString(16).toUpperCase().padStart(2, '0')}-${type0_names[i]}`
);

/** Room object type 1 names: "XXX-Name" for indices 0xF80+ */
const kType1Names: string[] = Array.from({ length: 0x80 }, (_, i) =>
  `${(0xf80 + i).toString(16).toUpperCase().padStart(3, '0')}-${type0_names[i + 0xf8]}`
);

/** Room object type 2 names: "X-Name" */
const kType2Names: string[] = type2_names.map((name, i) =>
  `${(i + 0x100).toString(16).toUpperCase()}-${name}`
);

// ─── Tag names ───

const kTagNames: string[] = [
  'None','NW Kill enemy to open','NE Kill enemy to open','SW Kill enemy to open','SE Kill enemy to open',
  'W Kill enemy to open','E Kill enemy to open','N Kill enemy to open','S Kill enemy to open',
  'Clear quadrant to open','Clear room to open',
  'NW Move block to open','NE Move block to open','SW Move block to open','SE Move block to open',
  'W Move block to open','E Move block to open','N Move block to open','S Move block to open',
  'Move block to open','Pull lever to open','Clear level to open door','Switch opens door(Hold)','Switch opens door(Toggle)',
  'Turn off water','Turn on water','Water gate','Water twin','Secret wall (Right)','Secret wall (Left)','Crash','Crash',
  'Use switch to bomb wall','Holes(0)','Open chest for holes(0)','Holes(1)','Holes(2)',
  'Kill enemy to clear level','SE Kill enemy to move block','Trigger activated chest',
  'Use lever to bomb wall','NW Kill enemy for chest','NE Kill enemy for chest','SW Kill enemies for chest',
  'SE Kill enemy for chest','W Kill enemy for chest','E Kill enemy for chest','N Kill enemy for chest',
  'S Kill enemy for chest','Clear quadrant for chest','Clear room for chest','Light torches to open',
  'Holes(3)','Holes(4)','Holes(5)','Holes(6)',
  "Agahnim's room",'Holes(7)','Holes(8)','Open chest for holes(8)','Move block to get chest',
  "Kill to open Ganon's door",'Light torches to get chest','Kill boss again',
];

// ─── Effect names ───

const kEffectNames: string[] = [
  'None','01','Moving floor','Moving water','04','Red flashes','Light torch to see floor','Ganon room',
];

// ─── Collision names ───

const kCollisionNames: string[] = [
  'One','Both','Both w/scroll','Moving floor','Moving water',
];

// ─── BG2 property ───

const kBg2: string[] = [
  'None','Parallaxing','Dark','On top','Translucent','Parallaxing2','Normal','Addition','Dark room',
];

// ─── Music names (indexed by byte value) ───

const kMusicNamesMap: Record<number, string> = {
  255: 'Same', 0: 'None', 1: 'Title', 2: 'World_map', 3: 'Beginning', 4: 'Rabbit', 5: 'Forest',
  6: 'Intro', 7: 'Town', 8: 'Warp', 9: 'Dark_world', 10: 'Master_swd', 11: 'File_select',
  12: 'Soldier', 13: 'Mountain', 14: 'Shop', 15: 'Fanfare', 16: 'Castle', 17: 'Palace',
  18: 'Cave', 19: 'Clear', 20: 'Church', 21: 'Boss', 22: 'Dungeon', 23: 'Psychic',
  24: 'Secret_way', 25: 'Rescue', 26: 'Crystal', 27: 'Fountain', 28: 'Pyramid',
  29: 'Kill_Agah', 30: 'Ganon_room', 31: 'Last_boss', 32: 'Triforce', 33: 'Ending', 34: 'Staff',
  240: 'Stop', 241: 'Fade_out', 242: 'Lower_vol', 243: 'Normal_vol',
};

/** Resolve music index → name string */
const kMusicNames: Record<number, string> = new Proxy(kMusicNamesMap, {
  get(target, prop) {
    const key = typeof prop === 'string' ? Number(prop) : undefined;
    if (key !== undefined && key in target) return target[key];
    return `Unknown_${String(prop)}`;
  },
});

// ─── Ambient sound names ───

const kAmbientSoundNameMap: Record<number, string> = {
  0: 'None', 1: 'Heavy rain', 3: 'Light rain', 5: 'Stop', 7: 'Earthquake', 9: 'Wind',
  11: 'Flute', 13: 'Chime 1', 15: 'Chime 2',
};

const kAmbientSoundName: Record<number, string> = new Proxy(kAmbientSoundNameMap, {
  get(target, prop) {
    const key = typeof prop === 'string' ? Number(prop) : undefined;
    if (key !== undefined && key in target) return target[key];
    return `Unknown_${String(prop)}`;
  },
});

// ─── Palace names ───

const kPalaceNames: string[] = [
  'None','Church','Castle','East','Desert','Agahnim',
  'Water','Dark','Mud','Wood','Ice','Tower','Town','Mountain','Agahnim2',
];

// ─── Area names (160 overworld areas) ───

const kAreaNames: string[] = [
  'LW 000 : Lost Woods NW','LW 001 : Lost Woods NE','LW 002 : Lumberjack Estate',
  'LW 003 : Tower of Hera NW','LW 004 : Tower of Hera NE','LW 005 : Death Mountain Bridge NW',
  'LW 006 : Death Mountain Bridge NE','LW 007 : Turtle Rock','LW 008 : Lost Woods SW','LW 009 : Lost Woods SE',
  'LW 010 : Death Mountain Gateway','LW 011 : Tower of Hera SW','LW 012 : Tower of Hera SE',
  'LW 013 : Mountain Bridge NW','LW 014 : Mountain Bridge NE','LW 015 : Zora Falls Outskirts',
  'LW 016 : Lost Woods Outskirts','LW 017 : Kakariko Psychics Unlimited','LW 018 : Nothern Pond',
  'LW 019 : Sanctuary Grounds','LW 020 : Graveyard','LW 021 : South Bend','LW 022 : Coven of Commerce',
  'LW 023 : Zora Ridge','LW 024 : Kakariko NW','LW 025 : Kakariko NE','LW 026 : West Woods',
  'LW 027 : Hyrule Castle NW','LW 028 : Hyrule Castle NE','LW 029 : Castle East Bridge',
  'LW 030 : Eastern Ruins NW','LW 031 : Eastern Ruins NE','LW 032 : Kakariko SW','LW 033 : Kakariko SE',
  'LW 034 : Smithy Estate','LW 035 : Hyrule Castle SW','LW 036 : Hyrule Castle SE','LW 037 : Moundlands',
  'LW 038 : Eastern Ruins SW','LW 039 : Eastern Ruins SE','LW 040 : Kakariko Maze',
  'LW 041 : Kakariko South Annex','LW 042 : Haunted Grove','LW 043 : Uncle\'s Estate West',
  'LW 044 : Uncle\'s Estate East','LW 045 : Eastern Ruins Bridge','LW 046 : Eastern Ruins Ridge',
  'LW 047 : Eastern Cul-de-sac','LW 048 : Desert of Mystery NW','LW 049 : Desert of Mystery NE',
  'LW 050 : Haunted Terrace','LW 051 : Hyrule Wetlands NW','LW 052 : Hyrule Wetlands NE',
  'LW 053 : Lake Hylia NW','LW 054 : Lake Hylia NE','LW 055 : Frosty Caves',
  'LW 056 : Desert of Mystery SW','LW 057 : Desert of Mystery SE','LW 058 : Via of Mystery',
  'LW 059 : Watergate Grounds','LW 060 : Hyrule Wetlands Terrace','LW 061 : Lake Hylia SW',
  'LW 062 : Lake Hylia SE','LW 063 : Octorock Nesting Grounds',
  'DW 064 : Skull Woods NW','DW 065 : Skull Woods NE','DW 066 : Eastern Skull Clearing',
  'DW 067 : Ganon\'s Tower NW','DW 068 : Ganon\'s Tower NE','DW 069 : Death Mountain Bridge NW',
  'DW 070 : Death Mountain Bridge NE','DW 071 : Turtle Rock','DW 072 : Skull Woods SW',
  'DW 073 : Skull Woods SE','DW 074 : Bungie Cave Fun Zone','DW 075 : Ganon\'s Tower SW',
  'DW 076 : Ganon\'s Tower SE','DW 077 : Death Mountain Bridge SW','DW 078 : Death Mountain Bridge SE',
  'DW 079 : Falls of Ill Omen','DW 080 : Skull Woods Outskirts',
  'DW 081 : Village of Outcasts Psychics Unlimited','DW 082 : Northern Pond (Evil Edition)',
  'DW 083 : Unctuary Grounds','DW 084 : Garden of Very Bad Things','DW 085 : South Bend',
  'DW 086 : Riverside Commerce','DW 087 : Ridge of Ill Omen','DW 088 : Village of Outcasts NW',
  'DW 089 : Village of Outcasts NE','DW 090 : West Woods','DW 091 : Pyramid of Power NW',
  'DW 092 : Pyramid of Power NE','DW 093 : Pyramid East Non-bridge','DW 094 : Maze of Darkness NW',
  'DW 095 : Maze of Darkness NE','DW 096 : Village of Outcasts SW','DW 097 : Village of Outcasts SW',
  'DW 098 : Gossip Shop','DW 099 : Pyramid of Power SW','DW 100 : Pyramid of Power SE',
  'DW 101 : Moundlands','DW 102 : Maze of Darkness SW','DW 103 : Maze of Darkness SE',
  'DW 104 : Digging Game Field','DW 105 : Archery Shop Grounds','DW 106 : Depressing Grove',
  'DW 107 : Bomb Shop Grounds West','DW 108 : Bomp Shop Grounds','DW 109 : Hammer Time Bridge',
  'DW 110 : Terrace of Darkness','DW 111 : Cul-de-sac of Darkness','DW 112 : Swamp of Evil NW',
  'DW 113 : Swamp of Evil NE','DW 114 : Depressing Terrace','DW 115 : Wilted Wetlands NW',
  'DW 116 : Wilted Wetlands NE','DW 117 : Lake Dielia NW','DW 118 : Lake Dielia NE','DW 119 : Info Hub',
  'DW 120 : Swamp of Evil SW','DW 121 : Swamp of Evil SE','DW 122 : Via To Nowhere',
  'DW 123 : Swamp Palace Grounds','DW 124 : Wilted Terrace','DW 125 : Lake Dielia SW',
  'DW 126 : Lake Dielia SE','DW 127 : A Terrible Vacation Spot',
  'SP 128 : Master Grove / Under Hyrule Bridge','SP 129 : Zora Falls NW <AVAILABLE>',
  'SP 130 : Zora Falls NE <NO SPRITES>','NA 131 : Unused N/A','NA 132 : Unused N/A','NA 133 : Unused N/A',
  'NA 134 : Unused N/A','NA 135 : Unused N/A','SP 136 : Triforce Room / Curtain Overlay',
  'SP 137 : Zora Falls SW <NO SPRITES>','SP 138 : Zora Falls SE <NO SPRITES>','NA 139 : Unused N/A',
  'NA 140 : Unused N/A','NA 141 : Unused N/A','NA 142 : Unused N/A','NA 143 : Unused N/A',
  'NA 144 : Unused N/A','NA 145 : Unused N/A','NA 146 : Unused N/A',
  'SP 147 : Triforce Rm / Overlay (2?) N/A','SP 148 : Master Gr. / Under Bdg (2?) N/A',
  'SP 149 : Birds\' Eye Woods Underlay','SP 150 : Death Mountain Panorama',
  'SP 151 : Lost Woods Mist Overlay','NA 152 : Unused N/A','NA 153 : Unused N/A','NA 154 : Unused N/A',
  'NA 155 : Unused N/A','SP 156 : Lava Flow Underlay','SP 157 : Lost Woods Mist Overlay (2?) N/A',
  'SP 158 : Lost Woods Tree Cover Overlay','SP 159 : Rain Overlay','NA 160 : non-existant N/A',
];

// ─── Entrance names (133 entries) ───

const kEntranceNames: string[] = [
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

// ─── Sprite names ───

const kSpriteNames: string[] = [
  '00-Raven','01-Vulture','02','03-BigCanon','04-PullSwitch','05-DnSwitch','06-TrapSwitch','07-FloorMove',
  '08-Octorok','09-Mouldrum','0A-4WayOctorok','0B-Chicken','0C-HoveringRock','0D-Cucumber','0E-SnapDragon',
  '0F-OctoBlimp','10','11-Hinox','12-PigSpearMan','13-MiniHelmasaur','14-GargoyleGrate','15-Bubble',
  '16-Mutant','17-BushCrab','18-Moldorm','19-Poe/Ghini','1A-BlackSmith(Frog','1B-AnArrow','1C-Statue',
  '1D-UselessSprite','1E-PegSwitch','1F-SickBoy','20-BombSlug','21-PushSwitch','22-HoppingBulbPlan',
  '23-RedMiri','24-BlueMiri','25-LiveTree','26-BlueOrb','27-Squirrel','28-PersonRm270','29-Thief',
  '2A-DustGirl','2B-TentMan','2C-Lumberjacks','2D','2E-FluteBoy','2F-Person','30-Person','31-FortuneTeller',
  '32-AngryBrother','33-PullForRupees','34-ScaredGirl2','35-HedgeMan','36-Witch','37-Waterfall',
  '38-ArrowTarget','39-GuyByTheSign','3A-Person11_227','3B-DashItem','3C-FarmBoy','3D-ScaredGirl1',
  '3E-RockCrab','3F-PalaceGuard','40-ElectricBarrier','41-BlueSoldier','42-GreenSoldier',
  '43-RedSpearSoldier','44-Warrior','45-HogSpearMan','46-BlueArcher','47-GreenGrassArche',
  '48-RedSpearKnight','49-RedGrassSpearSo','4A-RedBombKnight','4B-Knight','4C-Geldman','4D-Bunny',
  '4E-Tentacle2','4F-Tentacle','50-GlassSquirrel','51-Armos','52-ZoraKing','53-ArmosKnight','54-Lanmolas',
  '55-FireBallZora','56-WalkingZora','57-HyliaObstacle','58-Crab','59-Animal','5A-Animal',
  '5B-WallBubble(L-R)','5C-WallBubble(R-L)','5D-Roller_1','5E-Roller_2','5F-Roller_3','60-Roller_4',
  '61-Beamos','62-MasterSwd','63-SandCrab1','64-SandCrab2','65-ArcherGame','66-Cannon(Right)',
  '67-Cannon(Left)','68-Cannon(Down)','69-Cannon(Up)','6A-MorningStar','6B-CannonSoldier','6C-Teleport',
  '6D-Rat','6E-Rope','6F-Keese','70','71-Leever','72-Pond','73-Priest/Uncle','74-Runner','75-BottleMan',
  '76-Zelda','77-WierdBuble','78-OldWoman','79-Bee','7A-Agahnim','7B-OneShotMagicBal','7C-StalfosHead',
  '7D-BigSpikeBlock','7E-FireBlade','7F-FireBlade2','80-Lanmola','81-WaterBug','82-4Bubbles',
  '83-GreenRocklops','84-RedRocklops','85-BigSpikeBlock','86-Triceritops','87-FireKeese','88-Mothula',
  '89','8A-SpikeBlock','8B-Gibdo','8C-Arrghus','8D-ArrghusFuzz','8E-Shell','8F-Blob','90-WallMaster',
  '91-StalfosKnight','92-Helmasaur','93-RedOrb','94','95-EyeLaser(Right)','96-EyeLaser(Left)',
  '97-EyeLaser(Down)','98-EyeLaser(Up)','99-Penguin','9A-Splash','9B-Wizzrobe','9C','9D-VRat','9E-Ostrich',
  '9F-Rabbit','A0-Uglybird','A1-IceMan','A2-KholdStare','A3','A4','A5-GreenLizard','A6-RedLizard',
  'A7-Stalfos','A8-GreenAirBomber','A9-BlueAirBomber','AA-LikeLike','AB','AC-Apples','AD-OldMan',
  'AE-DownPipe','AF-UpPipe','B0-RightPipe','B1-LeftPipe','B2-Good-Bee','B3-Inscription','B4-BlueChest',
  'B5-BombShop','B6-Kiki','B7-BlindMan','B8','B9-Bully&Whimp(DW)','BA-Whirlpool','BB-ShopMan',
  'BC-OldMan2','BD-Viterous','BE-','BF-Lighting','C0-Item','C1-AgahTalk','C2-RockChip','C3-Half-Bubble',
  'C4-Bully','C5-Shooter','C6-4WayShooter','C7-FuzzyStack','C8-BigFairy','C9-Tektite','CA-Chomp',
  'CB-TriNexx1','CC-TriNexx2','CD-TriNexx3','CE-Blind','CF-SwampSnake','D0-Lynel','D1-Transform/Smoke',
  'D2-Fish','D3-AliveRock','D4-GroundBomb','D5-DiggingGameGuy','D6-Ganon','D7','D8-Heart','D9-Rupee-G',
  'DA-Rupee-B','DB-InTreeRocks','DC-Bomb','DD-4_bombs','DE-8_bombs','DF-Magic','E0-BigMagic','E1-Arrow',
  'E2-10-Arrows','E3-Fairy','E4-Key','E5-Big_Key','E6','E7-Mushroom','E8-FakeSword','E9-ShopMan2',
  'EA-WitchAssistant','EB-HeartPie','EC-PickedObj','ED','EE-Mantle','EF','F0','F1','F2-MedallianTablet',
  'F3-PersonsDoor','F4-FallingRocks','F5','F6','F7','F8','F9','FA','FB','FC','FD','FE','FF',
  '100-CannonRoom','101-01','102-CannonRoom','103-CannonBalls','104-RopeDrp(Snake)','105-StalfosDrop',
  '106-BombDrop','107-MovingFloor','108-Transformer','109-WallMaster','10A-FloorDrop(Sqr)',
  '10B-FloorDrop(Vert)','10C-0C','10D-0D','10E-0E','10F-0F','110-RightEvil','111-LeftEvil',
  '112-DownEvil','113-UpEvil','114-FloorTiles','115-WizzrobeSpawn','116-MiniBats','117-PotTrap',
  '118-StalfosAppear','119-ArmosKnights','11A-BombDrop','11B',
];

// ─── Secret names ───

const kSpriteDropToNameIdx = [
  0xd9, 0x3e, 0x79, 0xd9, 0xdc, 0xd8, 0xda, 0xe4, 0xe1, 0xdc, 0xd8, 0xdf, 0xe0, 0x0b, 0x42, 0xd3,
  0x41, 0xd4, 0xd9, 0xe3, 0xd8, 0,
];

const buildSecretNames = (): Record<number, string> => {
  const r: Record<number, string> = {};
  for (let i = 1; i <= 22; i++) {
    const nameIdx = kSpriteDropToNameIdx[i - 1];
    const spriteName = kSpriteNames[nameIdx];
    const dashIdx = spriteName.indexOf('-');
    r[i] = `${i.toString(16).toUpperCase().padStart(2, '0')}-${dashIdx >= 0 ? spriteName.slice(dashIdx + 1) : spriteName}`;
  }
  const specials: Record<number, string> = { 0: 'Nothing', 4: 'Random', 0x80: 'Hole', 0x82: 'Warp', 0x84: 'Staircase', 0x86: 'Bombable', 0x88: 'Switch' };
  for (const [k, v] of Object.entries(specials)) {
    const ki = Number(k);
    r[ki] = `${ki.toString(16).toUpperCase().padStart(2, '0')}-${v}`;
  }
  return r;
};

const kSecretNames: Record<number, string> = buildSecretNames();

export {
  kAmbientSoundName,
  kAreaNames,
  kBg2,
  kCollisionNames,
  kEffectNames,
  kEntranceNames,
  kMusicNames,
  kPalaceNames,
  kSecretNames,
  kSpriteNames,
  kTagNames,
  kType0Names,
  kType1Names,
  kType2Names
};
