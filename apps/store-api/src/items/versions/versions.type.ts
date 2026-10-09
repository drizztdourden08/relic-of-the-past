/* @layer store-api @kind types */
import type { StoreItem } from '@rotp/hub-contracts';

type VersionList = Pick<StoreItem, 'versions'>;

export type { VersionList };
