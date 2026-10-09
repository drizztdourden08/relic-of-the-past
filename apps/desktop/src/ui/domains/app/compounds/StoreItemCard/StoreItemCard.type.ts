/* @layer renderer-components @kind types */
import type musicIcon from '@iconify-icons/lucide/music';
import type { ItemCardView } from '@rotp/hub-contracts';

type StoreItemStatus = 'installed' | 'update' | null;

interface StoreItemCardProps {
  item: ItemCardView;
  imageUrl: string | null;
  status: StoreItemStatus;
  selected: boolean;
  onSelect: (itemId: string) => void;
}

type KindIcon = typeof musicIcon;

export type { KindIcon, StoreItemCardProps, StoreItemStatus };
