/* @layer store-site @kind types */
import type { StoreKind } from '@rotp/hub-contracts';
import type { PackLink } from '../../lib/pack-link/usePackLink.type';

type PackContentsPanelProps = {
  kind: StoreKind;
  pack: PackLink;
  noPack: string | null;
  note?: string | null;
  className?: string;
};

export type { PackContentsPanelProps };
