/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import { registerCheatRule, rememberCheatRule } from '../../cheat-rules-memory';
import { MAX_EXTRA_ARMOR_PCT, MIN_EXTRA_ARMOR_PCT } from '../cheats.constants';
import { cheatRuleState } from './cheat-rule-state';

const cheatSetExtraArmorPct = (pct: number): void => {
  cheatRuleState.extraArmorPct = Math.max(MIN_EXTRA_ARMOR_PCT, Math.min(MAX_EXTRA_ARMOR_PCT, pct));
  rememberCheatRule('damageTaken', cheatRuleState.extraArmorPct);
  voidCall('WasmCheatSetExtraArmorPct', numArgs(cheatRuleState.extraArmorPct));
};

registerCheatRule('damageTaken', (v) => cheatSetExtraArmorPct(Number(v)));

export { cheatSetExtraArmorPct };
