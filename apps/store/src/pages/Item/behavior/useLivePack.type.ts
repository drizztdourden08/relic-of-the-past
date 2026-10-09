/* @layer store-site @kind types */
import type { PackLink } from '../../../lib/pack-link/usePackLink';

type LivePack = {
  pack: PackLink;
  noPack: string | null;
};

export type { LivePack };
