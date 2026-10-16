/* @layer renderer-appshell @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { BeforeProfileRemove } from '@drizztdourden08/brock-react';

const stopGameBeforeRemove = (stopGame: () => Promise<void>): BeforeProfileRemove => async (doomed) => {
  if (useProfilesStore.getState().active?.id === doomed.id) await stopGame();
  return true;
};

export { stopGameBeforeRemove };
