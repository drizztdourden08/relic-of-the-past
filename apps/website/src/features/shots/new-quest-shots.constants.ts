/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const NEW_QUEST_SHOTS = {
  'v-19': {
    id: 'v-19',
    src: 'media/shots/v-19.webp',
    width: 1192,
    height: 612,
    alt: 'The randomizer options page with the item pool beside it',
  },
  'v-20': {
    id: 'v-20',
    src: 'media/shots/v-20.webp',
    width: 896,
    height: 576,
    alt: 'A shop in a randomized seed selling an arrow bundle, a blue rupee and a heart',
  },
  'v-21': {
    id: 'v-21',
    src: 'media/shots/v-21.webp',
    width: 300,
    height: 250,
    alt: 'The progression items in the item pool: wallet, arrow and bomb capacity, bottle, sword, magic, shield and bow',
  },
  'tracker-jail': {
    id: 'tracker-jail',
    src: 'media/shots/tracker-jail.webp',
    width: 1920,
    height: 1040,
    alt: "Link in Princess Zelda's cell with the Checks widget docked beside the game, scrolled to Zelda's Chest",
  },
  'tracker-second': {
    id: 'tracker-second',
    src: 'media/shots/tracker-second.webp',
    width: 1920,
    height: 1040,
    alt: 'The Eastern Palace with the Checks widget open on the Cannonball Chest',
  },
} as const satisfies Record<string, Screenshot>;

export { NEW_QUEST_SHOTS };
