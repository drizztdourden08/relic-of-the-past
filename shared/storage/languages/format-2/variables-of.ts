/* @layer shared-storage @kind logic */
import type { LanguageSet, Variable } from '@shared/game/language';
import { mergeVariableMeta, variablesFromLegacy } from '@shared/game/language';

const variablesOf = (set: LanguageSet): Variable[] =>
  mergeVariableMeta(variablesFromLegacy(set.glossary, set.names), set.variables);

export { variablesOf };
