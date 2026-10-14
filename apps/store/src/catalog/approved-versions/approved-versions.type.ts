/* @layer store-site @kind types */
import type { Review, StoreVersion } from '@rotp/hub-contracts';

type ProjectedVersion = Omit<StoreVersion, 'review'> & { review?: Review | null; approvedAt?: number | null };

export type { ProjectedVersion };
