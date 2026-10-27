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
  'v-22': {
    id: 'v-22',
    src: 'media/shots/v-22.webp',
    width: 2066,
    height: 926,
    alt: 'The jail cell with the checks tracker docked beside the game',
  },
  'v-23': {
    id: 'v-23',
    pending: true,
    src: 'media/shots/v-23.webp',
    width: 1278,
    height: 720,
    alt: 'A notice that an item arrived from another player in an Archipelago room',
  },
  'v-24': {
    id: 'v-24',
    pending: true,
    src: 'media/shots/v-24.webp',
    width: 910,
    height: 555,
    alt: 'The room connection panel for an online Archipelago room',
  },
} as const satisfies Record<string, Screenshot>;

export { NEW_QUEST_SHOTS };
