/* @layer store-api @kind logic */
import type { ListingEdit, StoreItem } from '@rotp/hub-contracts';

const replaceEdit = (item: StoreItem, next: ListingEdit): ListingEdit[] =>
  item.listingEdits.map((edit) => (edit.id === next.id ? next : edit));

export { replaceEdit };
