/* @layer shared-game @kind logic */
import type { GlossaryTerm, NameTable } from '../types';
import { builtinVariables } from './builtin';
import type { Variable } from './types';
import { BOTTLE_PREFIX, LABEL_PREFIX } from './variables.constants';
import { withNote } from './with-note';

const labelFor = (key: string, value: string): string => (value.length > 0 ? value : key);

const literalVariable = (
  key: string, kind: Variable['kind'], value: string, note?: string,
): Variable => withNote({
  key, kind, label: labelFor(key, value), value, locked: false, maxGlyphs: value.length,
}, note);

const termVariable = (term: GlossaryTerm): Variable =>
  literalVariable(term.key, 'term', term.value, term.note);

const menuNameVariables = (names: NameTable): Variable[] => [
  ...Object.entries(names.items)
    .map(([key, value]) => literalVariable(key, 'menu-name', value)),
  ...Object.entries(names.bottles)
    .map(([content, value]) => literalVariable(`${BOTTLE_PREFIX}${content}`, 'menu-name', value)),
  ...Object.entries(names.labels)
    .map(([section, value]) => literalVariable(`${LABEL_PREFIX}${section}`, 'menu-name', value)),
];

const variablesFromNameTables = (glossary: GlossaryTerm[], names: NameTable): Variable[] => [
  ...builtinVariables(),
  ...glossary.map(termVariable),
  ...menuNameVariables(names),
];

export { variablesFromNameTables };
