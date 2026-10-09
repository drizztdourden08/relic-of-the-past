/* @layer store-api @kind logic */
import type { StoreVersion } from '../../../../../shared/store/types';
import type { VersionList } from './versions.type';

const dropVersion = (item: VersionList, n: number): StoreVersion[] => item.versions.filter((version) => version.n !== n);

export { dropVersion };
