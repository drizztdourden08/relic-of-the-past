/* @layer store-site @kind types */
import type { PackLink } from '../../../pack-link/pack-link.type';

type LivePack = {
  pack: PackLink;
  noPack: string | null;
};

export type { LivePack };
