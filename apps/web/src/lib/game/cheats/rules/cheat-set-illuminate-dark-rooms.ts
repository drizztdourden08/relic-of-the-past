/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import { registerCheatRule, rememberCheatRule } from '../../cheat-rules-memory';
import { cheatRuleState } from './cheat-rule-state';

const cheatSetIlluminateDarkRooms = (on: boolean): void => {
  cheatRuleState.illuminateDarkRoomsEnabled = on;
  rememberCheatRule('litRooms', on);
  voidCall('WasmCheatSetIlluminateDarkRooms', numArgs(on ? 1 : 0));
};

registerCheatRule('litRooms', (v) => cheatSetIlluminateDarkRooms(v === true));

export { cheatSetIlluminateDarkRooms };
