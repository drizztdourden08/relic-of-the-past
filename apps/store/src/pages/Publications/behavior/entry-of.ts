/* @layer store-site @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PublicationTarget } from '../../../publications/publication-row';
import type { Entry } from './publication-detail.type';

const entryOf = (item: StoreItem, target: PublicationTarget): Entry => ({
  version: target.kind === 'version' ? item.versions.find((v) => v.n === target.n) ?? null : null,
  edit: target.kind === 'listing' ? item.listingEdits.find((e) => e.id === target.editId) ?? null : null,
});

export { entryOf };
