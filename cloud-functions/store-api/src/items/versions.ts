/* @layer store-api @kind logic */
/** Reading and rewriting an item's version list. Versions are never renumbered or reordered;
 *  `liveVersion` names the approved one installs receive. */
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';
import { notFound } from '../../../hub-core/http/http-error';

type VersionList = Pick<StoreItem, 'versions'>;

const versionOf = (item: VersionList, n: number): StoreVersion | null =>
  item.versions.find((version) => version.n === n) ?? null;

const lastVersionNumber = (item: VersionList): number => Math.max(0, ...item.versions.map((version) => version.n));

/** The `:n` route parameter as a version of this item, or a 404. */
const loadVersion = (item: VersionList, raw: string): StoreVersion => {
  const n = Number(raw);
  const version = Number.isInteger(n) ? versionOf(item, n) : null;
  if (!version) throw notFound('No such version.');
  return version;
};

const replaceVersion = (item: VersionList, next: StoreVersion): StoreVersion[] =>
  item.versions.map((version) => (version.n === next.n ? next : version));

const dropVersion = (item: VersionList, n: number): StoreVersion[] => item.versions.filter((version) => version.n !== n);

const liveVersionOf = (item: Pick<StoreItem, 'versions' | 'liveVersion'>): StoreVersion | null =>
  (item.liveVersion === null ? null : versionOf(item, item.liveVersion));

/** The version installs receive: the newest approved one whose file is still in the bucket. */
const liveAfter = (versions: readonly StoreVersion[]): number | null => {
  const live = versions.filter((version) => version.review.state === 'approved' && !version.removed);
  return live.length > 0 ? Math.max(...live.map((version) => version.n)) : null;
};

export { versionOf, lastVersionNumber, loadVersion, replaceVersion, dropVersion, liveVersionOf, liveAfter };
