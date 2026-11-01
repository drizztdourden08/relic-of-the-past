/* @layer bridge-wasm @kind logic */
import { wasmGetFramesRun } from '@rotp/game-core';
import { appendEvent } from './append-event';

const logItemReceived = (id: number, name: string, from: string, self: boolean): void =>
  appendEvent({ t: 'item-received', id, name, from, self, frame: wasmGetFramesRun() });

export { logItemReceived };
