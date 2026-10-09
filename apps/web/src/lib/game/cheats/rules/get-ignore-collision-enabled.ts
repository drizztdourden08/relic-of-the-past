/* @layer bridge-wasm @kind logic */
import { cheatRuleState } from './cheat-rule-state';

const getIgnoreCollisionEnabled = (): boolean => cheatRuleState.ignoreCollisionEnabled;

export { getIgnoreCollisionEnabled };
