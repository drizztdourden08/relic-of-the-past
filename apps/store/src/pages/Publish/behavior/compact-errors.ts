/* @layer store-site @kind logic */
/** A field-error map with the fields that have no message left out. */
import type { FieldErrors, FieldKey } from '../Publish.type';

type MaybeErrors = Partial<Record<FieldKey, string | null | undefined>>;

const compactErrors = (errors: MaybeErrors): FieldErrors => {
  const kept: FieldErrors = {};
  (Object.keys(errors) as FieldKey[]).forEach((key) => {
    const message = errors[key];
    if (message) kept[key] = message;
  });
  return kept;
};

export { compactErrors };
export type { MaybeErrors };
