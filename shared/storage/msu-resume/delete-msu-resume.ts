/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { SaveKind } from '../save-paths';
import { resumePath } from './resume-path';

const deleteMsuResume = (files: FileStore, profile: string, kind: SaveKind, id: string | number): Promise<void> =>
  files.remove(resumePath(profile, kind, id));

export { deleteMsuResume };
