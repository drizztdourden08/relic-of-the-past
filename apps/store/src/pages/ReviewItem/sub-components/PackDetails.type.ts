/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@shared/store/types';
import type { PackLink } from '../../../lib/pack-link/usePackLink';

type PackDetailsProps = {
  item: StoreItem;
  version: StoreVersion | null;
  pack: PackLink;
  noPack: string | null;
};

export type { PackDetailsProps };
