/* @layer bridge-wasm @kind logic */
import type { SaveKind } from '@rotp/game-core';
import * as msuStore from '../../storage/msu-store';
import { msuRestore } from '../msu-session';
import { log } from '../../log-bus';

const restoreMusicPosition = async (profileId: string, kind: SaveKind, id: string | number): Promise<void> => {
  try {
    const position = await msuStore.readMsuResume(profileId, kind, id);
    if (position) msuRestore(position);
  } catch (err) {
    log.app(`[MSU] Could not restore music position: ${err instanceof Error ? err.message : err}`);
  }
};

export { restoreMusicPosition };
