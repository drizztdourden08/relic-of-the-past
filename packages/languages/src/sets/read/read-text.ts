/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { TextOverrides } from '../../messages';
import { readJson } from '@drizztdourden08/brock-core';
import { textPath } from '../paths';

const readText = (files: FileStore, id: string): Promise<TextOverrides> =>
  readJson<TextOverrides>(files, textPath(id), {});

export { readText };
