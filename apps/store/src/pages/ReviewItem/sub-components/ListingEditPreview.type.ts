/* @layer store-site @kind types */
import type { ListingEdit, StoreItem } from '@shared/store/types';

type ListingEditPreviewProps = {
  item: StoreItem;
  edit: ListingEdit;
};

export type { ListingEditPreviewProps };
