/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readJson } from '@drizztdourden08/brock-core';
import { configFile } from './config-file';

const readConfig = (files: FileStore, id: string): Promise<Record<string, unknown> | null> =>
  readJson<Record<string, unknown> | null>(files, configFile(id), null);

export { readConfig };
