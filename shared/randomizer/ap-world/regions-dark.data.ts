/* @layer shared-game @kind data */
/**
 * Overworld regions of the second world (python create_dw_region calls).
 * Ported 1:1 from tests/fixtures/ap-source/Regions.py (create_regions, open
 * mode). Names are the AP originals — this is transcribed game data.
 */
import type { ApRegionDef } from './region.type';

const DARK_REGIONS: readonly ApRegionDef[] = [
  { name: 'East Dark World', type: 'dark', locations: ['Pyramid'], exits: ['Pyramid Fairy', 'South Dark World Bridge', 'Palace of Darkness', 'Dark Lake Hylia Drop (East)', 'Hyrule Castle Ledge Mirror Spot', 'Dark Lake Hylia Fairy', 'Palace of Darkness Hint', 'East Dark World Hint', 'Pyramid Hole', 'Northeast Dark World Broken Bridge Pass'] },
  { name: 'Catfish', type: 'dark', locations: ['Catfish'], exits: ['Catfish Exit Rock'] },
  { name: 'Northeast Dark World', type: 'dark', locations: [], exits: ['West Dark World Gap', 'Dark World Potion Shop', 'East Dark World Broken Bridge Pass', 'Catfish Entrance Rock', 'Dark Lake Hylia Teleporter'] },
  { name: 'South Dark World', type: 'dark', locations: ['Stumpy', 'Digging Game'], exits: ['Dark Lake Hylia Drop (South)', 'Hype Cave', 'Swamp Palace', 'Village of Outcasts Heavy Rock', 'Maze Race Mirror Spot', 'Cave 45 Mirror Spot', 'East Dark World Bridge', 'Big Bomb Shop', 'Archery Game', 'Bonk Fairy (Dark)', 'Dark Lake Hylia Shop', 'Bombos Tablet Mirror Spot'] },
  { name: 'Dark Lake Hylia', type: 'dark', locations: [], exits: ['Lake Hylia Island Mirror Spot', 'East Dark World Pier', 'Dark Lake Hylia Ledge'] },
  { name: 'Dark Lake Hylia Central Island', type: 'dark', locations: [], exits: ['Ice Palace', 'Lake Hylia Central Island Mirror Spot'] },
  { name: 'Dark Lake Hylia Ledge', type: 'dark', locations: [], exits: ['Dark Lake Hylia Ledge Drop', 'Dark Lake Hylia Ledge Fairy', 'Dark Lake Hylia Ledge Hint', 'Dark Lake Hylia Ledge Spike Cave'] },
  { name: 'West Dark World', type: 'dark', locations: ['Frog'], exits: ['Village of Outcasts Drop', 'East Dark World River Pier', 'Brewery', 'C-Shaped House', 'Chest Game', 'Thieves Town', 'Graveyard Ledge Mirror Spot', 'Kings Grave Mirror Spot', 'Bumper Cave Entrance Rock', 'Skull Woods Forest', 'Village of Outcasts Pegs', 'Village of Outcasts Eastern Rocks', 'Red Shield Shop', 'Dark Sanctuary Hint', 'Fortune Teller (Dark)', 'Dark World Lumberjack Shop'] },
  { name: 'Dark Grassy Lawn', type: 'dark', locations: [], exits: ['Grassy Lawn Pegs', 'Village of Outcasts Shop'] },
  { name: 'Hammer Peg Area', type: 'dark', locations: ['Dark Blacksmith Ruins'], exits: ['Bat Cave Drop Ledge Mirror Spot', 'Dark World Hammer Peg Cave', 'Peg Area Rocks'] },
  { name: 'Bumper Cave Entrance', type: 'dark', locations: [], exits: ['Bumper Cave (Bottom)', 'Bumper Cave Entrance Mirror Spot', 'Bumper Cave Entrance Drop'] },
  { name: 'Bumper Cave Ledge', type: 'dark', locations: ['Bumper Cave Ledge'], exits: ['Bumper Cave Ledge Drop', 'Bumper Cave (Top)', 'Bumper Cave Ledge Mirror Spot'] },
  { name: 'Skull Woods Forest', type: 'dark', locations: [], exits: ['Skull Woods First Section Hole (East)', 'Skull Woods First Section Hole (West)', 'Skull Woods First Section Hole (North)', 'Skull Woods First Section Door', 'Skull Woods Second Section Door (East)'] },
  { name: 'Skull Woods Forest (West)', type: 'dark', locations: [], exits: ['Skull Woods Second Section Hole', 'Skull Woods Second Section Door (West)', 'Skull Woods Final Section'] },
  { name: 'Dark Desert', type: 'dark', locations: [], exits: ['Misery Mire', 'Mire Shed', 'Desert Ledge (Northeast) Mirror Spot', 'Desert Ledge Mirror Spot', 'Desert Palace Stairs Mirror Spot', 'Desert Palace Entrance (North) Mirror Spot', 'Dark Desert Hint', 'Dark Desert Fairy'] },
  { name: 'Dark Death Mountain (West Bottom)', type: 'dark', locations: [], exits: ['Spike Cave', 'Spectacle Rock Mirror Spot', 'Dark Death Mountain Fairy'] },
  { name: 'Dark Death Mountain (Top)', type: 'dark', locations: [], exits: ['Dark Death Mountain Drop (East)', 'Dark Death Mountain Drop (West)', 'Ganons Tower', 'Superbunny Cave (Top)', 'Hookshot Cave', 'East Death Mountain (Top) Mirror Spot', 'Turtle Rock'] },
  { name: 'Dark Death Mountain Ledge', type: 'dark', locations: [], exits: ['Dark Death Mountain Ledge (East)', 'Dark Death Mountain Ledge (West)', 'Mimic Cave Mirror Spot', 'Spiral Cave Mirror Spot'] },
  { name: 'Dark Death Mountain Isolated Ledge', type: 'dark', locations: [], exits: ['Isolated Ledge Mirror Spot', 'Turtle Rock Isolated Ledge Entrance'] },
  { name: 'Dark Death Mountain (East Bottom)', type: 'dark', locations: [], exits: ['Superbunny Cave (Bottom)', 'Cave Shop (Dark Death Mountain)', 'Fairy Ascension Mirror Spot'] },
  { name: 'Death Mountain Floating Island (Dark World)', type: 'dark', locations: [], exits: ['Floating Island Drop', 'Hookshot Cave Back Entrance', 'Floating Island Mirror Spot'] },
  { name: 'Turtle Rock (Top)', type: 'dark', locations: [], exits: ['Turtle Rock Drop'] },
  { name: 'Pyramid Ledge', type: 'dark', locations: [], exits: ['Pyramid Entrance', 'Pyramid Drop'] },
  { name: 'Dark Death Mountain Bunny Descent Area', type: 'dark', locations: [], exits: [] },
];

export { DARK_REGIONS };
