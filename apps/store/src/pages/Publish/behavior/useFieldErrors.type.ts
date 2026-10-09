/* @layer store-site @kind types */
import type { useFieldErrors } from './useFieldErrors';

type FieldErrorsState = ReturnType<typeof useFieldErrors>;

export type { FieldErrorsState };
