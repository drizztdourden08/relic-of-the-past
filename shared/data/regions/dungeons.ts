import type { RegionDefinition, RegionConnection } from '../../types/tracker';

// ─── Dungeon Region Definitions ───

export const DUNGEON_REGIONS: RegionDefinition[] = [
  // ── Hyrule Castle ──
  { id: 'hyrule-castle', name: 'Hyrule Castle', type: 'dungeon', dungeon: 'Hyrule Castle' },
  { id: 'sewer-drop', name: 'Sewer Drop', type: 'dungeon', dungeon: 'Hyrule Castle' },
  { id: 'sewers-dark', name: 'Sewers (Dark)', type: 'dungeon', dungeon: 'Hyrule Castle' },
  { id: 'sewers', name: 'Sewers', type: 'dungeon', dungeon: 'Hyrule Castle' },
  { id: 'sewers-secret-room', name: 'Sewers Secret Room', type: 'dungeon', dungeon: 'Hyrule Castle' },
  { id: 'sanctuary', name: 'Sanctuary', type: 'dungeon', dungeon: 'Hyrule Castle' },

  // ── Castle Tower ──
  { id: 'agahnims-tower', name: 'Agahnims Tower', type: 'dungeon', dungeon: 'Castle Tower' },
  { id: 'agahnim-1', name: 'Agahnim 1', type: 'dungeon', dungeon: 'Castle Tower' },

  // ── Eastern Palace ──
  { id: 'eastern-palace', name: 'Eastern Palace', type: 'dungeon', dungeon: 'Eastern Palace' },

  // ── Desert Palace ──
  { id: 'desert-palace-main-outer', name: 'Desert Palace Main (Outer)', type: 'dungeon', dungeon: 'Desert Palace' },
  { id: 'desert-palace-main-inner', name: 'Desert Palace Main (Inner)', type: 'dungeon', dungeon: 'Desert Palace' },
  { id: 'desert-palace-east', name: 'Desert Palace East', type: 'dungeon', dungeon: 'Desert Palace' },
  { id: 'desert-palace-north', name: 'Desert Palace North', type: 'dungeon', dungeon: 'Desert Palace' },

  // ── Tower of Hera ──
  { id: 'tower-of-hera-bottom', name: 'Tower of Hera (Bottom)', type: 'dungeon', dungeon: 'Tower of Hera' },
  { id: 'tower-of-hera-basement', name: 'Tower of Hera (Basement)', type: 'dungeon', dungeon: 'Tower of Hera' },
  { id: 'tower-of-hera-top', name: 'Tower of Hera (Top)', type: 'dungeon', dungeon: 'Tower of Hera' },

  // ── Palace of Darkness ──
  { id: 'palace-of-darkness-entrance', name: 'Palace of Darkness (Entrance)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-center', name: 'Palace of Darkness (Center)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-big-key-chest', name: 'Palace of Darkness (Big Key Chest)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-bonk-section', name: 'Palace of Darkness (Bonk Section)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-north', name: 'Palace of Darkness (North)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-maze', name: 'Palace of Darkness (Maze)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-harmless-hellway', name: 'Palace of Darkness (Harmless Hellway)', type: 'dungeon', dungeon: 'Palace of Darkness' },
  { id: 'palace-of-darkness-final-section', name: 'Palace of Darkness (Final Section)', type: 'dungeon', dungeon: 'Palace of Darkness' },

  // ── Swamp Palace ──
  { id: 'swamp-palace-entrance', name: 'Swamp Palace (Entrance)', type: 'dungeon', dungeon: 'Swamp Palace' },
  { id: 'swamp-palace-first-room', name: 'Swamp Palace (First Room)', type: 'dungeon', dungeon: 'Swamp Palace' },
  { id: 'swamp-palace-starting-area', name: 'Swamp Palace (Starting Area)', type: 'dungeon', dungeon: 'Swamp Palace' },
  { id: 'swamp-palace-center', name: 'Swamp Palace (Center)', type: 'dungeon', dungeon: 'Swamp Palace' },
  { id: 'swamp-palace-west', name: 'Swamp Palace (West)', type: 'dungeon', dungeon: 'Swamp Palace' },
  { id: 'swamp-palace-north', name: 'Swamp Palace (North)', type: 'dungeon', dungeon: 'Swamp Palace' },

  // ── Thieves' Town ──
  { id: 'thieves-town-entrance', name: 'Thieves Town (Entrance)', type: 'dungeon', dungeon: "Thieves' Town" },
  { id: 'thieves-town-deep', name: 'Thieves Town (Deep)', type: 'dungeon', dungeon: "Thieves' Town" },
  { id: 'blind-fight', name: 'Blind Fight', type: 'dungeon', dungeon: "Thieves' Town" },

  // ── Skull Woods ──
  { id: 'skull-woods-first-section', name: 'Skull Woods First Section', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-first-section-right', name: 'Skull Woods First Section (Right)', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-first-section-left', name: 'Skull Woods First Section (Left)', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-first-section-top', name: 'Skull Woods First Section (Top)', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-second-section-drop', name: 'Skull Woods Second Section (Drop)', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-second-section', name: 'Skull Woods Second Section', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-final-section-entrance', name: 'Skull Woods Final Section (Entrance)', type: 'dungeon', dungeon: 'Skull Woods' },
  { id: 'skull-woods-final-section-mothula', name: 'Skull Woods Final Section (Mothula)', type: 'dungeon', dungeon: 'Skull Woods' },

  // ── Ice Palace ──
  { id: 'ice-palace-entrance', name: 'Ice Palace (Entrance)', type: 'dungeon', dungeon: 'Ice Palace' },
  { id: 'ice-palace-second-section', name: 'Ice Palace (Second Section)', type: 'dungeon', dungeon: 'Ice Palace' },
  { id: 'ice-palace-main', name: 'Ice Palace (Main)', type: 'dungeon', dungeon: 'Ice Palace' },
  { id: 'ice-palace-east', name: 'Ice Palace (East)', type: 'dungeon', dungeon: 'Ice Palace' },
  { id: 'ice-palace-east-top', name: 'Ice Palace (East Top)', type: 'dungeon', dungeon: 'Ice Palace' },
  { id: 'ice-palace-kholdstare', name: 'Ice Palace (Kholdstare)', type: 'dungeon', dungeon: 'Ice Palace' },

  // ── Misery Mire ──
  { id: 'misery-mire-entrance', name: 'Misery Mire (Entrance)', type: 'dungeon', dungeon: 'Misery Mire' },
  { id: 'misery-mire-main', name: 'Misery Mire (Main)', type: 'dungeon', dungeon: 'Misery Mire' },
  { id: 'misery-mire-west', name: 'Misery Mire (West)', type: 'dungeon', dungeon: 'Misery Mire' },
  { id: 'misery-mire-final-area', name: 'Misery Mire (Final Area)', type: 'dungeon', dungeon: 'Misery Mire' },
  { id: 'misery-mire-vitreous', name: 'Misery Mire (Vitreous)', type: 'dungeon', dungeon: 'Misery Mire' },

  // ── Turtle Rock ──
  { id: 'turtle-rock-entrance', name: 'Turtle Rock (Entrance)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-first-section', name: 'Turtle Rock (First Section)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-pokey-room', name: 'Turtle Rock (Pokey Room)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-chain-chomp-room', name: 'Turtle Rock (Chain Chomp Room)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-second-section', name: 'Turtle Rock (Second Section)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-second-section-bomb-wall', name: 'Turtle Rock (Second Section Bomb Wall)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-big-chest', name: 'Turtle Rock (Big Chest)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-crystaroller-room', name: 'Turtle Rock (Crystaroller Room)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-dark-room', name: 'Turtle Rock (Dark Room)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-eye-bridge-bomb-wall', name: 'Turtle Rock (Eye Bridge Bomb Wall)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-eye-bridge', name: 'Turtle Rock (Eye Bridge)', type: 'dungeon', dungeon: 'Turtle Rock' },
  { id: 'turtle-rock-trinexx', name: 'Turtle Rock (Trinexx)', type: 'dungeon', dungeon: 'Turtle Rock' },

  // ── Ganon's Tower ──
  { id: 'ganons-tower-entrance', name: 'Ganons Tower (Entrance)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-tile-room', name: 'Ganons Tower (Tile Room)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-compass-room', name: 'Ganons Tower (Compass Room)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-hookshot-room', name: 'Ganons Tower (Hookshot Room)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-map-room', name: 'Ganons Tower (Map Room)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-firesnake-room', name: 'Ganons Tower (Firesnake Room)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-teleport-room', name: 'Ganons Tower (Teleport Room)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-bottom', name: 'Ganons Tower (Bottom)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-top', name: 'Ganons Tower (Top)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-before-moldorm', name: 'Ganons Tower (Before Moldorm)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'ganons-tower-moldorm', name: 'Ganons Tower (Moldorm)', type: 'dungeon', dungeon: "Ganon's Tower" },
  { id: 'agahnim-2', name: 'Agahnim 2', type: 'dungeon', dungeon: "Ganon's Tower" },
];

// ─── Dungeon Region Connections ───

export const DUNGEON_CONNECTIONS: RegionConnection[] = [
  // ── Hyrule Castle ──
  { from: 'Hyrule Castle', to: 'Sewer Drop', entrance: 'Throne Room' },
  { from: 'Sewer Drop', to: 'Sewers (Dark)', entrance: 'Sewer Drop' },
  { from: 'Sewers (Dark)', to: 'Sewers', entrance: 'Sewers Door' },
  { from: 'Sewers', to: 'Sanctuary', entrance: 'Sanctuary Push Door' },
  { from: 'Sewers', to: 'Sewers', entrance: 'Sewers Back Door' },
  { from: 'Sewers', to: 'Sewers Secret Room', entrance: 'Sewers Secret Room' },

  // ── Castle Tower ──
  { from: 'Agahnims Tower', to: 'Agahnim 1', entrance: 'Agahnim 1' },

  // ── Desert Palace ──
  { from: 'Desert Palace Main (Outer)', to: 'Desert Palace East', entrance: 'Desert Palace East Wing' },
  { from: 'Desert Palace Main (Outer)', to: 'Desert Palace Main (Inner)', entrance: 'Desert Palace Pots (Outer)' },
  { from: 'Desert Palace Main (Inner)', to: 'Desert Palace Main (Outer)', entrance: 'Desert Palace Pots (Inner)' },
  { from: 'Desert Palace North', to: 'Desert Palace Main (Outer)', entrance: 'Desert Palace Exit (North)' },

  // ── Tower of Hera ──
  { from: 'Tower of Hera (Bottom)', to: 'Tower of Hera (Basement)', entrance: 'Tower of Hera Small Key Door' },
  { from: 'Tower of Hera (Bottom)', to: 'Tower of Hera (Top)', entrance: 'Tower of Hera Big Key Door' },

  // ── Palace of Darkness ──
  { from: 'Palace of Darkness (Entrance)', to: 'Palace of Darkness (Center)', entrance: 'Palace of Darkness Bridge Room' },
  { from: 'Palace of Darkness (Entrance)', to: 'Palace of Darkness (Bonk Section)', entrance: 'Palace of Darkness Bonk Wall' },
  { from: 'Palace of Darkness (Center)', to: 'Palace of Darkness (Big Key Chest)', entrance: 'Palace of Darkness Big Key Chest Staircase' },
  { from: 'Palace of Darkness (Center)', to: 'Palace of Darkness (North)', entrance: 'Palace of Darkness (North)' },
  { from: 'Palace of Darkness (Center)', to: 'Palace of Darkness (Maze)', entrance: 'Palace of Darkness Big Key Door' },
  { from: 'Palace of Darkness (Bonk Section)', to: 'Palace of Darkness (Center)', entrance: 'Palace of Darkness Hammer Peg Drop' },
  { from: 'Palace of Darkness (North)', to: 'Palace of Darkness (Harmless Hellway)', entrance: 'Palace of Darkness Spike Statue Room Door' },
  { from: 'Palace of Darkness (North)', to: 'Palace of Darkness (Maze)', entrance: 'Palace of Darkness Maze Door' },
  { from: 'Palace of Darkness (Maze)', to: 'Palace of Darkness (Final Section)', entrance: 'Palace of Darkness Final Section' },

  // ── Swamp Palace ──
  { from: 'Swamp Palace (Entrance)', to: 'Swamp Palace (First Room)', entrance: 'Swamp Palace Moat' },
  { from: 'Swamp Palace (First Room)', to: 'Swamp Palace (Starting Area)', entrance: 'Swamp Palace Small Key Door' },
  { from: 'Swamp Palace (Starting Area)', to: 'Swamp Palace (Center)', entrance: 'Swamp Palace (Center)' },
  { from: 'Swamp Palace (Center)', to: 'Swamp Palace (North)', entrance: 'Swamp Palace (North)' },
  { from: 'Swamp Palace (Center)', to: 'Swamp Palace (West)', entrance: 'Swamp Palace (West)' },

  // ── Thieves' Town ──
  { from: 'Thieves Town (Entrance)', to: 'Thieves Town (Deep)', entrance: 'Thieves Town Big Key Door' },
  { from: 'Thieves Town (Deep)', to: 'Blind Fight', entrance: 'Blind Fight' },

  // ── Skull Woods ──
  { from: 'Skull Woods First Section', to: 'Skull Woods First Section (Left)', entrance: 'Skull Woods First Section South Door' },
  { from: 'Skull Woods First Section', to: 'Skull Woods First Section (Left)', entrance: 'Skull Woods First Section West Door' },
  { from: 'Skull Woods First Section (Right)', to: 'Skull Woods First Section', entrance: 'Skull Woods First Section (Right) North Door' },
  { from: 'Skull Woods First Section (Left)', to: 'Skull Woods First Section (Right)', entrance: 'Skull Woods First Section (Left) Door to Right' },
  { from: 'Skull Woods First Section (Left)', to: 'Skull Woods First Section', entrance: 'Skull Woods First Section (Left) Door to Exit' },
  { from: 'Skull Woods Second Section (Drop)', to: 'Skull Woods Second Section', entrance: 'Skull Woods Second Section (Drop)' },
  { from: 'Skull Woods Final Section (Entrance)', to: 'Skull Woods Final Section (Mothula)', entrance: 'Skull Woods Torch Room' },
  { from: 'Skull Woods First Section', to: 'Skull Woods First Section (Top)', entrance: 'Skull Woods First Section Bomb Jump' },

  // ── Ice Palace ──
  { from: 'Ice Palace (Entrance)', to: 'Ice Palace (Second Section)', entrance: 'Ice Palace (Second Section)' },
  { from: 'Ice Palace (Second Section)', to: 'Ice Palace (Main)', entrance: 'Ice Palace (Main)' },
  { from: 'Ice Palace (Main)', to: 'Ice Palace (East)', entrance: 'Ice Palace (East)' },
  { from: 'Ice Palace (Main)', to: 'Ice Palace (Kholdstare)', entrance: 'Ice Palace (Kholdstare)' },
  { from: 'Ice Palace (East)', to: 'Ice Palace (East Top)', entrance: 'Ice Palace (East Top)' },

  // ── Misery Mire ──
  { from: 'Misery Mire (Entrance)', to: 'Misery Mire (Main)', entrance: 'Misery Mire Entrance Gap' },
  { from: 'Misery Mire (Main)', to: 'Misery Mire (West)', entrance: 'Misery Mire (West)' },
  { from: 'Misery Mire (Main)', to: 'Misery Mire (Final Area)', entrance: 'Misery Mire Big Key Door' },
  { from: 'Misery Mire (Final Area)', to: 'Misery Mire (Vitreous)', entrance: 'Misery Mire (Vitreous)' },

  // ── Turtle Rock ──
  { from: 'Turtle Rock (Entrance)', to: 'Turtle Rock (First Section)', entrance: 'Turtle Rock Entrance Gap' },
  { from: 'Turtle Rock (First Section)', to: 'Turtle Rock (Entrance)', entrance: 'Turtle Rock Entrance Gap Reverse' },
  { from: 'Turtle Rock (First Section)', to: 'Turtle Rock (Pokey Room)', entrance: 'Turtle Rock Entrance to Pokey Room' },
  { from: 'Turtle Rock (Pokey Room)', to: 'Turtle Rock (Chain Chomp Room)', entrance: 'Turtle Rock (Pokey Room) (North)' },
  { from: 'Turtle Rock (Pokey Room)', to: 'Turtle Rock (Second Section)', entrance: 'Turtle Rock (Pokey Room) (South)' },
  { from: 'Turtle Rock (Chain Chomp Room)', to: 'Turtle Rock (First Section)', entrance: 'Turtle Rock (Chain Chomp Room) (North)' },
  { from: 'Turtle Rock (Chain Chomp Room)', to: 'Turtle Rock (Second Section)', entrance: 'Turtle Rock (Chain Chomp Room) (South)' },
  { from: 'Turtle Rock (Second Section)', to: 'Turtle Rock (Crystaroller Room)', entrance: 'Turtle Rock Chain Chomp Staircase' },
  { from: 'Turtle Rock (Second Section)', to: 'Turtle Rock (Big Chest)', entrance: 'Turtle Rock Big Key Door' },
  { from: 'Turtle Rock (Second Section)', to: 'Turtle Rock (Second Section Bomb Wall)', entrance: 'Turtle Rock Second Section Bomb Wall' },
  { from: 'Turtle Rock (Second Section Bomb Wall)', to: 'Turtle Rock (Second Section)', entrance: 'Turtle Rock Second Section from Bomb Wall' },
  { from: 'Turtle Rock (Crystaroller Room)', to: 'Turtle Rock (Dark Room)', entrance: 'Turtle Rock Dark Room Staircase' },
  { from: 'Turtle Rock (Crystaroller Room)', to: 'Turtle Rock (Second Section)', entrance: 'Turtle Rock Big Key Door Reverse' },
  { from: 'Turtle Rock (Dark Room)', to: 'Turtle Rock (First Section)', entrance: 'Turtle Rock (Dark Room) (North)' },
  { from: 'Turtle Rock (Dark Room)', to: 'Turtle Rock (Eye Bridge)', entrance: 'Turtle Rock (Dark Room) (South)' },
  { from: 'Turtle Rock (Eye Bridge)', to: 'Turtle Rock (Dark Room)', entrance: 'Turtle Rock Dark Room (South)' },
  { from: 'Turtle Rock (Eye Bridge)', to: 'Turtle Rock (Trinexx)', entrance: 'Turtle Rock (Trinexx)' },
  { from: 'Turtle Rock (Eye Bridge)', to: 'Turtle Rock (Eye Bridge Bomb Wall)', entrance: 'Turtle Rock Eye Bridge Bomb Wall' },
  { from: 'Turtle Rock (Eye Bridge Bomb Wall)', to: 'Turtle Rock (Eye Bridge)', entrance: 'Turtle Rock Eye Bridge from Bomb Wall' },

  // ── Ganon's Tower ──
  { from: 'Ganons Tower (Entrance)', to: 'Ganons Tower (Tile Room)', entrance: 'Ganons Tower (Tile Room)' },
  { from: 'Ganons Tower (Entrance)', to: 'Ganons Tower (Hookshot Room)', entrance: 'Ganons Tower (Hookshot Room)' },
  { from: 'Ganons Tower (Entrance)', to: 'Ganons Tower (Bottom)', entrance: 'Ganons Tower Big Key Door' },
  { from: 'Ganons Tower (Tile Room)', to: 'Ganons Tower (Compass Room)', entrance: 'Ganons Tower (Tile Room) Key Door' },
  { from: 'Ganons Tower (Compass Room)', to: 'Ganons Tower (Bottom)', entrance: 'Ganons Tower (Bottom) (East)' },
  { from: 'Ganons Tower (Hookshot Room)', to: 'Ganons Tower (Map Room)', entrance: 'Ganons Tower (Map Room)' },
  { from: 'Ganons Tower (Hookshot Room)', to: 'Ganons Tower (Firesnake Room)', entrance: 'Ganons Tower (Double Switch Room)' },
  { from: 'Ganons Tower (Firesnake Room)', to: 'Ganons Tower (Teleport Room)', entrance: 'Ganons Tower (Firesnake Room)' },
  { from: 'Ganons Tower (Teleport Room)', to: 'Ganons Tower (Bottom)', entrance: 'Ganons Tower (Bottom) (West)' },
  { from: 'Ganons Tower (Bottom)', to: 'Ganons Tower (Top)', entrance: 'Ganons Tower (Top)' },
  { from: 'Ganons Tower (Top)', to: 'Ganons Tower (Before Moldorm)', entrance: 'Ganons Tower Torch Rooms' },
  { from: 'Ganons Tower (Before Moldorm)', to: 'Ganons Tower (Moldorm)', entrance: 'Ganons Tower Moldorm Door' },
  { from: 'Ganons Tower (Moldorm)', to: 'Agahnim 2', entrance: 'Ganons Tower Moldorm Gap' },
];
