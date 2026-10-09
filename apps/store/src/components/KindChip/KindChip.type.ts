/* @layer store-site @kind types */
import type { StoreKind } from '@shared/store/types';

type KindChipProps = {
  kind: StoreKind;
  detail?: string;
};

export type { KindChipProps };
