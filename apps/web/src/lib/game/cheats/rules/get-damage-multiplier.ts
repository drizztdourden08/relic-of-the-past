/* @layer bridge-wasm @kind logic */
import { cheatRuleState } from './cheat-rule-state';

const getDamageMultiplier = (): number => cheatRuleState.damageMultiplier;

export { getDamageMultiplier };
