/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { ConnectionRecord } from '../types';

// One entry per world. Empty without vault access — see collect-records.ts.
const worlds = import.meta.glob('../records/connections/*/index.ts', { eager: true });

const ALL_CONNECTIONS: ConnectionRecord[] = collectRecords<ConnectionRecord>(worlds);

export { ALL_CONNECTIONS };
