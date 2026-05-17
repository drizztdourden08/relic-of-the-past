import type { RegionDefinition, RegionConnection } from '../../types/tracker';

// ─── Light World Regions ───

const LIGHT_WORLD_REGIONS: RegionDefinition[] = [
  { id: 'menu', name: 'Menu', type: 'lightWorld' },
  { id: 'light-world', name: 'Light World', type: 'lightWorld' },
  { id: 'death-mountain-entrance', name: 'Death Mountain Entrance', type: 'lightWorld' },
  { id: 'lake-hylia-central-island', name: 'Lake Hylia Central Island', type: 'lightWorld' },
  { id: 'zoras-river', name: 'Zoras River', type: 'lightWorld' },
  { id: 'kings-grave-area', name: 'Kings Grave Area', type: 'lightWorld' },
  { id: 'hyrule-castle-courtyard', name: 'Hyrule Castle Courtyard', type: 'lightWorld' },
  { id: 'light-world-rain', name: 'Light World (Rain)', type: 'lightWorld' },
  { id: 'hyrule-castle-ledge', name: 'Hyrule Castle Ledge', type: 'lightWorld' },
  { id: 'master-sword-meadow', name: 'Master Sword Meadow', type: 'lightWorld' },
  { id: 'death-mountain', name: 'Death Mountain', type: 'lightWorld' },
  { id: 'death-mountain-return-ledge', name: 'Death Mountain Return Ledge', type: 'lightWorld' },
  { id: 'east-death-mountain-bottom', name: 'East Death Mountain (Bottom)', type: 'lightWorld' },
  { id: 'east-death-mountain-top', name: 'East Death Mountain (Top)', type: 'lightWorld' },
  { id: 'spiral-cave-ledge', name: 'Spiral Cave Ledge', type: 'lightWorld' },
  { id: 'fairy-ascension-plateau', name: 'Fairy Ascension Plateau', type: 'lightWorld' },
  { id: 'fairy-ascension-ledge', name: 'Fairy Ascension Ledge', type: 'lightWorld' },
  { id: 'death-mountain-top', name: 'Death Mountain (Top)', type: 'lightWorld' },
  { id: 'spectacle-rock', name: 'Spectacle Rock', type: 'lightWorld' },
  { id: 'lake-hylia-island', name: 'Lake Hylia Island', type: 'lightWorld' },
  { id: 'maze-race-ledge', name: 'Maze Race Ledge', type: 'lightWorld' },
  { id: 'desert-ledge', name: 'Desert Ledge', type: 'lightWorld' },
  { id: 'desert-ledge-northeast', name: 'Desert Ledge (Northeast)', type: 'lightWorld' },
  { id: 'desert-palace-stairs', name: 'Desert Palace Stairs', type: 'lightWorld' },
  { id: 'desert-palace-lone-stairs', name: 'Desert Palace Lone Stairs', type: 'lightWorld' },
  { id: 'desert-palace-entrance-north-spot', name: 'Desert Palace Entrance (North) Spot', type: 'lightWorld' },
  { id: 'bat-cave-drop-ledge', name: 'Bat Cave Drop Ledge', type: 'lightWorld' },
  { id: 'cave-45-ledge', name: 'Cave 45 Ledge', type: 'lightWorld' },
  { id: 'graveyard-ledge', name: 'Graveyard Ledge', type: 'lightWorld' },
  { id: 'bombos-tablet-ledge', name: 'Bombos Tablet Ledge', type: 'lightWorld' },
  { id: 'hobo-bridge', name: 'Hobo Bridge', type: 'lightWorld' },
  { id: 'desert-northern-cliffs', name: 'Desert Northern Cliffs', type: 'lightWorld' },
  { id: 'mimic-cave-ledge', name: 'Mimic Cave Ledge', type: 'lightWorld' },
  { id: 'death-mountain-floating-island-lw', name: 'Death Mountain Floating Island (Light World)', type: 'lightWorld' },
  { id: 'pyramid-ledge-lw', name: 'Pyramid Ledge (Light World)', type: 'lightWorld' },
];

// ─── Dark World Regions ───

const DARK_WORLD_REGIONS: RegionDefinition[] = [
  { id: 'east-dark-world', name: 'East Dark World', type: 'darkWorld' },
  { id: 'catfish', name: 'Catfish', type: 'darkWorld' },
  { id: 'northeast-dark-world', name: 'Northeast Dark World', type: 'darkWorld' },
  { id: 'south-dark-world', name: 'South Dark World', type: 'darkWorld' },
  { id: 'west-dark-world', name: 'West Dark World', type: 'darkWorld' },
  { id: 'dark-grassy-lawn', name: 'Dark Grassy Lawn', type: 'darkWorld' },
  { id: 'hammer-peg-area', name: 'Hammer Peg Area', type: 'darkWorld' },
  { id: 'bumper-cave-entrance', name: 'Bumper Cave Entrance', type: 'darkWorld' },
  { id: 'bumper-cave-ledge', name: 'Bumper Cave Ledge', type: 'darkWorld' },
  { id: 'skull-woods-forest', name: 'Skull Woods Forest', type: 'darkWorld' },
  { id: 'skull-woods-forest-west', name: 'Skull Woods Forest (West)', type: 'darkWorld' },
  { id: 'dark-desert', name: 'Dark Desert', type: 'darkWorld' },
  { id: 'dark-lake-hylia', name: 'Dark Lake Hylia', type: 'darkWorld' },
  { id: 'dark-lake-hylia-central-island', name: 'Dark Lake Hylia Central Island', type: 'darkWorld' },
  { id: 'dark-lake-hylia-ledge', name: 'Dark Lake Hylia Ledge', type: 'darkWorld' },
  { id: 'dark-death-mountain-west-bottom', name: 'Dark Death Mountain (West Bottom)', type: 'darkWorld' },
  { id: 'dark-death-mountain-top', name: 'Dark Death Mountain (Top)', type: 'darkWorld' },
  { id: 'dark-death-mountain-ledge', name: 'Dark Death Mountain Ledge', type: 'darkWorld' },
  { id: 'dark-death-mountain-isolated-ledge', name: 'Dark Death Mountain Isolated Ledge', type: 'darkWorld' },
  { id: 'dark-death-mountain-east-bottom', name: 'Dark Death Mountain (East Bottom)', type: 'darkWorld' },
  { id: 'death-mountain-floating-island-dw', name: 'Death Mountain Floating Island (Dark World)', type: 'darkWorld' },
  { id: 'turtle-rock-top', name: 'Turtle Rock (Top)', type: 'darkWorld' },
  { id: 'dark-death-mountain-bunny-descent', name: 'Dark Death Mountain Bunny Descent Area', type: 'darkWorld' },
  { id: 'pyramid-ledge', name: 'Pyramid Ledge', type: 'darkWorld' },
];

// ─── Cave Regions ───

