/* @layer store-site @kind logic */
import type { AuthorResponse } from '@shared/store/api-types';
import { formatDay } from '@site-kit/lib/format-date';
import { formatAverage, formatCount, plural } from '../../../lib/format-count';

const totalsLine = (data: AuthorResponse): string => {
  const { author, items } = data;
  const rating = author.ratingAverage === null
    ? 'no ratings yet'
    : `★ ${formatAverage(author.ratingAverage)} from ${plural(author.ratingCount, 'rating', 'ratings')}`;
  return `joined ${formatDay(author.joinedAt)} · ${formatCount(items.length)} published · ${plural(author.installs, 'install', 'installs')} · ${rating}`;
};

export { totalsLine };
