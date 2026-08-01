/* @layer shared-game @kind data */
import type { ConnectionRecord } from '../types';
import { DARK_WORLD_CONNECTIONS } from './dark-world';
import { LIGHT_WORLD_CONNECTIONS } from './light-world';

const ALL_CONNECTIONS: ConnectionRecord[] = [
  ...DARK_WORLD_CONNECTIONS,
  ...LIGHT_WORLD_CONNECTIONS,
];

export { ALL_CONNECTIONS };
