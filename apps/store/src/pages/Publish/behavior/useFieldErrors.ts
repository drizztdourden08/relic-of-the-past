/* @layer store-site @kind hook */
/**
 * Which field errors the form shows: a field's own once it has been left, and every one
 * once Submit has been pressed. Each press is counted, so the page can move to the first
 * wrong field again on the next one.
 */
import { useCallback, useMemo, useState } from 'react';
import type { FieldErrors, FieldKey } from '../Publish.type';

const useFieldErrors = (errors: FieldErrors) => {
  const [left, setLeft] = useState<ReadonlySet<FieldKey>>(() => new Set());
  const [attempts, setAttempts] = useState(0);

  const leave = useCallback((field: FieldKey) => setLeft((current) => (current.has(field) ? current : new Set([...current, field]))), []);
  const attempt = useCallback(() => setAttempts((count) => count + 1), []);

  const shown = useMemo(() => {
    const visible: FieldErrors = {};
    (Object.keys(errors) as FieldKey[]).forEach((key) => {
      if (attempts > 0 || left.has(key)) visible[key] = errors[key];
    });
    return visible;
  }, [errors, left, attempts]);

  return { shown, leave, attempt, attempts, count: Object.keys(errors).length };
};

type FieldErrorsState = ReturnType<typeof useFieldErrors>;

export { useFieldErrors };
export type { FieldErrorsState };
