/* @layer store-site @kind logic */
import type { FieldErrors, FieldKey } from '../Publish.type';
import type { MaybeErrors } from './compact-errors.type';

const compactErrors = (errors: MaybeErrors): FieldErrors => {
  const kept: FieldErrors = {};
  (Object.keys(errors) as FieldKey[]).forEach((key) => {
    const message = errors[key];
    if (message) kept[key] = message;
  });
  return kept;
};

export { compactErrors };
