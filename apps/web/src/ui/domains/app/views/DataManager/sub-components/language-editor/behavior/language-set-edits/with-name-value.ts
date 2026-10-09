/* @layer renderer-components @kind logic */
import type { LanguageSet } from '@shared/game/language';
import type { NameEdit } from '../../language-editor.type';

const withNameValue = (set: LanguageSet, edit: NameEdit): LanguageSet => {
  const { names } = set;
  if (edit.group === 'items') {
    return { ...set, names: { ...names, items: { ...names.items, [edit.key]: edit.value } } };
  }
  if (edit.group === 'bottles') {
    return { ...set, names: { ...names, bottles: { ...names.bottles, [edit.key]: edit.value } } };
  }
  return { ...set, names: { ...names, labels: { ...names.labels, [edit.key]: edit.value } } };
};

export { withNameValue };
