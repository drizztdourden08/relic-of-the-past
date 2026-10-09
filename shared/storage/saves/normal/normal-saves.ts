/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { createManifestSaves } from '../../save-manifest';
import { savesDir } from '../../save-paths';
import type { NormalEntry } from '../saves.type';

const normalSaves = (files: FileStore, p: string) => createManifestSaves<NormalEntry>(files, `${savesDir(p)}/normal`);

export { normalSaves };
