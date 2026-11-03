/* @layer renderer-lib @kind logic */
import { readConfig as readStoredConfig } from '@drizztdourden08/brock-react';
import { queueConfig } from './queue-config';

const readConfig = (id: string): Promise<Record<string, unknown> | null> => queueConfig(id, () => readStoredConfig(id));

export { readConfig };
