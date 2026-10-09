/* @layer store-site @kind types */
import type { StoreKind } from '@shared/store/types';

type ReviewRow = {
  id: string;
  item: string;
  kind: StoreKind;
  change: 'new item' | 'update' | 'listing edit';
  author: string;
  size: string;
  submitted: string;
};

export type { ReviewRow };
