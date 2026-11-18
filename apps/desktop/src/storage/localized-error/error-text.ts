/* @layer renderer-lib @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { LocalizedError } from './localized-error';

const errorText = (err: unknown): Text => {
  if (err instanceof LocalizedError) return err.text;
  return err instanceof Error ? err.message : String(err);
};

export { errorText };
