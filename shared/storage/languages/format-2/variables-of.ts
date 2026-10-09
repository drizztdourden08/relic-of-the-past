/* @layer shared-storage @kind logic */
import type { LanguageSet, Variable } from '@shared/game/language';
import { mergeVariableMeta, variablesFromNameTables } from '@shared/game/language';

const variablesOf = (set: LanguageSet): Variable[] =>
  mergeVariableMeta(variablesFromNameTables(set.glossary, set.names), set.variables);

export { variablesOf };
