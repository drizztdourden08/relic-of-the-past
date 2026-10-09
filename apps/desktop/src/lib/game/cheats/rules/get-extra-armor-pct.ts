/* @layer bridge-wasm @kind logic */
import { cheatRuleState } from './cheat-rule-state';

const getExtraArmorPct = (): number => cheatRuleState.extraArmorPct;

export { getExtraArmorPct };
