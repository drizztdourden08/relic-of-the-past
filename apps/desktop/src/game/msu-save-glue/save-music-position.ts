/* @layer bridge-wasm @kind logic */
import type { SaveKind } from '@rotp/game-core';
import * as msuStore from '../../storage/msu-store';
import { msuSnapshot } from '../msu-session';
import { log } from '../../log-bus';

const saveMusicPosition = async (profileId: string, kind: SaveKind, id: string | number): Promise<void> => {
  try {
    const position = msuSnapshot();
    if (position) await msuStore.writeMsuResume(profileId, kind, id, position);
    else await msuStore.deleteMsuResume(profileId, kind, id);
  } catch (err) {
    log.app(`[MSU] Could not store music position: ${err instanceof Error ? err.message : err}`);
  }
};

export { saveMusicPosition };
