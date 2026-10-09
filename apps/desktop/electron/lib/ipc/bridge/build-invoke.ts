/* @layer electron-main @kind logic */
import type { InvokeContract } from '@shared/ipc';
import { invoke } from './invoke';

const buildInvoke = <M extends Record<string, keyof InvokeContract>>(map: M): { [K in keyof M]: InvokeContract[M[K]] } =>
  Object.fromEntries(
    Object.entries(map).map(([method, channel]) => [method, (...args: unknown[]) => invoke(channel as keyof InvokeContract, ...(args as never))]),
  ) as never;

export { buildInvoke };
