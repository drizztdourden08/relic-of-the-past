/* @layer shared-game @kind constants */
import { all } from '@shared/game/data';
import type { PricedEntry } from '../rules.type';

const PRICED_WITHOUT_RECORDS: readonly PricedEntry[] = [
  { kind: 'exit', target: 'Pyramid Fairy', price: 100 },
];

const PRICED_ENTRIES: readonly PricedEntry[] = [
  ...all('check')
    .filter((check) => check.price !== undefined && check.kind !== 'shop-slot')
    .map((check): PricedEntry => ({
      kind: 'location', target: check.id, price: check.price ?? 0,
    })),
  ...PRICED_WITHOUT_RECORDS,
];

const MAX_PRICE = Math.max(...PRICED_ENTRIES.map((entry) => entry.price));

export { MAX_PRICE, PRICED_ENTRIES };
