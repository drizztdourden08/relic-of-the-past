/* @layer store-site @kind types */
import type { StoreKind } from '@shared/store/types';
import type { PackLink } from '../../lib/pack-link/usePackLink.type';

type PackContentsPanelProps = {
  kind: StoreKind;
  pack: PackLink;
  noPack: string | null;
  note?: string | null;
  className?: string;
};

export type { PackContentsPanelProps };
