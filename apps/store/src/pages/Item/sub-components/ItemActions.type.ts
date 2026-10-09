/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { useListingToggle } from '../../../catalog/useListingToggle';

type ItemActionsProps = {
  item: StoreItem;
  canModerate: boolean;
  canFeature: boolean;
  listing: ReturnType<typeof useListingToggle>;
};

export type { ItemActionsProps };
