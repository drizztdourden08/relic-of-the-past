/* @layer renderer-app @kind data */
/**
 * Why this override exists: `gameId` and `clearedBy` are nested shapes that
 * read as a one-line summary in a cell and tell a reader nothing, while
 * `effect` is the field that actually distinguishes two rows of the same kind.
 * Column choice only — the derived order is already right for the editor.
 */
import type { SchemaConfig } from '@ds/data';

const ACTOR_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'kind', 'effect'],
  // Same hex convention as SCREEN_CONFIG — a native sprite type byte, not a room id.
  formats: { 'gameId.spriteType': 'hex2' },
};

export { ACTOR_CONFIG };
