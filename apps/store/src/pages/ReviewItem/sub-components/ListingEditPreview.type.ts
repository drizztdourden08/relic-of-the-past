/* @layer store-site @kind types */
import type { ListingEdit, StoreItem } from '@rotp/hub-contracts';

type ListingEditPreviewProps = {
  item: StoreItem;
  edit: ListingEdit;
};

export type { ListingEditPreviewProps };
