/* @layer bridge-wasm @kind logic */
import { wasmGetFramesRun } from '@rotp/game-core';
import { appendEvent } from './append-event';

const logLocationChecked = (id: number, name: string): void =>
  appendEvent({ t: 'location-checked', id, name, frame: wasmGetFramesRun() });

const logItemReceived = (id: number, name: string, from: string, self: boolean): void =>
  appendEvent({ t: 'item-received', id, name, from, self, frame: wasmGetFramesRun() });

const logConnected = (slot: string, server: string): void => appendEvent({ t: 'connected', slot, server });

const logDisconnected = (reason: string): void => appendEvent({ t: 'disconnected', reason });

export { logConnected, logDisconnected, logItemReceived, logLocationChecked };
