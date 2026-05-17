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
  { from: 'hyrule-castle', to: 'sewer-drop', entrance: 'Throne Room' },
  { from: 'sewer-drop', to: 'sewers-dark', entrance: 'Sewer Drop' },
  { from: 'sewers-dark', to: 'sewers', entrance: 'Sewers Door' },
  { from: 'sewers', to: 'sanctuary', entrance: 'Sanctuary Push Door' },
  { from: 'sewers', to: 'sewers', entrance: 'Sewers Back Door' },
  { from: 'sewers', to: 'sewers-secret-room', entrance: 'Sewers Secret Room' },

  // ── Castle Tower ──
  { from: 'agahnims-tower', to: 'agahnim-1', entrance: 'Agahnim 1' },

  // ── Desert Palace ──
  { from: 'desert-palace-main-outer', to: 'desert-palace-east', entrance: 'Desert Palace East Wing' },
  { from: 'desert-palace-main-outer', to: 'desert-palace-main-inner', entrance: 'Desert Palace Pots (Outer)' },
  { from: 'desert-palace-main-inner', to: 'desert-palace-main-outer', entrance: 'Desert Palace Pots (Inner)' },
  { from: 'desert-palace-north', to: 'desert-palace-main-outer', entrance: 'Desert Palace Exit (North)' },

  // ── Tower of Hera ──
  { from: 'tower-of-hera-bottom', to: 'tower-of-hera-basement', entrance: 'Tower of Hera Small Key Door' },
  { from: 'tower-of-hera-bottom', to: 'tower-of-hera-top', entrance: 'Tower of Hera Big Key Door' },

  // ── Palace of Darkness ──
  { from: 'palace-of-darkness-entrance', to: 'palace-of-darkness-center', entrance: 'Palace of Darkness Bridge Room' },
  { from: 'palace-of-darkness-entrance', to: 'palace-of-darkness-bonk-section', entrance: 'Palace of Darkness Bonk Wall' },
  { from: 'palace-of-darkness-center', to: 'palace-of-darkness-big-key-chest', entrance: 'Palace of Darkness Big Key Chest Staircase' },
  { from: 'palace-of-darkness-center', to: 'palace-of-darkness-north', entrance: 'Palace of Darkness (North)' },
  { from: 'palace-of-darkness-center', to: 'palace-of-darkness-maze', entrance: 'Palace of Darkness Big Key Door' },
  { from: 'palace-of-darkness-bonk-section', to: 'palace-of-darkness-center', entrance: 'Palace of Darkness Hammer Peg Drop' },
  { from: 'palace-of-darkness-north', to: 'palace-of-darkness-harmless-hellway', entrance: 'Palace of Darkness Spike Statue Room Door' },
  { from: 'palace-of-darkness-north', to: 'palace-of-darkness-maze', entrance: 'Palace of Darkness Maze Door' },
  { from: 'palace-of-darkness-maze', to: 'palace-of-darkness-final-section', entrance: 'Palace of Darkness Final Section' },

  // ── Swamp Palace ──
  { from: 'swamp-palace-entrance', to: 'swamp-palace-first-room', entrance: 'Swamp Palace Moat' },
  { from: 'swamp-palace-first-room', to: 'swamp-palace-starting-area', entrance: 'Swamp Palace Small Key Door' },
  { from: 'swamp-palace-starting-area', to: 'swamp-palace-center', entrance: 'Swamp Palace (Center)' },
  { from: 'swamp-palace-center', to: 'swamp-palace-north', entrance: 'Swamp Palace (North)' },
  { from: 'swamp-palace-center', to: 'swamp-palace-west', entrance: 'Swamp Palace (West)' },

  // ── Thieves' Town ──
  { from: 'thieves-town-entrance', to: 'thieves-town-deep', entrance: 'Thieves Town Big Key Door' },
  { from: 'thieves-town-deep', to: 'blind-fight', entrance: 'Blind Fight' },

  // ── Skull Woods ──
  { from: 'skull-woods-first-section', to: 'skull-woods-first-section-left', entrance: 'Skull Woods First Section South Door' },
  { from: 'skull-woods-first-section', to: 'skull-woods-first-section-left', entrance: 'Skull Woods First Section West Door' },
  { from: 'skull-woods-first-section-right', to: 'skull-woods-first-section', entrance: 'Skull Woods First Section (Right) North Door' },
  { from: 'skull-woods-first-section-left', to: 'skull-woods-first-section-right', entrance: 'Skull Woods First Section (Left) Door to Right' },
  { from: 'skull-woods-first-section-left', to: 'skull-woods-first-section', entrance: 'Skull Woods First Section (Left) Door to Exit' },
  { from: 'skull-woods-second-section-drop', to: 'skull-woods-second-section', entrance: 'Skull Woods Second Section (Drop)' },
  { from: 'skull-woods-final-section-entrance', to: 'skull-woods-final-section-mothula', entrance: 'Skull Woods Torch Room' },
  { from: 'skull-woods-first-section', to: 'skull-woods-first-section-top', entrance: 'Skull Woods First Section Bomb Jump' },

  // ── Ice Palace ──
  { from: 'ice-palace-entrance', to: 'ice-palace-second-section', entrance: 'Ice Palace (Second Section)' },
  { from: 'ice-palace-second-section', to: 'ice-palace-main', entrance: 'Ice Palace (Main)' },
  { from: 'ice-palace-main', to: 'ice-palace-east', entrance: 'Ice Palace (East)' },
  { from: 'ice-palace-main', to: 'ice-palace-kholdstare', entrance: 'Ice Palace (Kholdstare)' },
  { from: 'ice-palace-east', to: 'ice-palace-east-top', entrance: 'Ice Palace (East Top)' },

  // ── Misery Mire ──
  { from: 'misery-mire-entrance', to: 'misery-mire-main', entrance: 'Misery Mire Entrance Gap' },
  { from: 'misery-mire-main', to: 'misery-mire-west', entrance: 'Misery Mire (West)' },
  { from: 'misery-mire-main', to: 'misery-mire-final-area', entrance: 'Misery Mire Big Key Door' },
  { from: 'misery-mire-final-area', to: 'misery-mire-vitreous', entrance: 'Misery Mire (Vitreous)' },

  // ── Turtle Rock ──
  { from: 'turtle-rock-entrance', to: 'turtle-rock-first-section', entrance: 'Turtle Rock Entrance Gap' },
  { from: 'turtle-rock-first-section', to: 'turtle-rock-entrance', entrance: 'Turtle Rock Entrance Gap Reverse' },
  { from: 'turtle-rock-first-section', to: 'turtle-rock-pokey-room', entrance: 'Turtle Rock Entrance to Pokey Room' },
  { from: 'turtle-rock-pokey-room', to: 'turtle-rock-chain-chomp-room', entrance: 'Turtle Rock (Pokey Room) (North)' },
  { from: 'turtle-rock-pokey-room', to: 'turtle-rock-second-section', entrance: 'Turtle Rock (Pokey Room) (South)' },
  { from: 'turtle-rock-chain-chomp-room', to: 'turtle-rock-first-section', entrance: 'Turtle Rock (Chain Chomp Room) (North)' },
  { from: 'turtle-rock-chain-chomp-room', to: 'turtle-rock-second-section', entrance: 'Turtle Rock (Chain Chomp Room) (South)' },
  { from: 'turtle-rock-second-section', to: 'turtle-rock-crystaroller-room', entrance: 'Turtle Rock Chain Chomp Staircase' },
  { from: 'turtle-rock-second-section', to: 'turtle-rock-big-chest', entrance: 'Turtle Rock Big Key Door' },
  { from: 'turtle-rock-second-section', to: 'turtle-rock-second-section-bomb-wall', entrance: 'Turtle Rock Second Section Bomb Wall' },
  { from: 'turtle-rock-second-section-bomb-wall', to: 'turtle-rock-second-section', entrance: 'Turtle Rock Second Section from Bomb Wall' },
  { from: 'turtle-rock-crystaroller-room', to: 'turtle-rock-dark-room', entrance: 'Turtle Rock Dark Room Staircase' },
  { from: 'turtle-rock-crystaroller-room', to: 'turtle-rock-second-section', entrance: 'Turtle Rock Big Key Door Reverse' },
  { from: 'turtle-rock-dark-room', to: 'turtle-rock-first-section', entrance: 'Turtle Rock (Dark Room) (North)' },
  { from: 'turtle-rock-dark-room', to: 'turtle-rock-eye-bridge', entrance: 'Turtle Rock (Dark Room) (South)' },
  { from: 'turtle-rock-eye-bridge', to: 'turtle-rock-dark-room', entrance: 'Turtle Rock Dark Room (South)' },
  { from: 'turtle-rock-eye-bridge', to: 'turtle-rock-trinexx', entrance: 'Turtle Rock (Trinexx)' },
  { from: 'turtle-rock-eye-bridge', to: 'turtle-rock-eye-bridge-bomb-wall', entrance: 'Turtle Rock Eye Bridge Bomb Wall' },
  { from: 'turtle-rock-eye-bridge-bomb-wall', to: 'turtle-rock-eye-bridge', entrance: 'Turtle Rock Eye Bridge from Bomb Wall' },

  // ── Ganon's Tower ──
  { from: 'ganons-tower-entrance', to: 'ganons-tower-tile-room', entrance: 'Ganons Tower (Tile Room)' },
  { from: 'ganons-tower-entrance', to: 'ganons-tower-hookshot-room', entrance: 'Ganons Tower (Hookshot Room)' },
  { from: 'ganons-tower-entrance', to: 'ganons-tower-bottom', entrance: 'Ganons Tower Big Key Door' },
  { from: 'ganons-tower-tile-room', to: 'ganons-tower-compass-room', entrance: 'Ganons Tower (Tile Room) Key Door' },
  { from: 'ganons-tower-compass-room', to: 'ganons-tower-bottom', entrance: 'Ganons Tower (Bottom) (East)' },
  { from: 'ganons-tower-hookshot-room', to: 'ganons-tower-map-room', entrance: 'Ganons Tower (Map Room)' },
  { from: 'ganons-tower-hookshot-room', to: 'ganons-tower-firesnake-room', entrance: 'Ganons Tower (Double Switch Room)' },
  { from: 'ganons-tower-firesnake-room', to: 'ganons-tower-teleport-room', entrance: 'Ganons Tower (Firesnake Room)' },
  { from: 'ganons-tower-teleport-room', to: 'ganons-tower-bottom', entrance: 'Ganons Tower (Bottom) (West)' },
  { from: 'ganons-tower-bottom', to: 'ganons-tower-top', entrance: 'Ganons Tower (Top)' },
  { from: 'ganons-tower-top', to: 'ganons-tower-before-moldorm', entrance: 'Ganons Tower Torch Rooms' },
  { from: 'ganons-tower-before-moldorm', to: 'ganons-tower-moldorm', entrance: 'Ganons Tower Moldorm Door' },
  { from: 'ganons-tower-moldorm', to: 'agahnim-2', entrance: 'Ganons Tower Moldorm Gap' },
];
