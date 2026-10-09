/* @layer store-site @kind types */
import type { StoreKind } from '@rotp/hub-contracts';

type BrowseProps = {
  kind: StoreKind | null;
  selectedId?: string;
};

export type { BrowseProps };
