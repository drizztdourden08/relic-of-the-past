/* @layer store-site @kind logic */
import type { StoreItem, StoreVersion } from '@shared/store/types';
import type { ProjectedVersion } from './approved-versions.type';

const isApproved = (version: ProjectedVersion): boolean =>
  !version.review || version.review.state === 'approved';

const approvedVersions = (item: StoreItem): StoreVersion[] =>
  item.versions.filter(isApproved).sort((a, b) => b.n - a.n);

export { approvedVersions };
