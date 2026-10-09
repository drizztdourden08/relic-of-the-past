/* @layer renderer-components @kind logic */
import { mergeVariableMeta, variablesFromLegacy } from '@shared/game/language';
import type { LanguageSet, Variable } from '@shared/game/language';

const variablesOf = (
  glossary: LanguageSet['glossary'], names: LanguageSet['names'], stored: LanguageSet['variables'],
): Variable[] => mergeVariableMeta(variablesFromLegacy(glossary, names), stored);

export { variablesOf };
