/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import type { CapacityKind } from '../cheats.type';
import { CAPACITY_KIND } from '../cheats.constants';

const cheatSetCapacityRung = (kind: CapacityKind, rung: number): void =>
  voidCall('WasmCheatSetCapacityRung', numArgs(CAPACITY_KIND[kind], rung));

export { cheatSetCapacityRung };
