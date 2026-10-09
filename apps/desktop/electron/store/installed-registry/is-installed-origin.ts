/* @layer electron-main @kind logic */
import type { InstalledOrigin } from '@shared/store/installed-types';
import { isRecord } from './is-record';

const isNonEmpty = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const isInstalledOrigin = (value: unknown): value is InstalledOrigin => {
  if (!isRecord(value) || !isRecord(value.author)) return false;
  return isNonEmpty(value.name) && isNonEmpty(value.license)
    && isNonEmpty(value.author.userId) && typeof value.author.displayName === 'string';
};

export { isInstalledOrigin };
