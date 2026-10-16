/* @layer renderer-components @kind logic */
import { loadStateFromBuffer } from '@app/game';
import { restoreMusicPosition } from '@app/game/msu-save-glue';
import { log } from '@app/log-bus';
import { STORED_SAVE_READERS } from './load-stored-save.constants';

const loadStoredSave = async (profileId: string, kind: keyof typeof STORED_SAVE_READERS, id: string): Promise<boolean> => {
  log.app(`Loading ${kind} save: ${id}`);
  const buffer = await STORED_SAVE_READERS[kind](profileId, id);
  if (!buffer || !loadStateFromBuffer(buffer)) return false;
  await restoreMusicPosition(profileId, kind, id);
  return true;
};

export { loadStoredSave };
