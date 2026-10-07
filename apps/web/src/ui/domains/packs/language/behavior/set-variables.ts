/* @layer renderer-components @kind logic */
/**
 * A set's one substitution list, folded from the pair it is stored as the same way the write
 * path folds it, and the literal terms the measuring walks take from that list.
 */
import { mergeVariableMeta, variablesFromLegacy } from '@shared/game/language';
import type { GlossaryTerm, LanguageSet, Variable } from '@shared/game/language';

/** The glossary and the name tables as one list, with the stored per-variable metadata applied. */
const variablesOf = (
  glossary: LanguageSet['glossary'], names: LanguageSet['names'], stored: LanguageSet['variables'],
): Variable[] => mergeVariableMeta(variablesFromLegacy(glossary, names), stored);

/** Every variable carrying literal text, as the walks that expand refs take it. */
const literalTermsOf = (variables: Variable[]): GlossaryTerm[] => variables.flatMap(
  (variable) => (variable.value === null ? [] : [{ key: variable.key, value: variable.value }]),
);

export { variablesOf, literalTermsOf };
