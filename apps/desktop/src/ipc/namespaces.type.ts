/* @layer renderer-app @kind types */
import type {
  EventContract as RotpEvent, InvokeContract as RotpInvoke, ScreenEditorApi, ShadowCastingApi, UpdaterApi,
} from '@shared/ipc';

type NamespacedChannel = `updater:${string}` | `shadow-casting:${string}` | `screenEditor:${string}`;

type NamespacedInvokeContract = { [K in keyof RotpInvoke as K extends NamespacedChannel ? K : never]: RotpInvoke[K] };

type NamespacedEventContract = { [K in keyof RotpEvent as K extends NamespacedChannel ? K : never]: RotpEvent[K] };

interface RotpNamespaces {
  updater: UpdaterApi;
  shadowCasting: ShadowCastingApi;
  screenEditor: ScreenEditorApi;
}

export type { NamespacedEventContract, NamespacedInvokeContract, RotpNamespaces };
