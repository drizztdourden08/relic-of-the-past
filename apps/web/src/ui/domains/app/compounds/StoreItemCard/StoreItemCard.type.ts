/* @layer renderer-components @kind types */
import type { ItemCardView } from '@shared/store/home-types';

/** What the app has of the item: nothing, the live version, or an older one. */
type StoreItemStatus = 'installed' | 'update' | null;

interface StoreItemCardProps {
  item: ItemCardView;
  /** The card picture; null draws the kind's icon in its place. */
  imageUrl: string | null;
  status: StoreItemStatus;
  selected: boolean;
  onSelect: (itemId: string) => void;
}

export type { StoreItemCardProps, StoreItemStatus };
