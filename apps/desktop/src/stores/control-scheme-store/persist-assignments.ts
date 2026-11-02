/* @layer renderer-stores @kind logic */
import { getProfileId } from '@rotp/game-core';
import { updateConfig } from '@app/storage/profile-store';
import { errorMessage } from '@app/storage/error-message';
import { log } from '@app/log-bus';
import type { Assignments } from './control-scheme-store.type';

const persistAssignments = (assignments: Assignments): void => {
  const id = getProfileId();
  if (!id) return;
  void updateConfig(id, (config) => ({ ...config, modernScheme: { assignments } }))
    .catch((e: unknown) => log.error(`[controls] failed to persist slot assignments: ${errorMessage(e)}`));
};

export { persistAssignments };
