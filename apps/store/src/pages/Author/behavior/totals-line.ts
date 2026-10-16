/* @layer store-site @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { AuthorResponse } from '@rotp/hub-contracts';
import { formatAverage, formatCount, plural } from '../../../format-count';

const totalsLine = (data: AuthorResponse): string => {
  const { author, items } = data;
  const rating = author.ratingAverage === null
    ? 'no ratings yet'
    : `rated ${formatAverage(author.ratingAverage)} from ${plural(author.ratingCount, 'rating', 'ratings')}`;
  return `joined ${formatDate(author.joinedAt, 'iso', { length: 'short' })} · ${formatCount(items.length)} published · ${plural(author.installs, 'install', 'installs')} · ${rating}`;
};

export { totalsLine };
