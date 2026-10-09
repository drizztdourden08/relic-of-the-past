/* @layer store-api @kind types */
import type { Person } from '@rotp/hub-contracts';

type FeaturedSettings = { itemIds: string[]; updatedBy: Person; updatedAt: number };

export type { FeaturedSettings };
