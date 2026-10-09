/* @layer store-site @kind types */
import type { ReactNode } from 'react';
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';

type ItemHeroProps = {
  item: StoreItem;
  version: StoreVersion | null;
  actions?: ReactNode;
};

export type { ItemHeroProps };
