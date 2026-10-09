/* @layer renderer-stores @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { AppApi } from '@app/ipc/app-api.type';

const signOutOfHub = async (): Promise<void> => {
  const api = appApi() as Partial<AppApi> | undefined;
  if (api?.hubSignOut) await api.hubSignOut();
};

export { signOutOfHub };
