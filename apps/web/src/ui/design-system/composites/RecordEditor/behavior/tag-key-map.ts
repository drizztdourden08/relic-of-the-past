/* @layer renderer-components @kind logic */
/**
 * The translation a referenced tag list needs, both ways.
 *
 * The record stores ids; a person edits terms. The injected reference lookup
 * already hands back both halves for every record in the vocabulary — the id as
 * the option's value, the term as its label — so nothing new has to be
 * supplied and this package still knows nothing about what a tag IS.
 *
 * An id with no option resolves to itself. That is deliberate: a reference to a
 * record the lookup has not got is a real state (a term created moments ago, or
 * a dangling id), and showing the raw id says so instead of hiding it.
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
