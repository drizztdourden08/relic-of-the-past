/* @layer shared-game @kind data */
/** Randomizer-only inventions (§7b bucket 3) — no vanilla counterpart, so no
 *  gameId until the core learns to deliver each of these. */
import type { ItemRecord } from '../types';

const RANDOMIZER_ITEMS: ItemRecord[] = [
  {
    id: 'item-164',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Blue Clock',
  },
  {
    id: 'item-165',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Green Clock',
  },
  {
    id: 'item-166',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Red Clock',
  },
  {
    id: 'item-167',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Rupoor',
  },
  {
    id: 'item-168',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Nothing',
  },
  {
    id: 'item-169',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Power Star',
  },
  {
    id: 'item-170',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Multi RNG',
  },
  {
    id: 'item-171',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Single RNG',
  },
  {
    id: 'item-172',
    origin: 'randomizer',
    category: 'weapon',
    randomizerName: 'Progressive Bow (Alt)',
  },
];

export { RANDOMIZER_ITEMS };
