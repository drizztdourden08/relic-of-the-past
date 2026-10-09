/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { createManifestSaves } from '../../save-manifest';
import { savesDir } from '../../save-paths';
import type { AutoEntry } from '../saves.type';

const autoSaves = (files: FileStore, p: string) => createManifestSaves<AutoEntry>(files, `${savesDir(p)}/auto`);

export { autoSaves };
