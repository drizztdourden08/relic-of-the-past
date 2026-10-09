/* @layer store-api @kind types */
import type { StoreItem } from '../../../../../shared/store/types';

type VersionList = Pick<StoreItem, 'versions'>;

export type { VersionList };
