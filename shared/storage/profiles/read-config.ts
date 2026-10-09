/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { configFile } from './config-file';

const readConfig = (files: FileStore, id: string): Promise<Record<string, unknown> | null> =>
  readJson<Record<string, unknown> | null>(files, configFile(id), null);

export { readConfig };
