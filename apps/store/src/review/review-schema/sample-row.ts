/* @layer store-site @kind logic */
import type { ReviewRow } from '../review-row/review-row.type';

const sampleRow = (change: ReviewRow['change'], kind: ReviewRow['kind']): ReviewRow => ({
  id: `sample-${change}-${kind}`,
  item: 'sample',
  kind,
  change,
  author: 'sample',
  size: '0 B',
  submitted: '0000-00-00 00:00',
});

export { sampleRow };
