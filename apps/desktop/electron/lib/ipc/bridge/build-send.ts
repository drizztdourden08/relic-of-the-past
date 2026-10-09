/* @layer electron-main @kind logic */
import type { SendContract } from '@shared/ipc';
import { send } from './send';

const buildSend = <M extends Record<string, keyof SendContract>>(map: M): { [K in keyof M]: SendContract[M[K]] } =>
  Object.fromEntries(
    Object.entries(map).map(([method, channel]) => [method, (...args: unknown[]) => send(channel as keyof SendContract, ...(args as never))]),
  ) as never;

export { buildSend };
