/* @layer renderer-stores @kind logic */
import type { IpcApi } from '@drizztdourden08/brock-core';
import { hostApi } from '@drizztdourden08/brock-react';

const signOutOfHub = async (): Promise<void> => {
  const api: Partial<IpcApi> | null = hostApi();
  if (api?.hubSignOut) await api.hubSignOut();
};

export { signOutOfHub };
