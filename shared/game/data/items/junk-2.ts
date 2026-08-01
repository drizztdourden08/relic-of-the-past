/* @layer shared-game @kind data */
/** Junk items, part 2 of 2 (size split); see junk-1.ts for context. */
import type { ItemRecord } from '../types';

const JUNK_ITEMS_2: ItemRecord[] = [
  {
    id: 'item-054',
    gameId: { receiveItemId: 53 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: '5 Rupees',
    randomizerName: 'Rupees (5)',
    spriteId: 'sprite-receipt-rupee-5',
  },
  {
    id: 'item-055',
    gameId: { receiveItemId: 54 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: '20 Rupees',
    randomizerName: 'Rupees (20)',
    spriteId: 'sprite-receipt-rupee-20',
  },
  {
    id: 'item-056',
    gameId: { receiveItemId: 55 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Green Pendant',
    spriteId: 'sprite-hud-green-pendant',
  },
  {
    id: 'item-057',
    gameId: { receiveItemId: 56 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Red Pendant',
    spriteId: 'sprite-hud-red-pendant',
  },
  {
    id: 'item-058',
    gameId: { receiveItemId: 57 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Blue Pendant',
    spriteId: 'sprite-hud-blue-pendant',
  },
  {
    id: 'item-059',
    gameId: { receiveItemId: 58 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Bow',
    spriteId: 'sprite-hud-bow',
  },
  {
    id: 'item-065',
    gameId: { receiveItemId: 64 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: '100 Rupees',
    randomizerName: 'Rupees (100)',
    spriteId: 'sprite-receipt-rupee-100',
  },
  {
    id: 'item-066',
    gameId: { receiveItemId: 65 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: '50 Rupees',
    randomizerName: 'Rupees (50)',
    spriteId: 'sprite-receipt-rupee-50',
  },
  {
    id: 'item-067',
    gameId: { receiveItemId: 66 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Heart Refill',
    spriteId: 'sprite-receipt-heart-refill',
  },
  {
    id: 'item-068',
    gameId: { receiveItemId: 67 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: 'Arrow',
    randomizerName: 'Single Arrow',
    spriteId: 'sprite-receipt-arrows',
  },
  {
    id: 'item-069',
    gameId: { receiveItemId: 68 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: '10 Arrows',
    randomizerName: 'Arrows (10)',
    spriteId: 'sprite-receipt-arrow-10',
  },
  {
    id: 'item-070',
    gameId: { receiveItemId: 69 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Small Magic Refill',
    spriteId: 'sprite-drop-small-magic',
  },
  {
    id: 'item-071',
    gameId: { receiveItemId: 70 },
    origin: 'vanilla',
    category: 'junk',
    vanillaName: '300 Rupees',
    randomizerName: 'Rupees (300)',
    spriteId: 'sprite-receipt-rupee-300',
  },
  // A second native "20 Rupees" receive id (71), distinct from item-055
  // (receiveItemId 54), which already carries the canonical randomizerName
  // 'Rupees (20)'. Left un-canonicalized rather than renamed to the same
  // string — a randomizerName collision isn't allowed since it's the join key
  // rando delivery keys off of. Needs a real AP DataPackage cross-check to
  // learn which native id (if not both) actually carries that name.
  {
    id: 'item-072',
    gameId: { receiveItemId: 71 },
    origin: 'vanilla',
    category: 'junk',
    randomizerName: '20 Rupees',
    spriteId: 'sprite-receipt-rupee-20',
  },
  {
    id: 'item-125',
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Small Heart',
  },
  {
    id: 'item-126',
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Magic Jar',
  },
  {
    id: 'item-127',
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Apple',
  },
  {
    id: 'item-128',
    origin: 'vanilla',
    category: 'junk',
    randomizerName: 'Bee Trap',
  },
];

export { JUNK_ITEMS_2 };
