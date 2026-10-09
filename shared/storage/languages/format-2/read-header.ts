/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readJson } from '@drizztdourden08/brock-core';
import { setMetaPath } from '../paths';

const readHeader = (files: FileStore, id: string): Promise<Record<string, unknown>> =>
  readJson<Record<string, unknown>>(files, setMetaPath(id), {});

export { readHeader };
