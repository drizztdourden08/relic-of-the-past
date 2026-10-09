/* @layer store-api @kind types */
import type { StoreItem } from '../../../../../shared/store/types';

type StatusInput = Pick<StoreItem, 'status' | 'liveVersion' | 'versions'>;

export type { StatusInput };
