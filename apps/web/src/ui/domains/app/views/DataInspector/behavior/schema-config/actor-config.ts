/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@ds/data';

const ACTOR_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'kind', 'effect'],
  formats: { 'gameId.spriteType': 'hex2' },
};

export { ACTOR_CONFIG };
