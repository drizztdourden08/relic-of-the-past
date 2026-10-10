/* @layer store-site @kind types */
import type { PackLinkResponse } from '@rotp/hub-contracts';

type RenewLink = () => Promise<PackLinkResponse>;

export type { RenewLink };
