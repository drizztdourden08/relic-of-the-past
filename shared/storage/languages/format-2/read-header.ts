/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../../json';
import { setMetaPath } from '../paths';

const readHeader = (files: FileStore, id: string): Promise<Record<string, unknown>> =>
  readJson<Record<string, unknown>>(files, setMetaPath(id), {});

export { readHeader };
