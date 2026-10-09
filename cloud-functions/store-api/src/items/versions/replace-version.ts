/* @layer store-api @kind logic */
import type { StoreVersion } from '../../../../../shared/store/types';
import type { VersionList } from './versions.type';

const replaceVersion = (item: VersionList, next: StoreVersion): StoreVersion[] =>
  item.versions.map((version) => (version.n === next.n ? next : version));

export { replaceVersion };
