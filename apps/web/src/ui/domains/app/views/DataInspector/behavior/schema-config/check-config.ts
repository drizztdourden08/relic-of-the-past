/* @layer renderer-app @kind data */
/**
 * Why this override exists: twelve derived top-level fields, of which four are
 * deep unions (`gameId`, `requirements`, `presence`) or free prose
 * (`sourceFunc`, `visualNote`) that mean nothing at a glance. The default
 * column set is the one a reader scans by — what it is, where it is, what it
 * holds.
 */
import type { SchemaConfig } from '@ds/data';

const CHECK_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'kind', 'screenId', 'dungeonId', 'vanillaItemIds'],
};

export { CHECK_CONFIG };