const CAVE_REGIONS: RegionDefinition[] = [
  // --- Kakariko Village ---
  { id: 'blinds-hideout', name: 'Blinds Hideout', type: 'cave' },
  { id: 'chicken-house', name: 'Chicken House', type: 'cave' },
  { id: 'sick-kids-house', name: 'Sick Kids House', type: 'cave' },
  { id: 'kakariko-well-top', name: 'Kakariko Well (top)', type: 'cave' },
  { id: 'kakariko-well-bottom', name: 'Kakariko Well (bottom)', type: 'cave' },
  { id: 'blacksmiths-hut', name: 'Blacksmiths Hut', type: 'cave' },
  { id: 'tavern', name: 'Tavern', type: 'cave' },
  { id: 'tavern-front', name: 'Tavern (Front)', type: 'cave' },
  { id: 'elder-house', name: 'Elder House', type: 'cave' },
  { id: 'snitch-lady-east', name: 'Snitch Lady (East)', type: 'cave' },
  { id: 'snitch-lady-west', name: 'Snitch Lady (West)', type: 'cave' },
  { id: 'bush-covered-house', name: 'Bush Covered House', type: 'cave' },
  { id: 'light-world-bomb-hut', name: 'Light World Bomb Hut', type: 'cave' },
  { id: 'kakariko-shop', name: 'Kakariko Shop', type: 'cave' },
  { id: 'kakariko-gamble-game', name: 'Kakariko Gamble Game', type: 'cave' },
  { id: 'library', name: 'Library', type: 'cave' },

  // --- Central Light World ---
  { id: 'links-house', name: 'Links House', type: 'cave' },
  { id: 'chris-houlihan-room', name: 'Chris Houlihan Room', type: 'cave' },
  { id: 'dam', name: 'Dam', type: 'cave' },
  { id: 'hyrule-castle-secret-entrance', name: 'Hyrule Castle Secret Entrance', type: 'cave' },
  { id: 'sahasrahlas-hut', name: 'Sahasrahlas Hut', type: 'cave' },
  { id: 'aginahs-cave', name: 'Aginahs Cave', type: 'cave' },
  { id: 'bat-cave-right', name: 'Bat Cave (right)', type: 'cave' },
  { id: 'bat-cave-left', name: 'Bat Cave (left)', type: 'cave' },
  { id: 'lumberjack-house', name: 'Lumberjack House', type: 'cave' },
  { id: 'bonk-fairy-light', name: 'Bonk Fairy (Light)', type: 'cave' },
  { id: 'fortune-teller-light', name: 'Fortune Teller (Light)', type: 'cave' },
  { id: 'lake-hylia-fortune-teller', name: 'Lake Hylia Fortune Teller', type: 'cave' },
  { id: 'potion-shop', name: 'Potion Shop', type: 'cave' },
  { id: 'capacity-upgrade', name: 'Capacity Upgrade', type: 'cave' },
  { id: 'two-brothers-house', name: 'Two Brothers House', type: 'cave' },
  { id: 'waterfall-of-wishing', name: 'Waterfall of Wishing', type: 'cave' },
  { id: 'kings-grave', name: 'Kings Grave', type: 'cave' },
  { id: 'north-fairy-cave', name: 'North Fairy Cave', type: 'cave' },

  // --- Lake Hylia / South ---
  { id: 'lake-hylia-healer-fairy', name: 'Lake Hylia Healer Fairy', type: 'cave' },
  { id: 'swamp-healer-fairy', name: 'Swamp Healer Fairy', type: 'cave' },
  { id: 'desert-healer-fairy', name: 'Desert Healer Fairy', type: 'cave' },
  { id: 'mini-moldorm-cave', name: 'Mini Moldorm Cave', type: 'cave' },
  { id: 'ice-rod-cave', name: 'Ice Rod Cave', type: 'cave' },
  { id: 'good-bee-cave', name: 'Good Bee Cave', type: 'cave' },
  { id: '20-rupee-cave', name: '20 Rupee Cave', type: 'cave' },
  { id: 'cave-shop-lake-hylia', name: 'Cave Shop (Lake Hylia)', type: 'cave' },
  { id: 'bonk-rock-cave', name: 'Bonk Rock Cave', type: 'cave' },
  { id: 'long-fairy-cave', name: 'Long Fairy Cave', type: 'cave' },
  { id: '50-rupee-cave', name: '50 Rupee Cave', type: 'cave' },
  { id: 'cave-45', name: 'Cave 45', type: 'cave' },
  { id: 'graveyard-cave', name: 'Graveyard Cave', type: 'cave' },
  { id: 'checkerboard-cave', name: 'Checkerboard Cave', type: 'cave' },

  // --- Lost Woods ---
  { id: 'lost-woods-hideout-top', name: 'Lost Woods Hideout (top)', type: 'cave' },
  { id: 'lost-woods-hideout-bottom', name: 'Lost Woods Hideout (bottom)', type: 'cave' },
  { id: 'lumberjack-tree-top', name: 'Lumberjack Tree (top)', type: 'cave' },
  { id: 'lumberjack-tree-bottom', name: 'Lumberjack Tree (bottom)', type: 'cave' },
  { id: 'lost-woods-gamble', name: 'Lost Woods Gamble', type: 'cave' },

  // --- Death Mountain (LW caves) ---
  { id: 'old-man-cave', name: 'Old Man Cave', type: 'cave' },
  { id: 'old-man-house', name: 'Old Man House', type: 'cave' },
  { id: 'old-man-house-back', name: 'Old Man House Back', type: 'cave' },
  { id: 'spectacle-rock-cave-top', name: 'Spectacle Rock Cave (Top)', type: 'cave' },
  { id: 'spectacle-rock-cave-bottom', name: 'Spectacle Rock Cave (Bottom)', type: 'cave' },
  { id: 'spectacle-rock-cave-peak', name: 'Spectacle Rock Cave (Peak)', type: 'cave' },
  { id: 'death-mountain-return-cave', name: 'Death Mountain Return Cave', type: 'cave' },
  { id: 'paradox-cave-front', name: 'Paradox Cave Front', type: 'cave' },
  { id: 'paradox-cave-chest-area', name: 'Paradox Cave Chest Area', type: 'cave' },
  { id: 'paradox-cave', name: 'Paradox Cave', type: 'cave' },
  { id: 'light-world-death-mountain-shop', name: 'Light World Death Mountain Shop', type: 'cave' },
  { id: 'spiral-cave-top', name: 'Spiral Cave (Top)', type: 'cave' },
  { id: 'spiral-cave-bottom', name: 'Spiral Cave (Bottom)', type: 'cave' },
  { id: 'fairy-ascension-cave-bottom', name: 'Fairy Ascension Cave (Bottom)', type: 'cave' },
  { id: 'fairy-ascension-cave-drop', name: 'Fairy Ascension Cave (Drop)', type: 'cave' },
  { id: 'fairy-ascension-cave-top', name: 'Fairy Ascension Cave (Top)', type: 'cave' },
  { id: 'hookshot-fairy', name: 'Hookshot Fairy', type: 'cave' },

  // --- Dark World caves ---
  { id: 'bonk-fairy-dark', name: 'Bonk Fairy (Dark)', type: 'cave' },
  { id: 'dark-lake-hylia-healer-fairy', name: 'Dark Lake Hylia Healer Fairy', type: 'cave' },
  { id: 'dark-lake-hylia-ledge-healer-fairy', name: 'Dark Lake Hylia Ledge Healer Fairy', type: 'cave' },
  { id: 'dark-desert-healer-fairy', name: 'Dark Desert Healer Fairy', type: 'cave' },
  { id: 'dark-death-mountain-healer-fairy', name: 'Dark Death Mountain Healer Fairy', type: 'cave' },
  { id: 'mire-shed', name: 'Mire Shed', type: 'cave' },
  { id: 'dark-desert-hint', name: 'Dark Desert Hint', type: 'cave' },
  { id: 'fortune-teller-dark', name: 'Fortune Teller (Dark)', type: 'cave' },
  { id: 'village-of-outcasts-shop', name: 'Village of Outcasts Shop', type: 'cave' },
  { id: 'dark-lake-hylia-shop', name: 'Dark Lake Hylia Shop', type: 'cave' },
  { id: 'dark-world-lumberjack-shop', name: 'Dark World Lumberjack Shop', type: 'cave' },
  { id: 'dark-world-potion-shop', name: 'Dark World Potion Shop', type: 'cave' },
  { id: 'dark-world-hammer-peg-cave', name: 'Dark World Hammer Peg Cave', type: 'cave' },
  { id: 'pyramid-fairy', name: 'Pyramid Fairy', type: 'cave' },
  { id: 'brewery', name: 'Brewery', type: 'cave' },
  { id: 'c-shaped-house', name: 'C-Shaped House', type: 'cave' },
  { id: 'chest-game', name: 'Chest Game', type: 'cave' },
  { id: 'red-shield-shop', name: 'Red Shield Shop', type: 'cave' },
  { id: 'dark-sanctuary-hint', name: 'Dark Sanctuary Hint', type: 'cave' },
  { id: 'bumper-cave', name: 'Bumper Cave', type: 'cave' },
  { id: 'hype-cave', name: 'Hype Cave', type: 'cave' },
  { id: 'dark-lake-hylia-ledge-hint', name: 'Dark Lake Hylia Ledge Hint', type: 'cave' },
  { id: 'dark-lake-hylia-ledge-spike-cave', name: 'Dark Lake Hylia Ledge Spike Cave', type: 'cave' },
  { id: 'superbunny-cave-top', name: 'Superbunny Cave (Top)', type: 'cave' },
  { id: 'superbunny-cave-bottom', name: 'Superbunny Cave (Bottom)', type: 'cave' },
  { id: 'spike-cave', name: 'Spike Cave', type: 'cave' },
  { id: 'hookshot-cave', name: 'Hookshot Cave', type: 'cave' },
  { id: 'hookshot-cave-upper', name: 'Hookshot Cave (Upper)', type: 'cave' },
  { id: 'palace-of-darkness-hint', name: 'Palace of Darkness Hint', type: 'cave' },
  { id: 'east-dark-world-hint', name: 'East Dark World Hint', type: 'cave' },
  { id: 'big-bomb-shop', name: 'Big Bomb Shop', type: 'cave' },
  { id: 'archery-game', name: 'Archery Game', type: 'cave' },
  { id: 'mimic-cave', name: 'Mimic Cave', type: 'cave' },
  { id: 'pyramid', name: 'Pyramid', type: 'cave' },
  { id: 'bottom-of-pyramid', name: 'Bottom of Pyramid', type: 'cave' },
  { id: 'cave-shop-dark-death-mountain', name: 'Cave Shop (Dark Death Mountain)', type: 'cave' },
];

