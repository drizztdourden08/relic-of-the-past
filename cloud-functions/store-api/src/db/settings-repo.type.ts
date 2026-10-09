/* @layer store-api @kind types */
import type { Person } from '../../../../shared/store/types';

type FeaturedSettings = { itemIds: string[]; updatedBy: Person; updatedAt: number };

export type { FeaturedSettings };
