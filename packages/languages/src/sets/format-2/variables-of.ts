/* @layer shared-storage @kind logic */
import type { LanguageSet, Variable } from '../../messages';
import { mergeVariableMeta, variablesFromNameTables } from '../../messages';

const variablesOf = (set: LanguageSet): Variable[] =>
  mergeVariableMeta(variablesFromNameTables(set.glossary, set.names), set.variables);

export { variablesOf };
