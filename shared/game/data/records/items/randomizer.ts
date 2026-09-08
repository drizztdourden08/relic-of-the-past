/* @layer shared-game @kind data */
/** Randomizer-only inventions (§7b bucket 3). They have no vanilla counterpart, so
 *  no gameId until the core learns to deliver each of these. */
import type { ItemRecord } from '@shared/game/data/types';

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
    randomizerName: 'Progressive Bomb Capacity',
    spriteId: 'sprite-upgrade-explosives',
  },
  {
    id: 'item-176',
    origin: 'randomizer',
    category: 'upgrade',
    randomizerName: 'Progressive Arrow Capacity',
    spriteId: 'sprite-upgrade-projectiles',
  },
  {
    id: 'item-177',
    origin: 'randomizer',
    category: 'upgrade',
    randomizerName: 'Progressive Magic Capacity',
    spriteId: 'sprite-upgrade-meter',
  },
  {
    id: 'item-178',
    origin: 'randomizer',
    category: 'upgrade',
    randomizerName: 'Progressive Wallet',
    spriteId: 'sprite-upgrade-wallet',
  },
];

export { RANDOMIZER_ITEMS };
