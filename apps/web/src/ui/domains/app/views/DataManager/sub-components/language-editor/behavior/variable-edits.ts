/* @layer renderer-components @kind logic */
/**
 * One variable's value, written back into the pair the set actually stores.
 *
 * The set persists a glossary and a name table and rebuilds its variable list
 * from them, so an edit made against the list has to land in whichever of the
 * two the variable came from. `kind` says which: a term is a glossary row, a
 * menu name is one of the three name-table groups, and an engine variable has
 * no stored value at all — the running game supplies it, so an edit to one is
 * refused rather than written somewhere it would be ignored.
 *
 * The key shapes mirror the projection exactly (`variables/from-legacy.ts`):
 * `bottle-<content>` and `label-<section>` name their group, and anything else
 * is an item. Reversing them here rather than guessing keeps a round trip
 * through the tables byte-identical.
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
