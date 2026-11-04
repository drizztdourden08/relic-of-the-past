/* @layer shared-storage @kind logic */
import { kindDir, msuSidecarPath, saveStem } from '@rotp/game-core';
import type { SaveKind } from '@rotp/game-core';

const alttpResumePath = (profile: string, slotKind: string, slotId: string | number): string => {
  const kind = slotKind as SaveKind;
  return msuSidecarPath(kindDir(profile, kind), saveStem(kind, slotId));
};

export { alttpResumePath };
