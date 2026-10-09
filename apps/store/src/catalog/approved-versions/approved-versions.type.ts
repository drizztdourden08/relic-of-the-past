/* @layer store-site @kind types */
import type { StoreVersion } from '@shared/store/types';

type ProjectedVersion = StoreVersion & { approvedAt?: number | null };

export type { ProjectedVersion };
