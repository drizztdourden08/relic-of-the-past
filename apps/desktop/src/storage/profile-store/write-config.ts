/* @layer renderer-lib @kind logic */
import { writeConfig as writeStoredConfig } from '@drizztdourden08/brock-react';
import { queueConfig } from './queue-config';

const writeConfig = (id: string, settings: Record<string, unknown>): Promise<void> =>
  queueConfig(id, () => writeStoredConfig(id, settings));

export { writeConfig };
