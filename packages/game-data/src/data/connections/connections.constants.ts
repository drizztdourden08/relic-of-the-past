/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { ConnectionRecord } from '../types';

const files = import.meta.glob('../records/connections/**/*.ts', { eager: true });

const ALL_CONNECTIONS: ConnectionRecord[] = recordsIn<ConnectionRecord>(files);

export { ALL_CONNECTIONS };
