/* @layer store-site @kind logic */
/** The facts along the bottom of an item's hero, for the version it shows. */
import type { HeroFact } from '@domains/app/compounds/HeroFacts';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { formatDay } from '@site-kit/lib/format-date';
import { factsLine } from '../../../catalog/facts-line';
import { formatAverage, formatCount } from '../../../lib/format-count';

const ratingValue = (item: StoreItem): string => {
  const { ratingSum, ratingCount } = item.stats;
  if (ratingCount === 0) return 'no ratings yet';
  return `${formatAverage(ratingSum / ratingCount)} from ${formatCount(ratingCount)}`;
};

const itemHeroFacts = (item: StoreItem, version: StoreVersion | null): HeroFact[] => {
  const contents = version ? factsLine(version.facts) : null;
  return [
    { label: 'Version', value: version ? version.semver : 'none approved yet', mono: true },
    ...(contents ? [{ label: 'Contents', value: contents, title: contents }] : []),
    { label: 'Installs', value: formatCount(item.stats.installs) },
    { label: 'Rating', value: ratingValue(item) },
    { label: 'Licence', value: item.license || '-' },
    { label: 'Updated', value: formatDay(item.updatedAt) },
  ];
};

export { itemHeroFacts };
