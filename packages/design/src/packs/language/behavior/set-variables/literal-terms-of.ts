/* @layer renderer-components @kind logic */
import type { GlossaryTerm, Variable } from '@rotp/languages';

const literalTermsOf = (variables: Variable[]): GlossaryTerm[] => variables.flatMap(
  (variable) => (variable.value === null ? [] : [{ key: variable.key, value: variable.value }]),
);

export { literalTermsOf };
