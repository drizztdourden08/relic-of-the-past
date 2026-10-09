/* @layer store-api @kind logic */
import type { StoreVersion } from '../../../../../shared/store/types';
import { notFound } from '../../../../hub-core/http/http-error';
import { versionOf } from './version-of';
import type { VersionList } from './versions.type';

const loadVersion = (item: VersionList, raw: string): StoreVersion => {
  const n = Number(raw);
  const version = Number.isInteger(n) ? versionOf(item, n) : null;
  if (!version) throw notFound('No such version.');
  return version;
};

export { loadVersion };
