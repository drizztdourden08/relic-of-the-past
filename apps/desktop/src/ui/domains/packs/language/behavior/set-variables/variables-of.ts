/* @layer renderer-components @kind logic */
import { mergeVariableMeta, variablesFromNameTables } from '@shared/game/language';
import type { LanguageSet, Variable } from '@shared/game/language';

const variablesOf = (
  glossary: LanguageSet['glossary'], names: LanguageSet['names'], stored: LanguageSet['variables'],
): Variable[] => mergeVariableMeta(variablesFromNameTables(glossary, names), stored);

export { variablesOf };
