/* @layer shared-game @kind logic */
/**
 * The bridge between the one variable list and the two tables that came before
 * it. `variablesFromLegacy` folds a glossary and a name table into one list;
 * `legacyFromVariables` projects a list back into that pair, so the pause menu,
 * the bake step and the editor's existing tables keep reading exactly what they
 * always read.
 *
 * The pair is a lossless round trip in both directions for everything the old
 * model could express: a term returns as a term, a menu name returns to the
 * same slot it came from. Only the fields the old model had no room for
 * (`label`, `locked`, `maxGlyphs`, and a note on a menu name) are regenerated
 * rather than recovered — a caller that wants to keep an edited label carries
 * it over itself (see `./merge-meta`).
 *
 * KEY SHAPES. An item keeps the key it already had (`<item-record-id>-<tier>`),
 * so nothing that references one has to be rewritten. The other two slots had
 * no key shape of their own, so they take a prefix that cannot collide with an
 * item key: `bottle-<content>` and `label-<section>`. Reversal never guesses
 * from the key alone — `kind` says which table an entry belongs to first.
 *
 * `maxGlyphs` for a literal value counts its characters. A bracketed
 * pseudo-glyph spelling therefore over-counts, which keeps a fit verdict on the
 * safe side.
 */
import type { GlossaryTerm, NameTable, PauseLabelKey } from '../types';
import { emptyNameTable } from '../migrate/set-from-pack';
import { builtinVariables } from './builtin';
import type { Variable } from './types';

/**
 * The pair the pre-variables model persisted, and still the shape every current
 * reader expects. Produced from a variable list rather than stored beside it.
 */
type LegacyNameData = {
  glossary: GlossaryTerm[];
  names: NameTable;
};

const kBottlePrefix = 'bottle-';
const kLabelPrefix = 'label-';

/** Adds `note` only when there is one, so a round trip never grows the shape. */
const withNote = <T extends object>(base: T, note: string | undefined): T => (
  note === undefined ? base : { ...base, note }
);

/** The value reads better in a picker than the key; the key is the fallback. */
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
    .map(([content, value]) => literalVariable(`${kBottlePrefix}${content}`, 'menu-name', value)),
  ...Object.entries(names.labels)
    .map(([section, value]) => literalVariable(`${kLabelPrefix}${section}`, 'menu-name', value)),
];

/**
 * One list: the engine's two first (locked, so they always win a key clash),
 * then the translator's terms, then the menu names.
 */
const variablesFromLegacy = (glossary: GlossaryTerm[], names: NameTable): Variable[] => [
  ...builtinVariables(),
  ...glossary.map(termVariable),
  ...menuNameVariables(names),
];

/** `bottle-7` -> 7, and null for anything that is not that shape. */
const bottleContentOf = (key: string): number | null => {
  if (!key.startsWith(kBottlePrefix)) return null;
  const digits = key.slice(kBottlePrefix.length);
  return /^\d+$/.test(digits) ? Number(digits) : null;
};

const applyMenuName = (names: NameTable, variable: Variable): void => {
  const value = variable.value ?? '';
  const content = bottleContentOf(variable.key);
  if (content !== null) {
    names.bottles[content] = value;
    return;
  }
  if (variable.key.startsWith(kLabelPrefix)) {
    names.labels[variable.key.slice(kLabelPrefix.length) as PauseLabelKey] = value;
    return;
  }
  names.items[variable.key] = value;
};

/**
 * The pair the current readers expect. Engine variables are dropped: they have
 * no literal value, and neither table ever held one.
 */
const legacyFromVariables = (variables: Variable[]): LegacyNameData => {
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

export { legacyFromVariables, variablesFromLegacy };
export type { LegacyNameData };
