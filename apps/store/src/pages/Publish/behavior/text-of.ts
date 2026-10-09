/* @layer store-site @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { EMPTY } from './text-of.constants';
import type { ListingText } from './useListingFields.type';

const textOf = (item: StoreItem | null): ListingText => (item
  ? { name: item.name, summary: item.summary, description: item.description, tags: item.tags, license: item.license, color: item.color }
  : EMPTY);

export { textOf };
