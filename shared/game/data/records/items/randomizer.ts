/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const RANDOMIZER_ITEMS: ItemRecord[] = [
  {
    id: 'item-164',
    origin: 'randomizer',
    category: 'junk',
    name: 'Blue Clock',
  },
  {
    id: 'item-165',
    origin: 'randomizer',
    category: 'junk',
    name: 'Green Clock',
  },
  {
    id: 'item-166',
    origin: 'randomizer',
    category: 'junk',
    name: 'Red Clock',
  },
  {
    id: 'item-167',
    origin: 'randomizer',
    category: 'junk',
    name: 'Rupoor',
  },
  {
    id: 'item-168',
    origin: 'randomizer',
    category: 'junk',
    name: 'Nothing',
  },
  {
    id: 'item-169',
    origin: 'randomizer',
    category: 'junk',
    name: 'Power Star',
  },
  {
    id: 'item-170',
    origin: 'randomizer',
    category: 'junk',
    name: 'Multi RNG',
  },
  {
    id: 'item-171',
    origin: 'randomizer',
    category: 'junk',
    name: 'Single RNG',
  },
  {
    id: 'item-172',
    origin: 'randomizer',
    category: 'weapon',
    name: 'Progressive Bow (Alt)',
    spriteId: 'sprite-receipt-bow',
  },
  // The four progressive capacity pool items (capacity-upgrade-names.data.ts). A progressive
  // plan ships ONE name per family and the core picks the jump from live inventory, so unlike
  // the fixed-jump upgrades beside them these carry no receive id here at all
  // (capacity-progressive-receive-id.ts owns that). Without a record a seed that places one
  // has nothing to show for it: a virtual slot renders "???", and a real check falls back to
  // its own vanilla contents and names the wrong item with no sign anything went missing.
  {
    id: 'item-175',
    origin: 'randomizer',
    category: 'upgrade',
    name: 'Progressive Bomb Capacity',
    spriteId: 'sprite-upgrade-explosives',
  },
  {
    id: 'item-176',
    origin: 'randomizer',
    category: 'upgrade',
    name: 'Progressive Arrow Capacity',
    spriteId: 'sprite-upgrade-projectiles',
  },
  {
    id: 'item-177',
    origin: 'randomizer',
    category: 'upgrade',
    name: 'Progressive Magic Capacity',
    spriteId: 'sprite-upgrade-meter',
  },
  {
    id: 'item-178',
    origin: 'randomizer',
    category: 'upgrade',
    name: 'Progressive Wallet',
    spriteId: 'sprite-upgrade-wallet',
  },
];

export { RANDOMIZER_ITEMS };
