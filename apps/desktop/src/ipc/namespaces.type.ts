/* @layer renderer-app @kind types */
import type {
  EventContract as RotpEvent, InvokeContract as RotpInvoke, ScreenEditorApi, ShadowCastingApi,
} from '@shared/ipc';

type NamespacedChannel = `shadow-casting:${string}` | `screenEditor:${string}`;

type NamespacedInvokeContract = { [K in keyof RotpInvoke as K extends NamespacedChannel ? K : never]: RotpInvoke[K] };

type NamespacedEventContract = { [K in keyof RotpEvent as K extends NamespacedChannel ? K : never]: RotpEvent[K] };

interface RotpNamespaces {
  shadowCasting: ShadowCastingApi;
  screenEditor: ScreenEditorApi;
}

export type { NamespacedEventContract, NamespacedInvokeContract, RotpNamespaces };
