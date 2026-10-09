/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import { registerCheatRule, rememberCheatRule } from '../../cheat-rules-memory';
import { cheatRuleState } from './cheat-rule-state';

const cheatSetIgnoreCollision = (on: boolean): void => {
  cheatRuleState.ignoreCollisionEnabled = on;
  rememberCheatRule('noWalls', on);
  voidCall('WasmCheatSetIgnoreCollision', numArgs(on ? 1 : 0));
};

registerCheatRule('noWalls', (v) => cheatSetIgnoreCollision(v === true));

export { cheatSetIgnoreCollision };
