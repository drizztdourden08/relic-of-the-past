/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import { registerCheatRule, rememberCheatRule } from '../../cheat-rules-memory';
import { MAX_DAMAGE_MULTIPLIER, MIN_DAMAGE_MULTIPLIER } from '../cheats.constants';
import { cheatRuleState } from './cheat-rule-state';

const cheatSetDamageMultiplier = (mult: number): void => {
  cheatRuleState.damageMultiplier = Math.max(MIN_DAMAGE_MULTIPLIER, Math.min(MAX_DAMAGE_MULTIPLIER, mult));
  rememberCheatRule('damageDealt', cheatRuleState.damageMultiplier);
  voidCall('WasmCheatSetDamageMultiplier', numArgs(cheatRuleState.damageMultiplier));
};

registerCheatRule('damageDealt', (v) => cheatSetDamageMultiplier(Number(v)));

export { cheatSetDamageMultiplier };
