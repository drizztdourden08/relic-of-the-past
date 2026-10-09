/* @layer store-site @kind types */
import type { PackSource } from '@domains/packs/pack-source.type';
import type { PackLinkResponse } from '@shared/store/api-types';
import type { RenewLink } from './range-pack-source/range-pack-source.type';

type LinkResult = { load: RenewLink; link: PackLinkResponse | null; error: string | null };

type PackLink = {
  source: PackSource | null;
  error: string | null;
  loading: boolean;
};

export type { LinkResult, PackLink };
