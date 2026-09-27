/* @layer shared-game @kind data */
import { recordsIn } from '../registry';
import type { ConnectionRecord } from '../types';

// Every record file in the tree, at the same paths screens uses.
const files = import.meta.glob('../records/connections/**/*.ts', { eager: true });

const ALL_CONNECTIONS: ConnectionRecord[] = recordsIn<ConnectionRecord>(files);

export { ALL_CONNECTIONS };
