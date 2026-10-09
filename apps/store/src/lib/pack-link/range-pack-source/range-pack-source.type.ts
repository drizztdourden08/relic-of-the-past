/* @layer store-site @kind types */
import type { PackLinkResponse } from '@shared/store/api-types';

type RenewLink = () => Promise<PackLinkResponse>;

export type { RenewLink };
