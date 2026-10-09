/* @layer store-api @kind types */
import type { StoreItem } from '@rotp/hub-contracts';

type StatusInput = Pick<StoreItem, 'status' | 'liveVersion' | 'versions'>;

export type { StatusInput };
