/* @layer shared-game @kind logic */
import type { GlossaryTerm, NameTable, PauseLabelKey } from '../types';
import { emptyNameTable } from '../pack-set/empty-name-table';
import type { NameTableData, Variable } from './types';
import { BOTTLE_PREFIX, LABEL_PREFIX } from './variables.constants';
import { withNote } from './with-note';

const bottleContentOf = (key: string): number | null => {
  if (!key.startsWith(BOTTLE_PREFIX)) return null;
  const digits = key.slice(BOTTLE_PREFIX.length);
  return /^\d+$/.test(digits) ? Number(digits) : null;
};

const applyMenuName = (names: NameTable, variable: Variable): void => {
  const value = variable.value ?? '';
  const content = bottleContentOf(variable.key);
  if (content !== null) {
    names.bottles[content] = value;
    return;
  }
  if (variable.key.startsWith(LABEL_PREFIX)) {
    names.labels[variable.key.slice(LABEL_PREFIX.length) as PauseLabelKey] = value;
    return;
  }
  names.items[variable.key] = value;
};

const nameTablesFromVariables = (variables: Variable[]): NameTableData => {
  const glossary: GlossaryTerm[] = [];
  const names = emptyNameTable();

  for (const variable of variables) {
    if (variable.kind === 'term') {
      glossary.push(withNote({ key: variable.key, value: variable.value ?? '' }, variable.note));
    } else if (variable.kind === 'menu-name') {
      applyMenuName(names, variable);
    }
  }

  return { glossary, names };
};

export { nameTablesFromVariables };
