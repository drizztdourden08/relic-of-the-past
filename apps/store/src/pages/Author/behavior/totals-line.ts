/* @layer store-site @kind logic */
import type { AuthorResponse } from '@rotp/hub-contracts';
import { formatDay } from '@rotp/hub-client';
import { formatAverage, formatCount, plural } from '../../../format-count';

const totalsLine = (data: AuthorResponse): string => {
  const { author, items } = data;
  const rating = author.ratingAverage === null
    ? 'no ratings yet'
    : `★ ${formatAverage(author.ratingAverage)} from ${plural(author.ratingCount, 'rating', 'ratings')}`;
  return `joined ${formatDay(author.joinedAt)} · ${formatCount(items.length)} published · ${plural(author.installs, 'install', 'installs')} · ${rating}`;
};

export { totalsLine };
