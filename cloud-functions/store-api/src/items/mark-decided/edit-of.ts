/* @layer store-api @kind logic */
import type { ListingEdit, StoreItem } from '../../../../../shared/store/types';
import { notFound } from '../../../../hub-core/http/http-error';

const editOf = (item: StoreItem, editId: string): ListingEdit => {
  const edit = item.listingEdits.find((entry) => entry.id === editId);
  if (!edit) throw notFound('No such listing edit.');
  return edit;
};

export { editOf };
