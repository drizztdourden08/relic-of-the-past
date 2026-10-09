/* @layer shared-storage @kind logic */
import { kindDir, msuSidecarPath, saveStem } from '../save-paths';
import type { SaveKind } from '../save-paths';

const resumePath = (profile: string, kind: SaveKind, id: string | number): string =>
  msuSidecarPath(kindDir(profile, kind), saveStem(kind, id));

export { resumePath };
