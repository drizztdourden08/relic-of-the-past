/* @layer renderer-lib @kind logic */
import { readConfig as readStoredConfig, writeConfig as writeStoredConfig } from '@drizztdourden08/brock-react';
import type { ConfigChange } from './update-config.type';
import { queueConfig } from './queue-config';

const updateConfig = (id: string, change: ConfigChange): Promise<void> =>
  queueConfig(id, async () => {
    await writeStoredConfig(id, change((await readStoredConfig(id)) ?? {}));
  });

export { updateConfig };
