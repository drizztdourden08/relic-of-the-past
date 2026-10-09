/* @layer renderer-lib @kind types */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { PLACEMENT_SCHEMA } from './randomizer-placement-io.constants';

type StoredPlacement = Placement & { schema: typeof PLACEMENT_SCHEMA };

export type { StoredPlacement };
