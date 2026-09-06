/* @layer renderer-components @kind logic */
/**
 * Id-to-term translation for a referenced tag list, built from the injected
 * reference options. An id with no option resolves to itself on purpose: a
 * dangling or just-created reference is a real state, and the raw id says so.
 */
import type { IdRefOption } from '../../field-kits/registry';

interface TagKeyMap {
  /** The term an id stands for, or the id itself when nothing resolves it. */
  keyOfId: (id: string) => string;
  /** The id a term resolves to, or undefined when the vocabulary has no such term. */
  idOfKey: (key: string) => string | undefined;
}

const buildTagKeyMap = (options: readonly IdRefOption[]): TagKeyMap => {
  const keys = new Map<string, string>();
  const ids = new Map<string, string>();
  for (const option of options) {
    keys.set(option.value, option.label);
    ids.set(option.label, option.value);
  }
  return {
    keyOfId: (id) => keys.get(id) ?? id,
    idOfKey: (key) => ids.get(key),
  };
};

export { buildTagKeyMap };
export type { TagKeyMap };
