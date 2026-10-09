/* @layer store-site @kind types */
import type { StoreItem } from '@shared/store/types';
import type { useListingToggle } from '../../../catalog/useListingToggle';

type ItemActionsProps = {
  item: StoreItem;
  canModerate: boolean;
  canFeature: boolean;
  listing: ReturnType<typeof useListingToggle>;
};

export type { ItemActionsProps };
