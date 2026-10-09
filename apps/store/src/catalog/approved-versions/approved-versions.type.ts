/* @layer store-site @kind types */
import type { StoreVersion } from '@rotp/hub-contracts';

type ProjectedVersion = StoreVersion & { approvedAt?: number | null };

export type { ProjectedVersion };
