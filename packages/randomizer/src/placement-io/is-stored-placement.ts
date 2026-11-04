/* @layer renderer-lib @kind logic */
import { isStoredPlacement as isSchemaPlacement } from '@drizztdourden08/brock-randomizer/world';
import type { StoredPlacement } from './randomizer-placement-io.type';
import { PLACEMENT_SCHEMAS } from './randomizer-placement-io.constants';

const isStoredPlacement = (raw: unknown): raw is StoredPlacement =>
  isSchemaPlacement<StoredPlacement>(raw, PLACEMENT_SCHEMAS);

export { isStoredPlacement };
