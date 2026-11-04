/* @layer renderer-app @kind logic */
import { PLACEMENT_SCHEMA, isStoredPlacement } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';

const lacksSchema = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === 'object' && raw !== null && !('schema' in raw);

const isRotpPlacement = (raw: unknown): raw is Placement =>
  isStoredPlacement(raw) || (lacksSchema(raw) && isStoredPlacement({ ...raw, schema: PLACEMENT_SCHEMA }));

export { isRotpPlacement };
