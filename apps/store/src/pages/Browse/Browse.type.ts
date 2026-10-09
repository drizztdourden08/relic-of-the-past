/* @layer store-site @kind types */
import type { StoreKind } from '@shared/store/types';

type BrowseProps = {
  kind: StoreKind | null;
  selectedId?: string;
};

export type { BrowseProps };
