/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { writeJson } from '@drizztdourden08/brock-core';
import { configFile } from './config-file';

const writeConfig = (files: FileStore, id: string, settings: Record<string, unknown>): Promise<void> =>
  writeJson(files, configFile(id), settings);

export { writeConfig };
