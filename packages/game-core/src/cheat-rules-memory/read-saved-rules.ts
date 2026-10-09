/* @layer bridge-wasm @kind logic */
import type { RuleValue } from './cheat-rules-memory.type';
import { STORAGE_KEY } from './cheat-rules-memory.constants';

const readSavedRules = (): Record<string, RuleValue> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed as Record<string, RuleValue> : {};
  } catch {
    return {};
  }
};

export { readSavedRules };
