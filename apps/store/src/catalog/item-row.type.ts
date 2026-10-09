/* @layer store-site @kind types */
import type { StoreKind } from '@shared/store/types';

type ItemRow = {
  id: string;
  name: string;
  summary: string;
  kind: StoreKind;
  author: string;
  version: string;
  rating: number;
  ratings: number;
  installs: number;
};

export type { ItemRow };
