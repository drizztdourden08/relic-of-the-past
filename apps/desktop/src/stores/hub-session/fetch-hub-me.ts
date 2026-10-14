/* @layer renderer-stores @kind logic */
import type { IpcApi } from '@drizztdourden08/brock-core';
import { hostApi } from '@drizztdourden08/brock-react';
import type { HubMe } from '@app/ipc';

const fetchHubMe = async (): Promise<HubMe | null> => {
  const api: Partial<IpcApi> | null = hostApi();
  return api?.hubMe ? api.hubMe() : null;
};

export { fetchHubMe };
