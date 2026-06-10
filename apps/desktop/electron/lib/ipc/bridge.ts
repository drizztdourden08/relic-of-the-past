/* @layer electron-main @kind logic */
/**
 * Typed preload IPC primitives + factories. `invoke`/`send`/`subscribe` are
 * channel-keyed; `buildInvoke`/`buildSend`/`buildEvents` generate the flat
 * friendly `window.api` methods straight from the join maps, so no channel
 * literal is written per method. One localized cast bridges the untyped
 * `ipcRenderer` surface.
 */
import { ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { InvokeContract, SendContract, EventContract } from '@shared/ipc';

const invoke = <K extends keyof InvokeContract>(channel: K, ...args: Parameters<InvokeContract[K]>): ReturnType<InvokeContract[K]> =>
  ipcRenderer.invoke(channel, ...args) as ReturnType<InvokeContract[K]>;

const send = <K extends keyof SendContract>(channel: K, ...args: Parameters<SendContract[K]>): void => {
  ipcRenderer.send(channel, ...args);
};

const subscribe = <K extends keyof EventContract>(channel: K, callback: EventContract[K]): (() => void) => {
  const handler = (_event: IpcRendererEvent, ...args: Parameters<EventContract[K]>): void =>
    (callback as (...a: Parameters<EventContract[K]>) => void)(...args);
  ipcRenderer.on(channel, handler);
  return () => { ipcRenderer.removeListener(channel, handler); };
};

const buildInvoke = <M extends Record<string, keyof InvokeContract>>(map: M): { [K in keyof M]: InvokeContract[M[K]] } =>
  Object.fromEntries(
    Object.entries(map).map(([method, channel]) => [method, (...args: unknown[]) => invoke(channel as keyof InvokeContract, ...(args as never))]),
  ) as never;

const buildSend = <M extends Record<string, keyof SendContract>>(map: M): { [K in keyof M]: SendContract[M[K]] } =>
  Object.fromEntries(
    Object.entries(map).map(([method, channel]) => [method, (...args: unknown[]) => send(channel as keyof SendContract, ...(args as never))]),
  ) as never;

const buildEvents = <M extends Record<string, keyof EventContract>>(map: M): { [K in keyof M]: (cb: EventContract[M[K]]) => () => void } =>
  Object.fromEntries(
    Object.entries(map).map(([method, channel]) => [method, (cb: EventContract[keyof EventContract]) => subscribe(channel as keyof EventContract, cb as never)]),
  ) as never;

export { invoke, send, subscribe, buildInvoke, buildSend, buildEvents };
