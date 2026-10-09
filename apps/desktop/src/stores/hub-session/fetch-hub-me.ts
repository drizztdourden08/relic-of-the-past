/* @layer renderer-stores @kind logic */
import type { HubMe } from '@shared/ipc';
import { appApi } from '@app/ipc/app-api';
import type { AppApi } from '@app/ipc/app-api.type';

const fetchHubMe = async (): Promise<HubMe | null> => {
  const api = appApi() as Partial<AppApi> | undefined;
  return api?.hubMe ? api.hubMe() : null;
};

export { fetchHubMe };
