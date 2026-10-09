/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import type { DungeonItemKind } from '../cheats.type';
import { DUNGEON_ITEM_KIND } from '../cheats.constants';

const cheatSetDungeonItem = (kind: DungeonItemKind, palaceIndexX2: number, on: boolean): void =>
  voidCall('WasmCheatSetDungeonItem', numArgs(DUNGEON_ITEM_KIND[kind], palaceIndexX2, on ? 1 : 0));

export { cheatSetDungeonItem };
