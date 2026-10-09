/* @layer renderer-lib @kind logic */
import { writeConfig as writeStoredConfig } from '@drizztdourden08/brock-react';

const writeConfig = (id: string, settings: Record<string, unknown>): Promise<void> => writeStoredConfig(id, settings);

export { writeConfig };
