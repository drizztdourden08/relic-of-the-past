/* @layer renderer-lib @kind logic */
import { readConfig as readStoredConfig } from '@drizztdourden08/brock-react';

const readConfig = (id: string): Promise<Record<string, unknown> | null> => readStoredConfig(id);

export { readConfig };
