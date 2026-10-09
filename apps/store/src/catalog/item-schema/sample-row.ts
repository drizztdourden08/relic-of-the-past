/* @layer store-site @kind logic */
import type { ItemRow } from '../item-row.type';

const sampleRow = (kind: ItemRow['kind']): ItemRow => ({
  id: `sample-${kind}`,
  name: 'sample',
  summary: 'sample',
  kind,
  author: 'sample',
  version: '0.0.0',
  rating: 0,
  ratings: 0,
  installs: 0,
});

export { sampleRow };
