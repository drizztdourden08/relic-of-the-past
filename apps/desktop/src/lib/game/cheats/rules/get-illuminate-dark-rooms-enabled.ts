/* @layer bridge-wasm @kind logic */
import { cheatRuleState } from './cheat-rule-state';

const getIlluminateDarkRoomsEnabled = (): boolean => cheatRuleState.illuminateDarkRoomsEnabled;

export { getIlluminateDarkRoomsEnabled };
