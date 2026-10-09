/* @layer renderer-app @kind types */
import type { EventContract, InvokeContract, IpcNamespaces, SendContract } from '@drizztdourden08/brock-core/augment';
import type { EventContractOf, InvokeContractOf, SendContractOf } from '@drizztdourden08/brock-core/ipc';
import type { NamespacedEventContract, NamespacedInvokeContract, RotpNamespaces } from './namespaces.type';
import type { APP_CHANNELS } from './contract.constants';

declare module '@drizztdourden08/brock-core/augment' {
  interface InvokeContract extends InvokeContractOf<typeof APP_CHANNELS>, NamespacedInvokeContract {}
  interface SendContract extends SendContractOf<typeof APP_CHANNELS> {}
  interface EventContract extends EventContractOf<typeof APP_CHANNELS>, NamespacedEventContract {}
  interface IpcNamespaces extends RotpNamespaces {}
}

export type { EventContract, InvokeContract, IpcNamespaces, SendContract };
