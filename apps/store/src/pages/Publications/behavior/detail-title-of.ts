/* @layer store-site @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PublicationTarget } from '../../../publications/publication-row';
import { entryOf } from './entry-of';

const detailTitleOf = (item: StoreItem, target: PublicationTarget): string => {
  const { version } = entryOf(item, target);
  if (version) return `v${version.n} · ${version.semver}`;
  return target.kind === 'listing' ? 'Listing edit' : item.name;
};

export { detailTitleOf };
