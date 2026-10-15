/* @layer electron-preload @kind types */
import type { InvokeContract } from '@drizztdourden08/brock-core/augment';

type InvokeArg<K extends keyof InvokeContract> = Parameters<InvokeContract[K]>[0];

export type { InvokeArg };
