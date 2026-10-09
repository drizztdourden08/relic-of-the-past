/* @layer shared-store @kind logic */
import type { InstalledOrigin } from './installed-types.type';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isNonEmpty = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const isInstalledOrigin = (value: unknown): value is InstalledOrigin => {
  if (!isObject(value) || !isObject(value.author)) return false;
  return isNonEmpty(value.name) && isNonEmpty(value.license)
    && isNonEmpty(value.author.userId) && typeof value.author.displayName === 'string';
};

export { isInstalledOrigin };
