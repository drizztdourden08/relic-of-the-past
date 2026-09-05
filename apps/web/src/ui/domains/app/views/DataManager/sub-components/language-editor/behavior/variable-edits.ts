/* @layer renderer-components @kind logic */
/**
 * One variable's value written back into the pair the set stores (glossary
 * and name table). `kind` says which; an engine variable has no stored value
 * and is refused. The key shapes mirror `variables/from-legacy.ts` exactly
 * (`bottle-<content>`, `label-<section>`, anything else is an item), so a
 * round trip is byte-identical.
 */
import type { Variable } from '@shared/game/language';
import type { PauseLabelKey } from '@shared/game/language';
import type { NameEdit } from '../language-editor.type';

const kBottlePrefix = 'bottle-';
const kLabelPrefix = 'label-';

/** `bottle-7` -> 7, and null for anything that is not that shape. */
const bottleContentOf = (key: string): number | null => {
  if (!key.startsWith(kBottlePrefix)) return null;
  const digits = key.slice(kBottlePrefix.length);
  return /^\d+$/.test(digits) ? Number(digits) : null;
};

/** The name-table write one menu-name key stands for. */
const nameEditFor = (key: string, value: string): NameEdit => {
  const content = bottleContentOf(key);
  if (content !== null) return { group: 'bottles', key: content, value };
  if (key.startsWith(kLabelPrefix)) {
    return { group: 'labels', key: key.slice(kLabelPrefix.length) as PauseLabelKey, value };
  }
  return { group: 'items', key, value };
};

/** True when this variable's value is the translator's to change. */
const isEditable = (variable: Variable): boolean => !variable.locked && variable.value !== null;

export { bottleContentOf, isEditable, nameEditFor };