// ─── All Overworld Regions ───

export const OVERWORLD_REGIONS: RegionDefinition[] = [
  ...LIGHT_WORLD_REGIONS,
  ...DARK_WORLD_REGIONS,
  ...CAVE_REGIONS,
];

// ─── Region Connections ───
// Each connection represents a traversable edge in the region graph.
// Entrance names match Archipelago's entrance randomizer naming.

export const OVERWORLD_CONNECTIONS: RegionConnection[] = [
  // ══════════════════════════════════════════════════
  // Menu (Save & Quit destinations)
  // ══════════════════════════════════════════════════
  { from: 'menu', to: 'light-world', entrance: 'Links House S&Q' },
  { from: 'menu', to: 'sanctuary', entrance: 'Sanctuary S&Q' },
  { from: 'menu', to: 'old-man-cave', entrance: 'Old Man S&Q' },

  // ══════════════════════════════════════════════════
  // Light World — Main Overworld Exits
  // ══════════════════════════════════════════════════

  // --- Kakariko / West Light World ---
  { from: 'light-world', to: 'blinds-hideout', entrance: 'Blinds Hideout' },
  { from: 'light-world', to: 'elder-house', entrance: 'Elder House (East)' },
  { from: 'light-world', to: 'elder-house', entrance: 'Elder House (West)' },
  { from: 'light-world', to: 'snitch-lady-east', entrance: 'Snitch Lady (East)' },
  { from: 'light-world', to: 'snitch-lady-west', entrance: 'Snitch Lady (West)' },
  { from: 'light-world', to: 'bush-covered-house', entrance: 'Bush Covered House' },
  { from: 'light-world', to: 'tavern-front', entrance: 'Tavern (Front)' },
  { from: 'light-world', to: 'light-world-bomb-hut', entrance: 'Light World Bomb Hut' },
  { from: 'light-world', to: 'kakariko-shop', entrance: 'Kakariko Shop' },
  { from: 'light-world', to: 'tavern', entrance: 'Tavern North' },
  { from: 'light-world', to: 'chicken-house', entrance: 'Chicken House' },
  { from: 'light-world', to: 'sick-kids-house', entrance: 'Sick Kids House' },
  { from: 'light-world', to: 'blacksmiths-hut', entrance: 'Blacksmiths Hut' },
  { from: 'light-world', to: 'kakariko-well-top', entrance: 'Kakariko Well Drop' },
  { from: 'light-world', to: 'kakariko-well-bottom', entrance: 'Kakariko Well Cave' },
  { from: 'light-world', to: 'library', entrance: 'Library' },
  { from: 'light-world', to: 'kakariko-gamble-game', entrance: 'Kakariko Gamble Game' },

  // --- Central Light World ---
  { from: 'light-world', to: 'links-house', entrance: 'Links House' },
  { from: 'links-house', to: 'light-world', entrance: 'Links House Exit' },
  { from: 'links-house', to: 'light-world-rain', entrance: 'Links House Exit (Rain)' },
  { from: 'light-world-rain', to: 'hyrule-castle-secret-entrance', entrance: 'HC Secret Entrance Drop (Rain)' },
  { from: 'light-world-rain', to: 'hyrule-castle-courtyard', entrance: 'HC Main Gate (Rain)' },
  { from: 'light-world', to: 'hyrule-castle-secret-entrance', entrance: 'Hyrule Castle Secret Entrance Drop' },
  { from: 'hyrule-castle-secret-entrance', to: 'hyrule-castle', entrance: 'Secret Passage to Castle' },
  { from: 'light-world', to: 'hyrule-castle-courtyard', entrance: 'Hyrule Castle Main Gate' },
  { from: 'light-world', to: 'sanctuary', entrance: 'Sanctuary' },
  { from: 'light-world', to: 'kings-grave-area', entrance: 'Sanctuary Grave' },
  { from: 'light-world', to: 'dam', entrance: 'Dam' },
  { from: 'light-world', to: 'sahasrahlas-hut', entrance: 'Sahasrahlas Hut' },
  { from: 'light-world', to: 'aginahs-cave', entrance: 'Aginahs Cave' },
  { from: 'light-world', to: 'bat-cave-drop-ledge', entrance: 'Bat Cave Drop Ledge' },
  { from: 'light-world', to: 'bat-cave-right', entrance: 'Bat Cave Cave' },
  { from: 'light-world', to: 'bonk-rock-cave', entrance: 'Bonk Rock Cave' },
  { from: 'light-world', to: 'potion-shop', entrance: 'Potion Shop' },
  { from: 'light-world', to: 'two-brothers-house', entrance: 'Two Brothers House Exit (East)' },
  { from: 'light-world', to: 'fortune-teller-light', entrance: 'Fortune Teller (Light)' },
  { from: 'light-world', to: 'lumberjack-house', entrance: 'Lumberjack House' },
  { from: 'light-world', to: 'lake-hylia-fortune-teller', entrance: 'Lake Hylia Fortune Teller' },
  { from: 'light-world', to: 'north-fairy-cave', entrance: 'North Fairy Cave Drop' },

  // --- Lost Woods ---
  { from: 'light-world', to: 'lost-woods-hideout-top', entrance: 'Lost Woods Hideout Drop' },
  { from: 'light-world', to: 'lost-woods-hideout-bottom', entrance: 'Lost Woods Hideout Stump' },
  { from: 'light-world', to: 'lumberjack-tree-top', entrance: 'Lumberjack Tree Tree' },
  { from: 'light-world', to: 'lumberjack-tree-bottom', entrance: 'Lumberjack Tree Cave' },
  { from: 'light-world', to: 'master-sword-meadow', entrance: 'Master Sword Meadow' },
  { from: 'light-world', to: 'lost-woods-gamble', entrance: 'Lost Woods Gamble' },

  // --- Lake Hylia / South ---
  { from: 'light-world', to: 'lake-hylia-central-island', entrance: 'Lake Hylia Central Island Pier' },
  { from: 'light-world', to: 'mini-moldorm-cave', entrance: 'Mini Moldorm Cave' },
  { from: 'light-world', to: 'ice-rod-cave', entrance: 'Ice Rod Cave' },
  { from: 'light-world', to: 'good-bee-cave', entrance: 'Good Bee Cave' },
  { from: 'light-world', to: '20-rupee-cave', entrance: '20 Rupee Cave' },
  { from: 'light-world', to: 'cave-shop-lake-hylia', entrance: 'Cave Shop (Lake Hylia)' },
  { from: 'light-world', to: 'long-fairy-cave', entrance: 'Long Fairy Cave' },
  { from: 'light-world', to: '50-rupee-cave', entrance: '50 Rupee Cave' },
  { from: 'light-world', to: 'bonk-fairy-light', entrance: 'Bonk Fairy (Light)' },
  { from: 'light-world', to: 'hobo-bridge', entrance: 'Hobo Bridge' },
  { from: 'light-world', to: 'waterfall-of-wishing', entrance: 'Waterfall of Wishing' },
  { from: 'light-world', to: 'lake-hylia-healer-fairy', entrance: 'Lake Hylia Fairy' },
  { from: 'light-world', to: 'swamp-healer-fairy', entrance: 'Light Hype Fairy' },
  { from: 'light-world', to: 'desert-healer-fairy', entrance: 'Desert Fairy' },

  // --- Desert ---
  { from: 'light-world', to: 'desert-palace-stairs', entrance: 'Desert Palace Stairs' },

  // --- Flute / Teleporter exits ---
  { from: 'light-world', to: 'death-mountain-entrance', entrance: 'Flute Spot 1' },
  { from: 'light-world', to: 'dark-desert', entrance: 'Dark Desert Teleporter' },
  { from: 'light-world', to: 'east-dark-world', entrance: 'East Hyrule Teleporter' },
  { from: 'light-world', to: 'south-dark-world', entrance: 'South Hyrule Teleporter' },
  { from: 'light-world', to: 'west-dark-world', entrance: 'Kakariko Teleporter' },

  // --- Death Mountain entrance ---
  { from: 'light-world', to: 'death-mountain-entrance', entrance: 'Death Mountain Entrance Rock' },

  // --- Dungeon entrances from Light World ---
  { from: 'light-world', to: 'eastern-palace', entrance: 'Eastern Palace' },

  // --- Zora's River ---
  { from: 'light-world', to: 'zoras-river', entrance: 'Zoras River' },

  // --- Pyramid top ---
  { from: 'light-world', to: 'pyramid-ledge-lw', entrance: 'Top of Pyramid' },

  // ══════════════════════════════════════════════════
  // Hyrule Castle Courtyard
  // ══════════════════════════════════════════════════
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle', entrance: 'Hyrule Castle Entrance (South)' },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle', entrance: 'Hyrule Castle Entrance (East)' },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle', entrance: 'Hyrule Castle Entrance (West)' },
  { from: 'hyrule-castle-courtyard', to: 'agahnims-tower', entrance: 'Agahnims Tower' },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle-secret-entrance', entrance: 'Hyrule Castle Secret Entrance Stairs' },

  // ══════════════════════════════════════════════════
  // Hyrule Castle Ledge
  // ══════════════════════════════════════════════════
  { from: 'hyrule-castle-ledge', to: 'hyrule-castle-courtyard', entrance: 'Hyrule Castle Ledge Courtyard Drop' },
  { from: 'hyrule-castle-ledge', to: 'light-world', entrance: 'Hyrule Castle Ledge Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Death Mountain — West Side
  // ══════════════════════════════════════════════════
  { from: 'death-mountain-entrance', to: 'old-man-cave', entrance: 'Old Man Cave (West)' },
  { from: 'death-mountain-entrance', to: 'death-mountain', entrance: 'Death Mountain Entrance Drop' },

  { from: 'death-mountain', to: 'old-man-cave', entrance: 'Old Man Cave (East)' },
  { from: 'death-mountain', to: 'old-man-house', entrance: 'Old Man House (Bottom)' },
  { from: 'death-mountain', to: 'death-mountain-return-ledge', entrance: 'Death Mountain Return Ledge Drop' },
  { from: 'death-mountain', to: 'spectacle-rock-cave-bottom', entrance: 'Spectacle Rock Cave' },
  { from: 'death-mountain', to: 'spectacle-rock-cave-top', entrance: 'Spectacle Rock Cave (Top)' },
  { from: 'death-mountain', to: 'death-mountain-top', entrance: 'Death Mountain Climb' },
  { from: 'death-mountain', to: 'light-world-death-mountain-shop', entrance: 'Light World Death Mountain Shop' },

  { from: 'death-mountain-return-ledge', to: 'death-mountain-return-cave', entrance: 'Death Mountain Return Cave (East)' },
  { from: 'death-mountain-return-ledge', to: 'death-mountain', entrance: 'Death Mountain Return Ledge Drop' },

  { from: 'death-mountain-top', to: 'spectacle-rock', entrance: 'Spectacle Rock Drop' },
  { from: 'death-mountain-top', to: 'death-mountain', entrance: 'Death Mountain Drop' },
  { from: 'death-mountain-top', to: 'east-death-mountain-top', entrance: 'Death Mountain (Top) to East' },
  { from: 'death-mountain-top', to: 'tower-of-hera-bottom', entrance: 'Tower of Hera' },
  { from: 'death-mountain-top', to: 'spectacle-rock-cave-peak', entrance: 'Spectacle Rock Cave Peak' },
  { from: 'death-mountain-top', to: 'dark-death-mountain-top', entrance: 'Death Mountain (Top) Teleporter' },

  { from: 'spectacle-rock', to: 'death-mountain-top', entrance: 'Spectacle Rock Drop' },

  // ══════════════════════════════════════════════════
  // Death Mountain — East Side
  // ══════════════════════════════════════════════════
  { from: 'east-death-mountain-bottom', to: 'spiral-cave-bottom', entrance: 'Spiral Cave' },
  { from: 'east-death-mountain-bottom', to: 'fairy-ascension-plateau', entrance: 'Fairy Ascension Plateau' },
  { from: 'east-death-mountain-bottom', to: 'east-death-mountain-top', entrance: 'East Death Mountain Climb' },
  { from: 'east-death-mountain-bottom', to: 'paradox-cave-front', entrance: 'Paradox Cave (Bottom)' },
  { from: 'east-death-mountain-bottom', to: 'hookshot-fairy', entrance: 'Hookshot Fairy' },

  { from: 'east-death-mountain-top', to: 'paradox-cave', entrance: 'Paradox Cave (Top)' },
  { from: 'east-death-mountain-top', to: 'spiral-cave-ledge', entrance: 'Spiral Cave Ledge Drop' },
  { from: 'east-death-mountain-top', to: 'mimic-cave-ledge', entrance: 'Mimic Cave Mirror Spot' },
  { from: 'east-death-mountain-top', to: 'east-death-mountain-bottom', entrance: 'East Death Mountain Drop' },
  { from: 'east-death-mountain-top', to: 'superbunny-cave-top', entrance: 'Superbunny Cave (Top)' },
  { from: 'east-death-mountain-top', to: 'dark-death-mountain-east-bottom', entrance: 'East Death Mountain Teleporter' },

  { from: 'spiral-cave-ledge', to: 'spiral-cave-top', entrance: 'Spiral Cave (Top)' },
  { from: 'spiral-cave-ledge', to: 'east-death-mountain-bottom', entrance: 'Spiral Cave Ledge Drop' },

  { from: 'fairy-ascension-plateau', to: 'fairy-ascension-cave-bottom', entrance: 'Fairy Ascension Cave (Bottom)' },
  { from: 'fairy-ascension-plateau', to: 'east-death-mountain-bottom', entrance: 'Fairy Ascension Plateau Drop' },

  { from: 'fairy-ascension-ledge', to: 'fairy-ascension-cave-top', entrance: 'Fairy Ascension Cave (Top)' },
  { from: 'fairy-ascension-ledge', to: 'fairy-ascension-plateau', entrance: 'Fairy Ascension Ledge Drop' },

  { from: 'mimic-cave-ledge', to: 'mimic-cave', entrance: 'Mimic Cave' },

  // ══════════════════════════════════════════════════
  // Death Mountain Floating Island
  // ══════════════════════════════════════════════════
  { from: 'death-mountain-floating-island-lw', to: 'east-death-mountain-top', entrance: 'Death Mountain Floating Island Drop' },

  // ══════════════════════════════════════════════════
  // Death Mountain Cave Connections (internal)
  // ══════════════════════════════════════════════════
  { from: 'old-man-cave', to: 'death-mountain', entrance: 'Old Man Cave Exit (East)' },
  { from: 'old-man-cave', to: 'death-mountain-entrance', entrance: 'Old Man Cave Exit (West)' },
  { from: 'old-man-house', to: 'old-man-house-back', entrance: 'Old Man House Front to Back' },
  { from: 'old-man-house-back', to: 'death-mountain-return-ledge', entrance: 'Old Man House Back to Ledge' },
  { from: 'death-mountain-return-cave', to: 'light-world', entrance: 'Death Mountain Return Cave Exit (West)' },

  { from: 'paradox-cave-front', to: 'paradox-cave-chest-area', entrance: 'Paradox Cave Push Block' },
  { from: 'paradox-cave-chest-area', to: 'paradox-cave-front', entrance: 'Paradox Cave Push Block Reverse' },
  { from: 'paradox-cave', to: 'east-death-mountain-top', entrance: 'Paradox Cave Exit (Top)' },
  { from: 'paradox-cave', to: 'paradox-cave-chest-area', entrance: 'Paradox Cave Inner' },

  { from: 'spiral-cave-top', to: 'spiral-cave-bottom', entrance: 'Spiral Cave' },
  { from: 'spiral-cave-bottom', to: 'east-death-mountain-bottom', entrance: 'Spiral Cave Exit' },

  { from: 'fairy-ascension-cave-bottom', to: 'fairy-ascension-cave-drop', entrance: 'Fairy Ascension Cave Climb' },
  { from: 'fairy-ascension-cave-top', to: 'fairy-ascension-cave-drop', entrance: 'Fairy Ascension Cave Drop' },

  { from: 'superbunny-cave-top', to: 'superbunny-cave-bottom', entrance: 'Superbunny Cave Descent' },
  { from: 'superbunny-cave-bottom', to: 'east-death-mountain-bottom', entrance: 'Superbunny Cave Exit (Bottom)' },

  { from: 'hookshot-cave', to: 'hookshot-cave-upper', entrance: 'Hookshot Cave Bonk Path' },
  { from: 'hookshot-cave-upper', to: 'hookshot-cave', entrance: 'Hookshot Cave Hook Path' },
  { from: 'hookshot-cave-upper', to: 'death-mountain-floating-island-dw', entrance: 'Hookshot Cave Back Exit' },

  // ══════════════════════════════════════════════════
  // Desert connections
  // ══════════════════════════════════════════════════
  { from: 'desert-palace-stairs', to: 'desert-palace-entrance-north-spot', entrance: 'Desert Palace Stairs Ascent' },
  { from: 'desert-palace-stairs', to: 'light-world', entrance: 'Desert Palace Stairs Drop' },
  { from: 'desert-palace-entrance-north-spot', to: 'desert-palace-north', entrance: 'Desert Palace Entrance (North)' },
  { from: 'desert-ledge', to: 'desert-palace-main-outer', entrance: 'Desert Palace Entrance (South)' },
  { from: 'desert-ledge', to: 'light-world', entrance: 'Desert Ledge Drop' },
  { from: 'desert-ledge-northeast', to: 'desert-ledge', entrance: 'Desert Ledge (Northeast) Drop' },
  { from: 'desert-palace-lone-stairs', to: 'desert-palace-main-outer', entrance: 'Desert Palace Entrance (East)' },
  { from: 'desert-palace-lone-stairs', to: 'desert-ledge', entrance: 'Desert Palace Lone Stairs Drop' },
  { from: 'desert-northern-cliffs', to: 'desert-ledge-northeast', entrance: 'Desert Northern Cliffs Drop' },

  // ══════════════════════════════════════════════════
  // Cave 45 / Graveyard / Bombos Ledge
  // ══════════════════════════════════════════════════
  { from: 'bat-cave-drop-ledge', to: 'bat-cave-right', entrance: 'Bat Cave Drop' },
  { from: 'cave-45-ledge', to: 'cave-45', entrance: 'Cave 45' },
  { from: 'cave-45-ledge', to: 'light-world', entrance: 'Cave 45 Ledge Drop' },
  { from: 'graveyard-ledge', to: 'graveyard-cave', entrance: 'Graveyard Cave' },
  { from: 'graveyard-ledge', to: 'light-world', entrance: 'Graveyard Ledge Drop' },
  { from: 'bombos-tablet-ledge', to: 'light-world', entrance: 'Bombos Tablet Ledge Drop' },
  { from: 'maze-race-ledge', to: 'light-world', entrance: 'Maze Race Ledge Drop' },

  // ══════════════════════════════════════════════════
  // Kings Grave / Graveyard Area
  // ══════════════════════════════════════════════════
  { from: 'light-world', to: 'kings-grave-area', entrance: 'Kings Grave Outer Rocks' },
  { from: 'kings-grave-area', to: 'kings-grave', entrance: 'Kings Grave' },
  { from: 'kings-grave-area', to: 'light-world', entrance: 'Kings Grave Exit' },

  // ══════════════════════════════════════════════════
  // Lake Hylia Islands / Special Spots
  // ══════════════════════════════════════════════════
  { from: 'lake-hylia-central-island', to: 'capacity-upgrade', entrance: 'Capacity Upgrade' },
  { from: 'lake-hylia-central-island', to: 'light-world', entrance: 'Lake Hylia Central Island Teleporter' },
  { from: 'lake-hylia-island', to: 'light-world', entrance: 'Lake Hylia Island Drop' },

  // ══════════════════════════════════════════════════
  // Bat Cave / Two Brothers internal
  // ══════════════════════════════════════════════════
  { from: 'bat-cave-right', to: 'bat-cave-left', entrance: 'Bat Cave Door' },
  { from: 'bat-cave-left', to: 'light-world', entrance: 'Bat Cave Exit' },
  { from: 'two-brothers-house', to: 'maze-race-ledge', entrance: 'Two Brothers House Exit (West)' },

  // ══════════════════════════════════════════════════
  // Zora's River
  // ══════════════════════════════════════════════════
  { from: 'zoras-river', to: 'waterfall-of-wishing', entrance: 'Waterfall of Wishing' },

  // ══════════════════════════════════════════════════
  // East Dark World
  // ══════════════════════════════════════════════════
  { from: 'east-dark-world', to: 'pyramid-fairy', entrance: 'Pyramid Fairy' },
  { from: 'east-dark-world', to: 'south-dark-world', entrance: 'South Dark World Bridge' },
  { from: 'east-dark-world', to: 'palace-of-darkness-entrance', entrance: 'Palace of Darkness' },
  { from: 'east-dark-world', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Drop (East)' },
  { from: 'east-dark-world', to: 'hyrule-castle-ledge', entrance: 'Hyrule Castle Ledge Mirror Spot' },
  { from: 'east-dark-world', to: 'dark-lake-hylia-healer-fairy', entrance: 'Dark Lake Hylia Fairy' },
  { from: 'east-dark-world', to: 'palace-of-darkness-hint', entrance: 'Palace of Darkness Hint' },
  { from: 'east-dark-world', to: 'east-dark-world-hint', entrance: 'East Dark World Hint' },
  { from: 'east-dark-world', to: 'northeast-dark-world', entrance: 'Northeast Dark World Hammer Bridge' },
  { from: 'east-dark-world', to: 'west-dark-world', entrance: 'West Dark World Gap' },
  { from: 'east-dark-world', to: 'pyramid', entrance: 'Pyramid' },
  { from: 'east-dark-world', to: 'pyramid-ledge', entrance: 'Pyramid Drop' },

  // ══════════════════════════════════════════════════
  // Northeast Dark World / Catfish
  // ══════════════════════════════════════════════════
  { from: 'northeast-dark-world', to: 'catfish', entrance: 'Catfish Entrance Rock' },
  { from: 'northeast-dark-world', to: 'east-dark-world', entrance: 'Northeast Dark World South' },
  { from: 'catfish', to: 'northeast-dark-world', entrance: 'Catfish Exit' },

  // ══════════════════════════════════════════════════
  // South Dark World
  // ══════════════════════════════════════════════════
  { from: 'south-dark-world', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Drop (South)' },
  { from: 'south-dark-world', to: 'hype-cave', entrance: 'Hype Cave' },
  { from: 'south-dark-world', to: 'swamp-palace-entrance', entrance: 'Swamp Palace' },
  { from: 'south-dark-world', to: 'big-bomb-shop', entrance: 'Big Bomb Shop' },
  { from: 'south-dark-world', to: 'east-dark-world', entrance: 'East Dark World Bridge' },
  { from: 'south-dark-world', to: 'maze-race-ledge', entrance: 'Maze Race Mirror Spot' },
  { from: 'south-dark-world', to: 'cave-45-ledge', entrance: 'Cave 45 Mirror Spot' },
  { from: 'south-dark-world', to: 'bombos-tablet-ledge', entrance: 'Bombos Tablet Mirror Spot' },
  { from: 'south-dark-world', to: 'bonk-fairy-dark', entrance: 'Bonk Fairy (Dark)' },
  { from: 'south-dark-world', to: 'archery-game', entrance: 'Archery Game' },
  { from: 'south-dark-world', to: 'dark-grassy-lawn', entrance: 'Dark Grassy Lawn Pegs' },
  { from: 'south-dark-world', to: 'dark-lake-hylia-shop', entrance: 'Dark Lake Hylia Shop' },

  // ══════════════════════════════════════════════════
  // West Dark World
  // ══════════════════════════════════════════════════
  { from: 'west-dark-world', to: 'east-dark-world', entrance: 'East Dark World River Pier' },
  { from: 'west-dark-world', to: 'brewery', entrance: 'Brewery' },
  { from: 'west-dark-world', to: 'c-shaped-house', entrance: 'C-Shaped House' },
  { from: 'west-dark-world', to: 'chest-game', entrance: 'Chest Game' },
  { from: 'west-dark-world', to: 'thieves-town-entrance', entrance: 'Thieves Town' },
  { from: 'west-dark-world', to: 'graveyard-ledge', entrance: 'Graveyard Ledge Mirror Spot' },
  { from: 'west-dark-world', to: 'kings-grave-area', entrance: 'Kings Grave Mirror Spot' },
  { from: 'west-dark-world', to: 'bumper-cave-entrance', entrance: 'Bumper Cave Entrance Rock' },
  { from: 'west-dark-world', to: 'skull-woods-forest', entrance: 'Skull Woods Forest' },
  { from: 'west-dark-world', to: 'hammer-peg-area', entrance: 'Village of Outcasts Pegs' },
  { from: 'west-dark-world', to: 'south-dark-world', entrance: 'Village of Outcasts Drop' },
  { from: 'west-dark-world', to: 'fortune-teller-dark', entrance: 'Fortune Teller (Dark)' },
  { from: 'west-dark-world', to: 'village-of-outcasts-shop', entrance: 'Village of Outcasts Shop' },
  { from: 'west-dark-world', to: 'red-shield-shop', entrance: 'Red Shield Shop' },
  { from: 'west-dark-world', to: 'dark-sanctuary-hint', entrance: 'Dark Sanctuary Hint' },
  { from: 'west-dark-world', to: 'dark-world-lumberjack-shop', entrance: 'Dark World Lumberjack Shop' },
  { from: 'west-dark-world', to: 'dark-world-potion-shop', entrance: 'Dark World Potion Shop' },

  // ══════════════════════════════════════════════════
  // Dark Grassy Lawn / Hammer Peg Area
  // ══════════════════════════════════════════════════
  { from: 'dark-grassy-lawn', to: 'south-dark-world', entrance: 'Dark Grassy Lawn Drop' },
  { from: 'hammer-peg-area', to: 'dark-world-hammer-peg-cave', entrance: 'Dark World Hammer Peg Cave' },
  { from: 'hammer-peg-area', to: 'west-dark-world', entrance: 'Hammer Peg Area Drop' },

  // ══════════════════════════════════════════════════
  // Bumper Cave
  // ══════════════════════════════════════════════════
  { from: 'bumper-cave-entrance', to: 'bumper-cave', entrance: 'Bumper Cave (Bottom)' },
  { from: 'bumper-cave-entrance', to: 'west-dark-world', entrance: 'Bumper Cave Entrance Drop' },
  { from: 'bumper-cave-ledge', to: 'bumper-cave', entrance: 'Bumper Cave (Top)' },
  { from: 'bumper-cave-ledge', to: 'bumper-cave-entrance', entrance: 'Bumper Cave Ledge Drop' },
  { from: 'bumper-cave-ledge', to: 'death-mountain-return-ledge', entrance: 'Bumper Cave Ledge Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Skull Woods Forest
  // ══════════════════════════════════════════════════
  { from: 'skull-woods-forest', to: 'skull-woods-forest-west', entrance: 'Skull Woods Forest (West)' },
  { from: 'skull-woods-forest', to: 'skull-woods-first-section', entrance: 'Skull Woods First Section Door' },
  { from: 'skull-woods-forest', to: 'skull-woods-second-section-drop', entrance: 'Skull Woods Second Section Door (East)' },
  { from: 'skull-woods-forest', to: 'skull-woods-second-section-drop', entrance: 'Skull Woods Second Section Door (West)' },
  { from: 'skull-woods-forest-west', to: 'skull-woods-final-section-entrance', entrance: 'Skull Woods Final Section' },
  { from: 'skull-woods-forest', to: 'master-sword-meadow', entrance: 'Skull Woods Forest Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Dark Desert
  // ══════════════════════════════════════════════════
  { from: 'dark-desert', to: 'misery-mire-entrance', entrance: 'Misery Mire' },
  { from: 'dark-desert', to: 'mire-shed', entrance: 'Mire Shed' },
  { from: 'dark-desert', to: 'dark-desert-hint', entrance: 'Dark Desert Hint' },
  { from: 'dark-desert', to: 'dark-desert-healer-fairy', entrance: 'Dark Desert Fairy' },
  { from: 'dark-desert', to: 'desert-ledge', entrance: 'Dark Desert Mirror Spot' },
  { from: 'dark-desert', to: 'desert-northern-cliffs', entrance: 'Dark Desert North Mirror Spot' },
  { from: 'dark-desert', to: 'desert-palace-lone-stairs', entrance: 'Dark Desert Lone Stairs Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Dark Lake Hylia
  // ══════════════════════════════════════════════════
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-central-island', entrance: 'Dark Lake Hylia Teleporter' },
  { from: 'dark-lake-hylia', to: 'lake-hylia-island', entrance: 'Dark Lake Hylia Mirror Spot' },
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-ledge', entrance: 'Dark Lake Hylia Ledge Pier' },
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-shop', entrance: 'Dark Lake Hylia Shop' },

  { from: 'dark-lake-hylia-central-island', to: 'lake-hylia-central-island', entrance: 'Dark Lake Hylia Central Island Mirror Spot' },
  { from: 'dark-lake-hylia-central-island', to: 'ice-palace-entrance', entrance: 'Ice Palace' },

  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Ledge Drop' },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-hint', entrance: 'Dark Lake Hylia Ledge Hint' },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-spike-cave', entrance: 'Dark Lake Hylia Ledge Spike Cave' },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-healer-fairy', entrance: 'Dark Lake Hylia Ledge Fairy' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain — West
  // ══════════════════════════════════════════════════
  { from: 'dark-death-mountain-west-bottom', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Climb (West)' },
  { from: 'dark-death-mountain-west-bottom', to: 'death-mountain-entrance', entrance: 'Dark Death Mountain (West Bottom) Mirror Spot' },
  { from: 'dark-death-mountain-west-bottom', to: 'spike-cave', entrance: 'Spike Cave' },
  { from: 'dark-death-mountain-west-bottom', to: 'dark-death-mountain-healer-fairy', entrance: 'Dark Death Mountain Fairy' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain — Top
  // ══════════════════════════════════════════════════
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-west-bottom', entrance: 'Dark Death Mountain Drop (West)' },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-east-bottom', entrance: 'Dark Death Mountain Drop (East)' },
  { from: 'dark-death-mountain-top', to: 'ganons-tower-entrance', entrance: 'Ganons Tower' },
  { from: 'dark-death-mountain-top', to: 'superbunny-cave-top', entrance: 'Superbunny Cave (Top)' },
  { from: 'dark-death-mountain-top', to: 'hookshot-cave', entrance: 'Hookshot Cave' },
  { from: 'dark-death-mountain-top', to: 'east-death-mountain-top', entrance: 'East Death Mountain (Top) Mirror Spot' },
  { from: 'dark-death-mountain-top', to: 'turtle-rock-top', entrance: 'Turtle Rock' },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-ledge', entrance: 'Dark Death Mountain Ledge' },
  { from: 'dark-death-mountain-top', to: 'cave-shop-dark-death-mountain', entrance: 'Cave Shop (Dark Death Mountain)' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain — East
  // ══════════════════════════════════════════════════
  { from: 'dark-death-mountain-east-bottom', to: 'east-death-mountain-bottom', entrance: 'Dark Death Mountain (East Bottom) Mirror Spot' },
  { from: 'dark-death-mountain-east-bottom', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Climb (East)' },
  { from: 'dark-death-mountain-east-bottom', to: 'superbunny-cave-bottom', entrance: 'Superbunny Cave (Bottom)' },

  { from: 'dark-death-mountain-ledge', to: 'dark-death-mountain-west-bottom', entrance: 'Dark Death Mountain Ledge Drop (West)' },
  { from: 'dark-death-mountain-ledge', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Ledge Drop (Top)' },
  { from: 'dark-death-mountain-ledge', to: 'death-mountain-top', entrance: 'Dark Death Mountain Ledge Mirror Spot' },

  { from: 'dark-death-mountain-isolated-ledge', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Isolated Ledge Drop' },
  { from: 'dark-death-mountain-isolated-ledge', to: 'fairy-ascension-ledge', entrance: 'Dark Death Mountain Isolated Ledge Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain Floating Island
  // ══════════════════════════════════════════════════
  { from: 'death-mountain-floating-island-dw', to: 'death-mountain-floating-island-lw', entrance: 'Death Mountain Floating Island Mirror Spot' },
  { from: 'death-mountain-floating-island-dw', to: 'dark-death-mountain-top', entrance: 'Death Mountain Floating Island Drop' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain Bunny Descent
  // ══════════════════════════════════════════════════
  { from: 'dark-death-mountain-bunny-descent', to: 'dark-death-mountain-east-bottom', entrance: 'Dark Death Mountain Bunny Descent' },

  // ══════════════════════════════════════════════════
  // Turtle Rock (Top)
  // ══════════════════════════════════════════════════
  { from: 'turtle-rock-top', to: 'turtle-rock-entrance', entrance: 'Turtle Rock' },

  // ══════════════════════════════════════════════════
  // Pyramid / Bottom of Pyramid
  // ══════════════════════════════════════════════════
  { from: 'pyramid', to: 'bottom-of-pyramid', entrance: 'Pyramid Exit' },
  { from: 'pyramid-ledge', to: 'east-dark-world', entrance: 'Pyramid Ledge Drop' },
  { from: 'pyramid-ledge', to: 'pyramid', entrance: 'Pyramid Entrance' },
  { from: 'bottom-of-pyramid', to: 'east-dark-world', entrance: 'Bottom of Pyramid Exit' },

  // ══════════════════════════════════════════════════
  // Dungeon Entrance Connections (from overworld)
  // ══════════════════════════════════════════════════
  // (All dungeon entrance connections are listed inline above in their
  // respective overworld sections — no duplicates here.)

  // Agahnim's Tower (from Courtyard)
  // (already listed above)

  // Desert Palace entries (from Desert Ledge, Lone Stairs, North Spot)
  // (already listed above)

  // Swamp Palace (from South Dark World)
  // (already listed above)

  // Palace of Darkness (from East Dark World)
  // (already listed above)

  // Thieves Town (from West Dark World)
  // (already listed above)

  // Ice Palace (from Dark Lake Hylia Central Island)
  // (already listed above)

  // Misery Mire (from Dark Desert)
  // (already listed above)

  // Ganon's Tower (from Dark Death Mountain Top)
  // (already listed above)

  // Turtle Rock (from Dark Death Mountain Top / Turtle Rock Top)
  // (already listed above)

  // Skull Woods (from Skull Woods Forest)
  // (already listed above)

  // ══════════════════════════════════════════════════
  // Mirror Spot Connections (Light ↔ Dark transitions)
  // ══════════════════════════════════════════════════
  { from: 'east-dark-world', to: 'light-world', entrance: 'East Dark World Mirror Spot' },
  { from: 'south-dark-world', to: 'light-world', entrance: 'South Dark World Mirror Spot' },
  { from: 'west-dark-world', to: 'light-world', entrance: 'West Dark World Mirror Spot' },
  { from: 'dark-lake-hylia', to: 'light-world', entrance: 'Dark Lake Hylia Mirror Spot' },
  { from: 'northeast-dark-world', to: 'light-world', entrance: 'Northeast Dark World Mirror Spot' },
  { from: 'skull-woods-forest', to: 'light-world', entrance: 'Skull Woods Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Hobo Bridge
  // ══════════════════════════════════════════════════
  { from: 'hobo-bridge', to: 'light-world', entrance: 'Hobo Bridge Exit' },

  // ══════════════════════════════════════════════════
  // Checkerboard Cave
  // ══════════════════════════════════════════════════
  { from: 'desert-northern-cliffs', to: 'checkerboard-cave', entrance: 'Checkerboard Cave' },

  // ══════════════════════════════════════════════════
  // Chris Houlihan Room
  // ══════════════════════════════════════════════════
  { from: 'chris-houlihan-room', to: 'light-world', entrance: 'Chris Houlihan Room Exit' },

  // ══════════════════════════════════════════════════
  // Lost Woods Hideout / Lumberjack internal
  // ══════════════════════════════════════════════════
  { from: 'lost-woods-hideout-top', to: 'lost-woods-hideout-bottom', entrance: 'Lost Woods Hideout Drop' },
  { from: 'lost-woods-hideout-bottom', to: 'light-world', entrance: 'Lost Woods Hideout Exit' },
  { from: 'lumberjack-tree-top', to: 'lumberjack-tree-bottom', entrance: 'Lumberjack Tree Drop' },
  { from: 'lumberjack-tree-bottom', to: 'light-world', entrance: 'Lumberjack Tree Exit' },

  // ══════════════════════════════════════════════════
  // Kakariko Well internal
  // ══════════════════════════════════════════════════
  { from: 'kakariko-well-top', to: 'kakariko-well-bottom', entrance: 'Kakariko Well Drop' },
  { from: 'kakariko-well-bottom', to: 'light-world', entrance: 'Kakariko Well Exit' },

  // ══════════════════════════════════════════════════
  // Spectacle Rock Cave internal
  // ══════════════════════════════════════════════════
  { from: 'spectacle-rock-cave-bottom', to: 'spectacle-rock-cave-top', entrance: 'Spectacle Rock Cave Ascent' },
  { from: 'spectacle-rock-cave-top', to: 'death-mountain-top', entrance: 'Spectacle Rock Cave Exit (Top)' },
  { from: 'spectacle-rock-cave-peak', to: 'spectacle-rock', entrance: 'Spectacle Rock Cave Exit (Peak)' },

  // ══════════════════════════════════════════════════
  // Hookshot Cave internal
  // ══════════════════════════════════════════════════
  // (already listed above in DM caves)

  // ══════════════════════════════════════════════════
  // Village of Outcasts Heavy Rock
  // ══════════════════════════════════════════════════
  { from: 'south-dark-world', to: 'west-dark-world', entrance: 'Village of Outcasts Heavy Rock' },
];
