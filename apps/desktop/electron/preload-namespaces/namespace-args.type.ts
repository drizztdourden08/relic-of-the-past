/* @layer electron-preload @kind types */
import type { EventContract, InvokeContract } from '@drizztdourden08/brock-core/augment';

type InvokeArg<K extends keyof InvokeContract> = Parameters<InvokeContract[K]>[0];

type EventCallback<K extends keyof EventContract> = EventContract[K];

export type { EventCallback, InvokeArg };
