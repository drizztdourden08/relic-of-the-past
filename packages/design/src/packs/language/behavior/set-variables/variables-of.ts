/* @layer renderer-components @kind logic */
import { mergeVariableMeta, variablesFromNameTables } from '@rotp/languages';
import type { LanguageSet, Variable } from '@rotp/languages';

const variablesOf = (
  glossary: LanguageSet['glossary'], names: LanguageSet['names'], stored: LanguageSet['variables'],
): Variable[] => mergeVariableMeta(variablesFromNameTables(glossary, names), stored);

export { variablesOf };
