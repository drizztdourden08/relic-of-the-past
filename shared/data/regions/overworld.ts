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
  { id: 'pyramid-ledge-lw', name: 'Pyramid Ledge', type: 'lightWorld' },
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
  { from: 'Menu', to: 'Light World', entrance: 'Links House S&Q' },
  { from: 'Menu', to: 'Sanctuary', entrance: 'Sanctuary S&Q' },
  { from: 'Menu', to: 'Old Man Cave', entrance: 'Old Man S&Q' },

  // ══════════════════════════════════════════════════
  // Light World — Main Overworld Exits
  // ══════════════════════════════════════════════════

  // --- Kakariko / West Light World ---
  { from: 'Light World', to: 'Blinds Hideout', entrance: 'Blinds Hideout' },
  { from: 'Light World', to: 'Elder House', entrance: 'Elder House (East)' },
  { from: 'Light World', to: 'Elder House', entrance: 'Elder House (West)' },
  { from: 'Light World', to: 'Snitch Lady (East)', entrance: 'Snitch Lady (East)' },
  { from: 'Light World', to: 'Snitch Lady (West)', entrance: 'Snitch Lady (West)' },
  { from: 'Light World', to: 'Bush Covered House', entrance: 'Bush Covered House' },
  { from: 'Light World', to: 'Tavern (Front)', entrance: 'Tavern (Front)' },
  { from: 'Light World', to: 'Light World Bomb Hut', entrance: 'Light World Bomb Hut' },
  { from: 'Light World', to: 'Kakariko Shop', entrance: 'Kakariko Shop' },
  { from: 'Light World', to: 'Tavern', entrance: 'Tavern North' },
  { from: 'Light World', to: 'Chicken House', entrance: 'Chicken House' },
  { from: 'Light World', to: 'Sick Kids House', entrance: 'Sick Kids House' },
  { from: 'Light World', to: 'Blacksmiths Hut', entrance: 'Blacksmiths Hut' },
  { from: 'Light World', to: 'Kakariko Well (top)', entrance: 'Kakariko Well Drop' },
  { from: 'Light World', to: 'Kakariko Well (bottom)', entrance: 'Kakariko Well Cave' },
  { from: 'Light World', to: 'Library', entrance: 'Library' },
  { from: 'Light World', to: 'Kakariko Gamble Game', entrance: 'Kakariko Gamble Game' },

  // --- Central Light World ---
  { from: 'Light World', to: 'Links House', entrance: 'Links House' },
  { from: 'Light World', to: 'Hyrule Castle Secret Entrance', entrance: 'Hyrule Castle Secret Entrance Drop' },
  { from: 'Light World', to: 'Hyrule Castle Courtyard', entrance: 'Hyrule Castle Main Gate' },
  { from: 'Light World', to: 'Sanctuary', entrance: 'Sanctuary' },
  { from: 'Light World', to: 'Kings Grave Area', entrance: 'Sanctuary Grave' },
  { from: 'Light World', to: 'Dam', entrance: 'Dam' },
  { from: 'Light World', to: 'Sahasrahlas Hut', entrance: 'Sahasrahlas Hut' },
  { from: 'Light World', to: 'Aginahs Cave', entrance: 'Aginahs Cave' },
  { from: 'Light World', to: 'Bat Cave Drop Ledge', entrance: 'Bat Cave Drop Ledge' },
  { from: 'Light World', to: 'Bat Cave (right)', entrance: 'Bat Cave Cave' },
  { from: 'Light World', to: 'Bonk Rock Cave', entrance: 'Bonk Rock Cave' },
  { from: 'Light World', to: 'Potion Shop', entrance: 'Potion Shop' },
  { from: 'Light World', to: 'Two Brothers House', entrance: 'Two Brothers House (East)' },
  { from: 'Light World', to: 'Fortune Teller (Light)', entrance: 'Fortune Teller (Light)' },
  { from: 'Light World', to: 'Lumberjack House', entrance: 'Lumberjack House' },
  { from: 'Light World', to: 'Lake Hylia Fortune Teller', entrance: 'Lake Hylia Fortune Teller' },
  { from: 'Light World', to: 'North Fairy Cave', entrance: 'North Fairy Cave Drop' },

  // --- Lost Woods ---
  { from: 'Light World', to: 'Lost Woods Hideout (top)', entrance: 'Lost Woods Hideout Drop' },
  { from: 'Light World', to: 'Lost Woods Hideout (bottom)', entrance: 'Lost Woods Hideout Stump' },
  { from: 'Light World', to: 'Lumberjack Tree (top)', entrance: 'Lumberjack Tree Tree' },
  { from: 'Light World', to: 'Lumberjack Tree (bottom)', entrance: 'Lumberjack Tree Cave' },
  { from: 'Light World', to: 'Master Sword Meadow', entrance: 'Master Sword Meadow' },
  { from: 'Light World', to: 'Lost Woods Gamble', entrance: 'Lost Woods Gamble' },

  // --- Lake Hylia / South ---
  { from: 'Light World', to: 'Lake Hylia Central Island', entrance: 'Lake Hylia Central Island Pier' },
  { from: 'Light World', to: 'Mini Moldorm Cave', entrance: 'Mini Moldorm Cave' },
  { from: 'Light World', to: 'Ice Rod Cave', entrance: 'Ice Rod Cave' },
  { from: 'Light World', to: 'Good Bee Cave', entrance: 'Good Bee Cave' },
  { from: 'Light World', to: '20 Rupee Cave', entrance: '20 Rupee Cave' },
  { from: 'Light World', to: 'Cave Shop (Lake Hylia)', entrance: 'Cave Shop (Lake Hylia)' },
  { from: 'Light World', to: 'Long Fairy Cave', entrance: 'Long Fairy Cave' },
  { from: 'Light World', to: '50 Rupee Cave', entrance: '50 Rupee Cave' },
  { from: 'Light World', to: 'Bonk Fairy (Light)', entrance: 'Bonk Fairy (Light)' },
  { from: 'Light World', to: 'Hobo Bridge', entrance: 'Hobo Bridge' },
  { from: 'Light World', to: 'Waterfall of Wishing', entrance: 'Waterfall of Wishing' },
  { from: 'Light World', to: 'Lake Hylia Healer Fairy', entrance: 'Lake Hylia Fairy' },
  { from: 'Light World', to: 'Swamp Healer Fairy', entrance: 'Light Hype Fairy' },
  { from: 'Light World', to: 'Desert Healer Fairy', entrance: 'Desert Fairy' },

  // --- Desert ---
  { from: 'Light World', to: 'Desert Palace Stairs', entrance: 'Desert Palace Stairs' },

  // --- Flute / Teleporter exits ---
  { from: 'Light World', to: 'Death Mountain Entrance', entrance: 'Flute Spot 1' },
  { from: 'Light World', to: 'Dark Desert', entrance: 'Dark Desert Teleporter' },
  { from: 'Light World', to: 'East Dark World', entrance: 'East Hyrule Teleporter' },
  { from: 'Light World', to: 'South Dark World', entrance: 'South Hyrule Teleporter' },
  { from: 'Light World', to: 'West Dark World', entrance: 'Kakariko Teleporter' },

  // --- Death Mountain entrance ---
  { from: 'Light World', to: 'Death Mountain Entrance', entrance: 'Death Mountain Entrance Rock' },

  // --- Dungeon entrances from Light World ---
  { from: 'Light World', to: 'Eastern Palace', entrance: 'Eastern Palace' },

  // --- Zora's River ---
  { from: 'Light World', to: 'Zoras River', entrance: 'Zoras River' },

  // --- Pyramid top ---
  { from: 'Light World', to: 'Pyramid Ledge', entrance: 'Top of Pyramid' },

  // ══════════════════════════════════════════════════
  // Hyrule Castle Courtyard
  // ══════════════════════════════════════════════════
  { from: 'Hyrule Castle Courtyard', to: 'Hyrule Castle', entrance: 'Hyrule Castle Entrance (South)' },
  { from: 'Hyrule Castle Courtyard', to: 'Hyrule Castle', entrance: 'Hyrule Castle Entrance (East)' },
  { from: 'Hyrule Castle Courtyard', to: 'Hyrule Castle', entrance: 'Hyrule Castle Entrance (West)' },
  { from: 'Hyrule Castle Courtyard', to: 'Agahnims Tower', entrance: 'Agahnims Tower' },
  { from: 'Hyrule Castle Courtyard', to: 'Hyrule Castle Secret Entrance', entrance: 'Hyrule Castle Secret Entrance Stairs' },

  // ══════════════════════════════════════════════════
  // Hyrule Castle Ledge
  // ══════════════════════════════════════════════════
  { from: 'Hyrule Castle Ledge', to: 'Hyrule Castle Courtyard', entrance: 'Hyrule Castle Ledge Courtyard Drop' },
  { from: 'Hyrule Castle Ledge', to: 'Light World', entrance: 'Hyrule Castle Ledge Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Death Mountain — West Side
  // ══════════════════════════════════════════════════
  { from: 'Death Mountain Entrance', to: 'Old Man Cave', entrance: 'Old Man Cave (West)' },
  { from: 'Death Mountain Entrance', to: 'Death Mountain', entrance: 'Death Mountain Entrance Drop' },

  { from: 'Death Mountain', to: 'Old Man Cave', entrance: 'Old Man Cave (East)' },
  { from: 'Death Mountain', to: 'Old Man House', entrance: 'Old Man House (Bottom)' },
  { from: 'Death Mountain', to: 'Death Mountain Return Ledge', entrance: 'Death Mountain Return Ledge Drop' },
  { from: 'Death Mountain', to: 'Spectacle Rock Cave (Bottom)', entrance: 'Spectacle Rock Cave' },
  { from: 'Death Mountain', to: 'Spectacle Rock Cave (Top)', entrance: 'Spectacle Rock Cave (Top)' },
  { from: 'Death Mountain', to: 'Death Mountain (Top)', entrance: 'Death Mountain Climb' },
  { from: 'Death Mountain', to: 'Light World Death Mountain Shop', entrance: 'Light World Death Mountain Shop' },

  { from: 'Death Mountain Return Ledge', to: 'Death Mountain Return Cave', entrance: 'Death Mountain Return Cave (East)' },
  { from: 'Death Mountain Return Ledge', to: 'Death Mountain', entrance: 'Death Mountain Return Ledge Drop' },

  { from: 'Death Mountain (Top)', to: 'Spectacle Rock', entrance: 'Spectacle Rock Drop' },
  { from: 'Death Mountain (Top)', to: 'Death Mountain', entrance: 'Death Mountain Drop' },
  { from: 'Death Mountain (Top)', to: 'East Death Mountain (Top)', entrance: 'Death Mountain (Top) to East' },
  { from: 'Death Mountain (Top)', to: 'Tower of Hera', entrance: 'Tower of Hera' },
  { from: 'Death Mountain (Top)', to: 'Spectacle Rock Cave (Peak)', entrance: 'Spectacle Rock Cave Peak' },
  { from: 'Death Mountain (Top)', to: 'Dark Death Mountain (Top)', entrance: 'Death Mountain (Top) Teleporter' },

  { from: 'Spectacle Rock', to: 'Death Mountain (Top)', entrance: 'Spectacle Rock Drop' },

  // ══════════════════════════════════════════════════
  // Death Mountain — East Side
  // ══════════════════════════════════════════════════
  { from: 'East Death Mountain (Bottom)', to: 'Spiral Cave (Bottom)', entrance: 'Spiral Cave' },
  { from: 'East Death Mountain (Bottom)', to: 'Fairy Ascension Plateau', entrance: 'Fairy Ascension Plateau' },
  { from: 'East Death Mountain (Bottom)', to: 'East Death Mountain (Top)', entrance: 'East Death Mountain Climb' },
  { from: 'East Death Mountain (Bottom)', to: 'Paradox Cave Front', entrance: 'Paradox Cave (Bottom)' },
  { from: 'East Death Mountain (Bottom)', to: 'Hookshot Fairy', entrance: 'Hookshot Fairy' },

  { from: 'East Death Mountain (Top)', to: 'Paradox Cave', entrance: 'Paradox Cave (Top)' },
  { from: 'East Death Mountain (Top)', to: 'Spiral Cave Ledge', entrance: 'Spiral Cave Ledge Drop' },
  { from: 'East Death Mountain (Top)', to: 'Mimic Cave Ledge', entrance: 'Mimic Cave Mirror Spot' },
  { from: 'East Death Mountain (Top)', to: 'East Death Mountain (Bottom)', entrance: 'East Death Mountain Drop' },
  { from: 'East Death Mountain (Top)', to: 'Superbunny Cave (Top)', entrance: 'Superbunny Cave (Top)' },
  { from: 'East Death Mountain (Top)', to: 'Dark Death Mountain (East Bottom)', entrance: 'East Death Mountain Teleporter' },

  { from: 'Spiral Cave Ledge', to: 'Spiral Cave (Top)', entrance: 'Spiral Cave (Top)' },
  { from: 'Spiral Cave Ledge', to: 'East Death Mountain (Bottom)', entrance: 'Spiral Cave Ledge Drop' },

  { from: 'Fairy Ascension Plateau', to: 'Fairy Ascension Cave (Bottom)', entrance: 'Fairy Ascension Cave (Bottom)' },
  { from: 'Fairy Ascension Plateau', to: 'East Death Mountain (Bottom)', entrance: 'Fairy Ascension Plateau Drop' },

  { from: 'Fairy Ascension Ledge', to: 'Fairy Ascension Cave (Top)', entrance: 'Fairy Ascension Cave (Top)' },
  { from: 'Fairy Ascension Ledge', to: 'Fairy Ascension Plateau', entrance: 'Fairy Ascension Ledge Drop' },

  { from: 'Mimic Cave Ledge', to: 'Mimic Cave', entrance: 'Mimic Cave' },

  // ══════════════════════════════════════════════════
  // Death Mountain Floating Island
  // ══════════════════════════════════════════════════
  { from: 'Death Mountain Floating Island (Light World)', to: 'East Death Mountain (Top)', entrance: 'Death Mountain Floating Island Drop' },

  // ══════════════════════════════════════════════════
  // Death Mountain Cave Connections (internal)
  // ══════════════════════════════════════════════════
  { from: 'Old Man Cave', to: 'Death Mountain', entrance: 'Old Man Cave Exit (East)' },
  { from: 'Old Man Cave', to: 'Death Mountain Entrance', entrance: 'Old Man Cave Exit (West)' },
  { from: 'Old Man House', to: 'Old Man House Back', entrance: 'Old Man House Front to Back' },
  { from: 'Old Man House Back', to: 'Death Mountain Return Ledge', entrance: 'Old Man House Back to Ledge' },
  { from: 'Death Mountain Return Cave', to: 'Light World', entrance: 'Death Mountain Return Cave Exit (West)' },

  { from: 'Paradox Cave Front', to: 'Paradox Cave Chest Area', entrance: 'Paradox Cave Push Block' },
  { from: 'Paradox Cave Chest Area', to: 'Paradox Cave Front', entrance: 'Paradox Cave Push Block Reverse' },
  { from: 'Paradox Cave', to: 'East Death Mountain (Top)', entrance: 'Paradox Cave Exit (Top)' },
  { from: 'Paradox Cave', to: 'Paradox Cave Chest Area', entrance: 'Paradox Cave Inner' },

  { from: 'Spiral Cave (Top)', to: 'Spiral Cave (Bottom)', entrance: 'Spiral Cave' },
  { from: 'Spiral Cave (Bottom)', to: 'East Death Mountain (Bottom)', entrance: 'Spiral Cave Exit' },

  { from: 'Fairy Ascension Cave (Bottom)', to: 'Fairy Ascension Cave (Drop)', entrance: 'Fairy Ascension Cave Climb' },
  { from: 'Fairy Ascension Cave (Top)', to: 'Fairy Ascension Cave (Drop)', entrance: 'Fairy Ascension Cave Drop' },

  { from: 'Superbunny Cave (Top)', to: 'Superbunny Cave (Bottom)', entrance: 'Superbunny Cave Descent' },
  { from: 'Superbunny Cave (Bottom)', to: 'East Death Mountain (Bottom)', entrance: 'Superbunny Cave Exit (Bottom)' },

  { from: 'Hookshot Cave', to: 'Hookshot Cave (Upper)', entrance: 'Hookshot Cave Bonk Path' },
  { from: 'Hookshot Cave (Upper)', to: 'Hookshot Cave', entrance: 'Hookshot Cave Hook Path' },
  { from: 'Hookshot Cave (Upper)', to: 'Death Mountain Floating Island (Dark World)', entrance: 'Hookshot Cave Back Exit' },

  // ══════════════════════════════════════════════════
  // Desert connections
  // ══════════════════════════════════════════════════
  { from: 'Desert Palace Stairs', to: 'Desert Palace Entrance (North) Spot', entrance: 'Desert Palace Stairs Ascent' },
  { from: 'Desert Palace Stairs', to: 'Light World', entrance: 'Desert Palace Stairs Drop' },
  { from: 'Desert Palace Entrance (North) Spot', to: 'Desert Palace', entrance: 'Desert Palace Entrance (North)' },
  { from: 'Desert Ledge', to: 'Desert Palace', entrance: 'Desert Palace Entrance (South)' },
  { from: 'Desert Ledge', to: 'Light World', entrance: 'Desert Ledge Drop' },
  { from: 'Desert Ledge (Northeast)', to: 'Desert Ledge', entrance: 'Desert Ledge (Northeast) Drop' },
  { from: 'Desert Palace Lone Stairs', to: 'Desert Palace', entrance: 'Desert Palace Entrance (East)' },
  { from: 'Desert Palace Lone Stairs', to: 'Desert Ledge', entrance: 'Desert Palace Lone Stairs Drop' },
  { from: 'Desert Northern Cliffs', to: 'Desert Ledge (Northeast)', entrance: 'Desert Northern Cliffs Drop' },

  // ══════════════════════════════════════════════════
  // Cave 45 / Graveyard / Bombos Ledge
  // ══════════════════════════════════════════════════
  { from: 'Bat Cave Drop Ledge', to: 'Bat Cave (right)', entrance: 'Bat Cave Drop' },
  { from: 'Cave 45 Ledge', to: 'Cave 45', entrance: 'Cave 45' },
  { from: 'Cave 45 Ledge', to: 'Light World', entrance: 'Cave 45 Ledge Drop' },
  { from: 'Graveyard Ledge', to: 'Graveyard Cave', entrance: 'Graveyard Cave' },
  { from: 'Graveyard Ledge', to: 'Light World', entrance: 'Graveyard Ledge Drop' },
  { from: 'Bombos Tablet Ledge', to: 'Light World', entrance: 'Bombos Tablet Ledge Drop' },
  { from: 'Maze Race Ledge', to: 'Light World', entrance: 'Maze Race Ledge Drop' },

  // ══════════════════════════════════════════════════
  // Kings Grave / Graveyard Area
  // ══════════════════════════════════════════════════
  { from: 'Light World', to: 'Kings Grave Area', entrance: 'Kings Grave Outer Rocks' },
  { from: 'Kings Grave Area', to: 'Kings Grave', entrance: 'Kings Grave' },
  { from: 'Kings Grave Area', to: 'Light World', entrance: 'Kings Grave Exit' },

  // ══════════════════════════════════════════════════
  // Lake Hylia Islands / Special Spots
  // ══════════════════════════════════════════════════
  { from: 'Lake Hylia Central Island', to: 'Capacity Upgrade', entrance: 'Capacity Upgrade' },
  { from: 'Lake Hylia Central Island', to: 'Light World', entrance: 'Lake Hylia Central Island Teleporter' },
  { from: 'Lake Hylia Island', to: 'Light World', entrance: 'Lake Hylia Island Drop' },

  // ══════════════════════════════════════════════════
  // Bat Cave / Two Brothers internal
  // ══════════════════════════════════════════════════
  { from: 'Bat Cave (right)', to: 'Bat Cave (left)', entrance: 'Bat Cave Door' },
  { from: 'Bat Cave (left)', to: 'Light World', entrance: 'Bat Cave Exit' },
  { from: 'Two Brothers House', to: 'Maze Race Ledge', entrance: 'Two Brothers House (West)' },

  // ══════════════════════════════════════════════════
  // Zora's River
  // ══════════════════════════════════════════════════
  { from: 'Zoras River', to: 'Waterfall of Wishing', entrance: 'Waterfall of Wishing' },

  // ══════════════════════════════════════════════════
  // East Dark World
  // ══════════════════════════════════════════════════
  { from: 'East Dark World', to: 'Pyramid Fairy', entrance: 'Pyramid Fairy' },
  { from: 'East Dark World', to: 'South Dark World', entrance: 'South Dark World Bridge' },
  { from: 'East Dark World', to: 'Palace of Darkness', entrance: 'Palace of Darkness' },
  { from: 'East Dark World', to: 'Dark Lake Hylia', entrance: 'Dark Lake Hylia Drop (East)' },
  { from: 'East Dark World', to: 'Hyrule Castle Ledge', entrance: 'Hyrule Castle Ledge Mirror Spot' },
  { from: 'East Dark World', to: 'Dark Lake Hylia Healer Fairy', entrance: 'Dark Lake Hylia Fairy' },
  { from: 'East Dark World', to: 'Palace of Darkness Hint', entrance: 'Palace of Darkness Hint' },
  { from: 'East Dark World', to: 'East Dark World Hint', entrance: 'East Dark World Hint' },
  { from: 'East Dark World', to: 'Northeast Dark World', entrance: 'Northeast Dark World Hammer Bridge' },
  { from: 'East Dark World', to: 'West Dark World', entrance: 'West Dark World Gap' },
  { from: 'East Dark World', to: 'Pyramid', entrance: 'Pyramid' },
  { from: 'East Dark World', to: 'Pyramid Ledge', entrance: 'Pyramid Drop' },

  // ══════════════════════════════════════════════════
  // Northeast Dark World / Catfish
  // ══════════════════════════════════════════════════
  { from: 'Northeast Dark World', to: 'Catfish', entrance: 'Catfish' },
  { from: 'Northeast Dark World', to: 'East Dark World', entrance: 'Northeast Dark World South' },
  { from: 'Catfish', to: 'Northeast Dark World', entrance: 'Catfish Exit' },

  // ══════════════════════════════════════════════════
  // South Dark World
  // ══════════════════════════════════════════════════
  { from: 'South Dark World', to: 'Dark Lake Hylia', entrance: 'Dark Lake Hylia Drop (South)' },
  { from: 'South Dark World', to: 'Hype Cave', entrance: 'Hype Cave' },
  { from: 'South Dark World', to: 'Swamp Palace', entrance: 'Swamp Palace' },
  { from: 'South Dark World', to: 'Big Bomb Shop', entrance: 'Big Bomb Shop' },
  { from: 'South Dark World', to: 'East Dark World', entrance: 'East Dark World Bridge' },
  { from: 'South Dark World', to: 'Maze Race Ledge', entrance: 'Maze Race Mirror Spot' },
  { from: 'South Dark World', to: 'Cave 45 Ledge', entrance: 'Cave 45 Mirror Spot' },
  { from: 'South Dark World', to: 'Bombos Tablet Ledge', entrance: 'Bombos Tablet Mirror Spot' },
  { from: 'South Dark World', to: 'Bonk Fairy (Dark)', entrance: 'Bonk Fairy (Dark)' },
  { from: 'South Dark World', to: 'Archery Game', entrance: 'Archery Game' },
  { from: 'South Dark World', to: 'Dark Grassy Lawn', entrance: 'Dark Grassy Lawn Pegs' },
  { from: 'South Dark World', to: 'Dark Lake Hylia Shop', entrance: 'Dark Lake Hylia Shop' },

  // ══════════════════════════════════════════════════
  // West Dark World
  // ══════════════════════════════════════════════════
  { from: 'West Dark World', to: 'East Dark World', entrance: 'East Dark World River Pier' },
  { from: 'West Dark World', to: 'Brewery', entrance: 'Brewery' },
  { from: 'West Dark World', to: 'C-Shaped House', entrance: 'C-Shaped House' },
  { from: 'West Dark World', to: 'Chest Game', entrance: 'Chest Game' },
  { from: 'West Dark World', to: 'Thieves Town', entrance: 'Thieves Town' },
  { from: 'West Dark World', to: 'Graveyard Ledge', entrance: 'Graveyard Ledge Mirror Spot' },
  { from: 'West Dark World', to: 'Kings Grave Area', entrance: 'Kings Grave Mirror Spot' },
  { from: 'West Dark World', to: 'Bumper Cave Entrance', entrance: 'Bumper Cave Entrance Rock' },
  { from: 'West Dark World', to: 'Skull Woods Forest', entrance: 'Skull Woods Forest' },
  { from: 'West Dark World', to: 'Hammer Peg Area', entrance: 'Village of Outcasts Pegs' },
  { from: 'West Dark World', to: 'South Dark World', entrance: 'Village of Outcasts Drop' },
  { from: 'West Dark World', to: 'Fortune Teller (Dark)', entrance: 'Fortune Teller (Dark)' },
  { from: 'West Dark World', to: 'Village of Outcasts Shop', entrance: 'Village of Outcasts Shop' },
  { from: 'West Dark World', to: 'Red Shield Shop', entrance: 'Red Shield Shop' },
  { from: 'West Dark World', to: 'Dark Sanctuary Hint', entrance: 'Dark Sanctuary Hint' },
  { from: 'West Dark World', to: 'Dark World Lumberjack Shop', entrance: 'Dark World Lumberjack Shop' },
  { from: 'West Dark World', to: 'Dark World Potion Shop', entrance: 'Dark World Potion Shop' },

  // ══════════════════════════════════════════════════
  // Dark Grassy Lawn / Hammer Peg Area
  // ══════════════════════════════════════════════════
  { from: 'Dark Grassy Lawn', to: 'South Dark World', entrance: 'Dark Grassy Lawn Drop' },
  { from: 'Hammer Peg Area', to: 'Dark World Hammer Peg Cave', entrance: 'Dark World Hammer Peg Cave' },
  { from: 'Hammer Peg Area', to: 'West Dark World', entrance: 'Hammer Peg Area Drop' },

  // ══════════════════════════════════════════════════
  // Bumper Cave
  // ══════════════════════════════════════════════════
  { from: 'Bumper Cave Entrance', to: 'Bumper Cave', entrance: 'Bumper Cave (Bottom)' },
  { from: 'Bumper Cave Entrance', to: 'West Dark World', entrance: 'Bumper Cave Entrance Drop' },
  { from: 'Bumper Cave Ledge', to: 'Bumper Cave', entrance: 'Bumper Cave (Top)' },
  { from: 'Bumper Cave Ledge', to: 'Bumper Cave Entrance', entrance: 'Bumper Cave Ledge Drop' },
  { from: 'Bumper Cave Ledge', to: 'Death Mountain Return Ledge', entrance: 'Bumper Cave Ledge Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Skull Woods Forest
  // ══════════════════════════════════════════════════
  { from: 'Skull Woods Forest', to: 'Skull Woods Forest (West)', entrance: 'Skull Woods Forest (West)' },
  { from: 'Skull Woods Forest', to: 'Skull Woods', entrance: 'Skull Woods First Section Door' },
  { from: 'Skull Woods Forest', to: 'Skull Woods', entrance: 'Skull Woods Second Section Door (East)' },
  { from: 'Skull Woods Forest', to: 'Skull Woods', entrance: 'Skull Woods Second Section Door (West)' },
  { from: 'Skull Woods Forest (West)', to: 'Skull Woods', entrance: 'Skull Woods Final Section' },
  { from: 'Skull Woods Forest', to: 'Master Sword Meadow', entrance: 'Skull Woods Forest Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Dark Desert
  // ══════════════════════════════════════════════════
  { from: 'Dark Desert', to: 'Misery Mire', entrance: 'Misery Mire' },
  { from: 'Dark Desert', to: 'Mire Shed', entrance: 'Mire Shed' },
  { from: 'Dark Desert', to: 'Dark Desert Hint', entrance: 'Dark Desert Hint' },
  { from: 'Dark Desert', to: 'Dark Desert Healer Fairy', entrance: 'Dark Desert Fairy' },
  { from: 'Dark Desert', to: 'Desert Ledge', entrance: 'Dark Desert Mirror Spot' },
  { from: 'Dark Desert', to: 'Desert Northern Cliffs', entrance: 'Dark Desert North Mirror Spot' },
  { from: 'Dark Desert', to: 'Desert Palace Lone Stairs', entrance: 'Dark Desert Lone Stairs Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Dark Lake Hylia
  // ══════════════════════════════════════════════════
  { from: 'Dark Lake Hylia', to: 'Dark Lake Hylia Central Island', entrance: 'Dark Lake Hylia Teleporter' },
  { from: 'Dark Lake Hylia', to: 'Lake Hylia Island', entrance: 'Dark Lake Hylia Mirror Spot' },
  { from: 'Dark Lake Hylia', to: 'Dark Lake Hylia Ledge', entrance: 'Dark Lake Hylia Ledge Pier' },
  { from: 'Dark Lake Hylia', to: 'Dark Lake Hylia Shop', entrance: 'Dark Lake Hylia Shop' },

  { from: 'Dark Lake Hylia Central Island', to: 'Lake Hylia Central Island', entrance: 'Dark Lake Hylia Central Island Mirror Spot' },
  { from: 'Dark Lake Hylia Central Island', to: 'Ice Palace', entrance: 'Ice Palace' },

  { from: 'Dark Lake Hylia Ledge', to: 'Dark Lake Hylia', entrance: 'Dark Lake Hylia Ledge Drop' },
  { from: 'Dark Lake Hylia Ledge', to: 'Dark Lake Hylia Ledge Hint', entrance: 'Dark Lake Hylia Ledge Hint' },
  { from: 'Dark Lake Hylia Ledge', to: 'Dark Lake Hylia Ledge Spike Cave', entrance: 'Dark Lake Hylia Ledge Spike Cave' },
  { from: 'Dark Lake Hylia Ledge', to: 'Dark Lake Hylia Ledge Healer Fairy', entrance: 'Dark Lake Hylia Ledge Fairy' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain — West
  // ══════════════════════════════════════════════════
  { from: 'Dark Death Mountain (West Bottom)', to: 'Dark Death Mountain (Top)', entrance: 'Dark Death Mountain Climb (West)' },
  { from: 'Dark Death Mountain (West Bottom)', to: 'Death Mountain Entrance', entrance: 'Dark Death Mountain (West Bottom) Mirror Spot' },
  { from: 'Dark Death Mountain (West Bottom)', to: 'Spike Cave', entrance: 'Spike Cave' },
  { from: 'Dark Death Mountain (West Bottom)', to: 'Dark Death Mountain Healer Fairy', entrance: 'Dark Death Mountain Fairy' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain — Top
  // ══════════════════════════════════════════════════
  { from: 'Dark Death Mountain (Top)', to: 'Dark Death Mountain (West Bottom)', entrance: 'Dark Death Mountain Drop (West)' },
  { from: 'Dark Death Mountain (Top)', to: 'Dark Death Mountain (East Bottom)', entrance: 'Dark Death Mountain Drop (East)' },
  { from: 'Dark Death Mountain (Top)', to: 'Ganons Tower', entrance: 'Ganons Tower' },
  { from: 'Dark Death Mountain (Top)', to: 'Superbunny Cave (Top)', entrance: 'Superbunny Cave (Top)' },
  { from: 'Dark Death Mountain (Top)', to: 'Hookshot Cave', entrance: 'Hookshot Cave' },
  { from: 'Dark Death Mountain (Top)', to: 'East Death Mountain (Top)', entrance: 'East Death Mountain (Top) Mirror Spot' },
  { from: 'Dark Death Mountain (Top)', to: 'Turtle Rock (Top)', entrance: 'Turtle Rock' },
  { from: 'Dark Death Mountain (Top)', to: 'Dark Death Mountain Ledge', entrance: 'Dark Death Mountain Ledge' },
  { from: 'Dark Death Mountain (Top)', to: 'Cave Shop (Dark Death Mountain)', entrance: 'Cave Shop (Dark Death Mountain)' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain — East
  // ══════════════════════════════════════════════════
  { from: 'Dark Death Mountain (East Bottom)', to: 'East Death Mountain (Bottom)', entrance: 'Dark Death Mountain (East Bottom) Mirror Spot' },
  { from: 'Dark Death Mountain (East Bottom)', to: 'Dark Death Mountain (Top)', entrance: 'Dark Death Mountain Climb (East)' },
  { from: 'Dark Death Mountain (East Bottom)', to: 'Superbunny Cave (Bottom)', entrance: 'Superbunny Cave (Bottom)' },

  { from: 'Dark Death Mountain Ledge', to: 'Dark Death Mountain (West Bottom)', entrance: 'Dark Death Mountain Ledge Drop (West)' },
  { from: 'Dark Death Mountain Ledge', to: 'Dark Death Mountain (Top)', entrance: 'Dark Death Mountain Ledge Drop (Top)' },
  { from: 'Dark Death Mountain Ledge', to: 'Death Mountain (Top)', entrance: 'Dark Death Mountain Ledge Mirror Spot' },

  { from: 'Dark Death Mountain Isolated Ledge', to: 'Dark Death Mountain (Top)', entrance: 'Dark Death Mountain Isolated Ledge Drop' },
  { from: 'Dark Death Mountain Isolated Ledge', to: 'Fairy Ascension Ledge', entrance: 'Dark Death Mountain Isolated Ledge Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain Floating Island
  // ══════════════════════════════════════════════════
  { from: 'Death Mountain Floating Island (Dark World)', to: 'Death Mountain Floating Island (Light World)', entrance: 'Death Mountain Floating Island Mirror Spot' },
  { from: 'Death Mountain Floating Island (Dark World)', to: 'Dark Death Mountain (Top)', entrance: 'Death Mountain Floating Island Drop' },

  // ══════════════════════════════════════════════════
  // Dark Death Mountain Bunny Descent
  // ══════════════════════════════════════════════════
  { from: 'Dark Death Mountain Bunny Descent Area', to: 'Dark Death Mountain (East Bottom)', entrance: 'Dark Death Mountain Bunny Descent' },

  // ══════════════════════════════════════════════════
  // Turtle Rock (Top)
  // ══════════════════════════════════════════════════
  { from: 'Turtle Rock (Top)', to: 'Turtle Rock', entrance: 'Turtle Rock' },

  // ══════════════════════════════════════════════════
  // Pyramid / Bottom of Pyramid
  // ══════════════════════════════════════════════════
  { from: 'Pyramid', to: 'Bottom of Pyramid', entrance: 'Pyramid Exit' },
  { from: 'Pyramid Ledge', to: 'East Dark World', entrance: 'Pyramid Ledge Drop' },
  { from: 'Pyramid Ledge', to: 'Pyramid', entrance: 'Pyramid Entrance' },
  { from: 'Bottom of Pyramid', to: 'East Dark World', entrance: 'Bottom of Pyramid Exit' },

  // ══════════════════════════════════════════════════
  // Dungeon Entrance Connections (from overworld)
  // ══════════════════════════════════════════════════
  // Eastern Palace
  { from: 'Light World', to: 'Eastern Palace', entrance: 'Eastern Palace' },

  // Tower of Hera (from Death Mountain Top)
  // (already listed above)

  // Hyrule Castle / Sewers (from Courtyard)
  // (already listed above)

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
  { from: 'East Dark World', to: 'Light World', entrance: 'East Dark World Mirror Spot' },
  { from: 'South Dark World', to: 'Light World', entrance: 'South Dark World Mirror Spot' },
  { from: 'West Dark World', to: 'Light World', entrance: 'West Dark World Mirror Spot' },
  { from: 'Dark Lake Hylia', to: 'Light World', entrance: 'Dark Lake Hylia Mirror Spot' },
  { from: 'Northeast Dark World', to: 'Light World', entrance: 'Northeast Dark World Mirror Spot' },
  { from: 'Skull Woods Forest', to: 'Light World', entrance: 'Skull Woods Mirror Spot' },

  // ══════════════════════════════════════════════════
  // Hobo Bridge
  // ══════════════════════════════════════════════════
  { from: 'Hobo Bridge', to: 'Light World', entrance: 'Hobo Bridge Exit' },

  // ══════════════════════════════════════════════════
  // Checkerboard Cave
  // ══════════════════════════════════════════════════
  { from: 'Desert Northern Cliffs', to: 'Checkerboard Cave', entrance: 'Checkerboard Cave' },

  // ══════════════════════════════════════════════════
  // Chris Houlihan Room
  // ══════════════════════════════════════════════════
  { from: 'Chris Houlihan Room', to: 'Light World', entrance: 'Chris Houlihan Room Exit' },

  // ══════════════════════════════════════════════════
  // Lost Woods Hideout / Lumberjack internal
  // ══════════════════════════════════════════════════
  { from: 'Lost Woods Hideout (top)', to: 'Lost Woods Hideout (bottom)', entrance: 'Lost Woods Hideout Drop' },
  { from: 'Lost Woods Hideout (bottom)', to: 'Light World', entrance: 'Lost Woods Hideout Exit' },
  { from: 'Lumberjack Tree (top)', to: 'Lumberjack Tree (bottom)', entrance: 'Lumberjack Tree Drop' },
  { from: 'Lumberjack Tree (bottom)', to: 'Light World', entrance: 'Lumberjack Tree Exit' },

  // ══════════════════════════════════════════════════
  // Kakariko Well internal
  // ══════════════════════════════════════════════════
  { from: 'Kakariko Well (top)', to: 'Kakariko Well (bottom)', entrance: 'Kakariko Well Drop' },
  { from: 'Kakariko Well (bottom)', to: 'Light World', entrance: 'Kakariko Well Exit' },

  // ══════════════════════════════════════════════════
  // Spectacle Rock Cave internal
  // ══════════════════════════════════════════════════
  { from: 'Spectacle Rock Cave (Bottom)', to: 'Spectacle Rock Cave (Top)', entrance: 'Spectacle Rock Cave Ascent' },
  { from: 'Spectacle Rock Cave (Top)', to: 'Death Mountain (Top)', entrance: 'Spectacle Rock Cave Exit (Top)' },
  { from: 'Spectacle Rock Cave (Peak)', to: 'Spectacle Rock', entrance: 'Spectacle Rock Cave Exit (Peak)' },

  // ══════════════════════════════════════════════════
  // Hookshot Cave internal
  // ══════════════════════════════════════════════════
  // (already listed above in DM caves)

  // ══════════════════════════════════════════════════
  // Village of Outcasts Heavy Rock
  // ══════════════════════════════════════════════════
  { from: 'South Dark World', to: 'West Dark World', entrance: 'Village of Outcasts Heavy Rock' },
];
