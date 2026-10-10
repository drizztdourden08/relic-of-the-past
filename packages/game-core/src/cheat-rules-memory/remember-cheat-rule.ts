/* @layer bridge-wasm @kind logic */
import type { RuleValue } from './cheat-rules-memory.type';
import { STORAGE_KEY } from './cheat-rules-memory.constants';
import { readSavedRules } from './read-saved-rules';

const rememberCheatRule = (key: string, value: RuleValue): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSavedRules(), [key]: value })); } catch {  }
};

export { rememberCheatRule };
