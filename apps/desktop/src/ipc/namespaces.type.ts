/* @layer renderer-app @kind types */
import type { ChannelApi } from '@drizztdourden08/brock-core';
import type {
  EventContract as RotpEvent, InvokeContract as RotpInvoke, ScreenEditorApi, ShadowCastingApi,
} from '@app/ipc';
import type { APP_CHANNELS } from './contract.constants';
import type { SpritesUrlApi } from './sprites-url-api.type';

type NamespacedChannel = `shadow-casting:${string}` | `screenEditor:${string}`;

type NamespacedInvokeContract = { [K in keyof RotpInvoke as K extends NamespacedChannel ? K : never]: RotpInvoke[K] };

type NamespacedEventContract = { [K in keyof RotpEvent as K extends NamespacedChannel ? K : never]: RotpEvent[K] };

type RotpChannelApi = ChannelApi<typeof APP_CHANNELS>;

interface RotpNamespaces extends RotpChannelApi, SpritesUrlApi {
  shadowCasting: ShadowCastingApi;
  screenEditor: ScreenEditorApi;
}

export type { NamespacedEventContract, NamespacedInvokeContract, RotpNamespaces };
