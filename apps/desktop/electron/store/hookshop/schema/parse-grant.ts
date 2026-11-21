/* @layer electron-main @kind logic */
import { mainText } from '../../../lib/main-text';
import { parseGrant as parseCatalogGrant } from '@drizztdourden08/brock-catalog/main';
import type { CatalogGrant } from '@drizztdourden08/brock-catalog/main';
import { KIND_CONTAINER, isInstalledOrigin, isStoreKind } from '@rotp/hub-contracts';
import { ANSWER_UNREADABLE, GRANT_REFUSED } from '../hookshop.constants';
import { isObject } from './is-object';

const parseGrant = (value: unknown): CatalogGrant => {
  if (!isObject(value)) throw new Error(mainText(ANSWER_UNREADABLE));
  const { kind, container, name, author, license, semver } = value;
  if (!isStoreKind(kind) || KIND_CONTAINER[kind] !== container) throw new Error(mainText(GRANT_REFUSED));
  if (typeof semver !== 'string' || !isInstalledOrigin({ name, author, license })) throw new Error(mainText(GRANT_REFUSED));
  return parseCatalogGrant({ ...value, label: name, meta: { semver, author, license } });
};

export { parseGrant };
