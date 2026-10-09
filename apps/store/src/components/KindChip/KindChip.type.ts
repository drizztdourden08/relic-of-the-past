/* @layer store-site @kind types */
import type { StoreKind } from '@rotp/hub-contracts';

type KindChipProps = {
  kind: StoreKind;
  detail?: string;
};

export type { KindChipProps };
