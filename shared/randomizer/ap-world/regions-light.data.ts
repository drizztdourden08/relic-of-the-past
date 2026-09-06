/* @layer shared-game @kind data */
/**
 * Overworld regions of the first world (python create_lw_region calls).
 * Ported 1:1 from tests/fixtures/ap-source/Regions.py (create_regions).
 * Names are the AP originals — this is transcribed game data. The start
 * region carries the extra standard-mode exit Rules.py standard_rules adds
 * (line 1091, add_connection 'Uncle S&Q').
 */
import type { ApRegionDef } from './region.type';

const LIGHT_REGIONS: readonly ApRegionDef[] = [
  { name: 'Menu', type: 'light', locations: [], exits: ['Links House S&Q', 'Sanctuary S&Q', 'Old Man S&Q', 'Uncle S&Q'] },
  { name: 'Light World', type: 'light', locations: ['Mushroom', 'Bottle Merchant', 'Flute Spot', 'Sunken Treasure', 'Purple Chest', 'Flute Activation Spot'], exits: ['Blinds Hideout', 'Hyrule Castle Secret Entrance Drop', 'Zoras River', 'Kings Grave Outer Rocks', 'Dam', 'Links House', 'Tavern North', 'Chicken House', 'Aginahs Cave', 'Sahasrahlas Hut', 'Kakariko Well Drop', 'Kakariko Well Cave', 'Blacksmiths Hut', 'Bat Cave Drop Ledge', 'Bat Cave Cave', 'Sick Kids House', 'Hobo Bridge', 'Lost Woods Hideout Drop', 'Lost Woods Hideout Stump', 'Lumberjack Tree Tree', 'Lumberjack Tree Cave', 'Mini Moldorm Cave', 'Ice Rod Cave', 'Lake Hylia Central Island Pier', 'Bonk Rock Cave', 'Library', 'Potion Shop', 'Two Brothers House (East)', 'Desert Palace Stairs', 'Eastern Palace', 'Master Sword Meadow', 'Sanctuary', 'Sanctuary Grave', 'Death Mountain Entrance Rock', 'Flute Spot 1', 'Dark Desert Teleporter', 'East Hyrule Teleporter', 'South Hyrule Teleporter', 'Kakariko Teleporter', 'Elder House (East)', 'Elder House (West)', 'North Fairy Cave', 'North Fairy Cave Drop', 'Lost Woods Gamble', 'Snitch Lady (East)', 'Snitch Lady (West)', 'Tavern (Front)', 'Bush Covered House', 'Light World Bomb Hut', 'Kakariko Shop', 'Long Fairy Cave', 'Good Bee Cave', '20 Rupee Cave', 'Cave Shop (Lake Hylia)', 'Waterfall of Wishing', 'Hyrule Castle Main Gate', 'Bonk Fairy (Light)', '50 Rupee Cave', 'Fortune Teller (Light)', 'Lake Hylia Fairy', 'Light Hype Fairy', 'Desert Fairy', 'Lumberjack House', 'Lake Hylia Fortune Teller', 'Kakariko Gamble Game', 'Top of Pyramid'] },
  { name: 'Death Mountain Entrance', type: 'light', locations: [], exits: ['Old Man Cave (West)', 'Death Mountain Entrance Drop'] },
  { name: 'Lake Hylia Central Island', type: 'light', locations: [], exits: ['Capacity Upgrade', 'Lake Hylia Central Island Teleporter'] },
  { name: 'Zoras River', type: 'light', locations: ['King Zora', 'Zora\'s Ledge'], exits: [] },
  { name: 'Kings Grave Area', type: 'light', locations: [], exits: ['Kings Grave', 'Kings Grave Inner Rocks'] },
  { name: 'Bat Cave Drop Ledge', type: 'light', locations: [], exits: ['Bat Cave Drop'] },
  { name: 'Hobo Bridge', type: 'light', locations: ['Hobo'], exits: [] },
  { name: 'Cave 45 Ledge', type: 'light', locations: [], exits: ['Cave 45'] },
  { name: 'Graveyard Ledge', type: 'light', locations: [], exits: ['Graveyard Cave'] },
  { name: 'Lake Hylia Island', type: 'light', locations: ['Lake Hylia Island'], exits: [] },
  { name: 'Maze Race Ledge', type: 'light', locations: ['Maze Race'], exits: ['Two Brothers House (West)'] },
  { name: 'Desert Ledge', type: 'light', locations: ['Desert Ledge'], exits: ['Desert Palace Entrance (North) Rocks', 'Desert Palace Entrance (West)'] },
  { name: 'Desert Ledge (Northeast)', type: 'light', locations: [], exits: ['Checkerboard Cave'] },
  { name: 'Desert Palace Stairs', type: 'light', locations: [], exits: ['Desert Palace Entrance (South)'] },
  { name: 'Desert Palace Lone Stairs', type: 'light', locations: [], exits: ['Desert Palace Stairs Drop', 'Desert Palace Entrance (East)'] },
  { name: 'Desert Palace Entrance (North) Spot', type: 'light', locations: [], exits: ['Desert Palace Entrance (North)', 'Desert Ledge Return Rocks'] },
  { name: 'Master Sword Meadow', type: 'light', locations: ['Master Sword Pedestal'], exits: [] },
  { name: 'Hyrule Castle Courtyard', type: 'light', locations: [], exits: ['Hyrule Castle Secret Entrance Stairs', 'Hyrule Castle Entrance (South)'] },
  { name: 'Hyrule Castle Ledge', type: 'light', locations: [], exits: ['Hyrule Castle Entrance (East)', 'Hyrule Castle Entrance (West)', 'Agahnims Tower', 'Hyrule Castle Ledge Courtyard Drop'] },
  { name: 'Death Mountain', type: 'light', locations: [], exits: ['Old Man Cave (East)', 'Old Man House (Bottom)', 'Old Man House (Top)', 'Death Mountain Return Cave (East)', 'Spectacle Rock Cave', 'Spectacle Rock Cave Peak', 'Spectacle Rock Cave (Bottom)', 'Broken Bridge (West)', 'Death Mountain Teleporter'] },
  { name: 'Death Mountain Return Ledge', type: 'light', locations: [], exits: ['Death Mountain Return Ledge Drop', 'Death Mountain Return Cave (West)'] },
  { name: 'East Death Mountain (Bottom)', type: 'light', locations: [], exits: ['Broken Bridge (East)', 'Paradox Cave (Bottom)', 'Paradox Cave (Middle)', 'East Death Mountain Teleporter', 'Hookshot Fairy', 'Fairy Ascension Rocks', 'Spiral Cave (Bottom)'] },
  { name: 'East Death Mountain (Top)', type: 'light', locations: [], exits: ['Paradox Cave (Top)', 'Death Mountain (Top)', 'Spiral Cave Ledge Access', 'East Death Mountain Drop', 'Turtle Rock Teleporter', 'Fairy Ascension Ledge'] },
  { name: 'Spiral Cave Ledge', type: 'light', locations: [], exits: ['Spiral Cave', 'Spiral Cave Ledge Drop'] },
  { name: 'Fairy Ascension Plateau', type: 'light', locations: [], exits: ['Fairy Ascension Drop', 'Fairy Ascension Cave (Bottom)'] },
  { name: 'Fairy Ascension Ledge', type: 'light', locations: [], exits: ['Fairy Ascension Ledge Drop', 'Fairy Ascension Cave (Top)'] },
  { name: 'Death Mountain (Top)', type: 'light', locations: ['Ether Tablet'], exits: ['East Death Mountain (Top)', 'Tower of Hera', 'Death Mountain Drop'] },
  { name: 'Spectacle Rock', type: 'light', locations: ['Spectacle Rock'], exits: ['Spectacle Rock Drop'] },
  { name: 'Bombos Tablet Ledge', type: 'light', locations: ['Bombos Tablet'], exits: [] },
  { name: 'Death Mountain Floating Island (Light World)', type: 'light', locations: ['Floating Island'], exits: [] },
  { name: 'Mimic Cave Ledge', type: 'light', locations: [], exits: ['Mimic Cave'] },
  { name: 'Desert Northern Cliffs', type: 'light', locations: [], exits: [] },
];

export { LIGHT_REGIONS };
