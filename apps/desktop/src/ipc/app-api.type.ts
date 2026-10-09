/* @layer renderer-app @kind types */
import type { BASE_EVENT_MAP, BASE_INVOKE_MAP, BASE_SEND_MAP, IpcApi } from '@drizztdourden08/brock-core';
import type { APP_EVENT_MAP, APP_INVOKE_MAP, APP_SEND_MAP } from './contract.constants';

interface SpritesUrlApi {
  getSpritesBaseUrl: (romFile: string) => string;
}

type AppApi = IpcApi<
  typeof BASE_INVOKE_MAP & typeof APP_INVOKE_MAP,
  typeof BASE_SEND_MAP & typeof APP_SEND_MAP,
  typeof BASE_EVENT_MAP & typeof APP_EVENT_MAP
> & SpritesUrlApi;

export type { AppApi, SpritesUrlApi };
