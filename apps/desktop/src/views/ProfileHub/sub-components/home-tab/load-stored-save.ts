/* @layer renderer-components @kind logic */
import { loadStateFromBuffer } from '@app/game';
import { restoreMusicPosition } from '@app/game/msu-save-glue';
import { log } from '@app/log-bus';
import type { StoredSaveKind } from './home-tab.type';

const loadStoredSave = async (profileId: string, kind: StoredSaveKind, id: string, buffer: ArrayBuffer): Promise<boolean> => {
  log.app(`Loading ${kind} save: ${id}`);
  if (!loadStateFromBuffer(buffer)) return false;
  await restoreMusicPosition(profileId, kind, id);
  return true;
};

export { loadStoredSave };
