/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { GlossaryTerm, Variable } from '@rotp/languages';
import { withGlossaryTerm, withNameValue } from './language-set-edits';
import { nameEditFor } from './variable-edits';
import type { SetApply } from './set-edits.type';

const useVariableValueSetter = (apply: SetApply) =>
  useCallback((variable: Variable, value: string) => {
    if (variable.locked || variable.value === null) return;
    if (variable.kind !== 'term') {
      apply((from) => withNameValue(from, nameEditFor(variable.key, value)));
      return;
    }
    const note = variable.note;
    const term: GlossaryTerm = note === undefined
      ? { key: variable.key, value }
      : { key: variable.key, value, note };
    apply((from) => withGlossaryTerm(from, term));
  }, [apply]);

export { useVariableValueSetter };
