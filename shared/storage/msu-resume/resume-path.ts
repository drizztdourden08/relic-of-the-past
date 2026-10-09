/* @layer shared-storage @kind logic */
import { kindDir, msuSidecarPath, saveStem } from '@rotp/game-core';
import type { SaveKind } from '@rotp/game-core';

const resumePath = (profile: string, kind: SaveKind, id: string | number): string =>
  msuSidecarPath(kindDir(profile, kind), saveStem(kind, id));

export { resumePath };
