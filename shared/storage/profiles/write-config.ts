/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { configFile } from './config-file';

const writeConfig = (files: FileStore, id: string, settings: Record<string, unknown>): Promise<void> =>
  writeJson(files, configFile(id), settings);

export { writeConfig };
