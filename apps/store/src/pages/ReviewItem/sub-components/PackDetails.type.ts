/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import type { PackLink } from '../../../pack-link/pack-link.type';

type PackDetailsProps = {
  item: StoreItem;
  version: StoreVersion | null;
  pack: PackLink;
  noPack: string | null;
};

export type { PackDetailsProps };
