/* @layer bridge-wasm @kind logic */
import { wasmGetFramesRun } from '@rotp/game-core';
import { appendEvent } from './append-event';

const logLocationChecked = (id: number, name: string): void =>
  appendEvent({ t: 'location-checked', id, name, frame: wasmGetFramesRun() });

export { logLocationChecked };
