/* @layer electron-main @kind logic */
import type { EventContract } from '@shared/ipc';
import { subscribe } from './subscribe';

const buildEvents = <M extends Record<string, keyof EventContract>>(map: M): { [K in keyof M]: (cb: EventContract[M[K]]) => () => void } =>
  Object.fromEntries(
    Object.entries(map).map(([method, channel]) => [method, (cb: EventContract[keyof EventContract]) => subscribe(channel as keyof EventContract, cb as never)]),
  ) as never;

export { buildEvents };
