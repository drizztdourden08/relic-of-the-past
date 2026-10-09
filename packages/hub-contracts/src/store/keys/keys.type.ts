/* @layer shared-store @kind types */
import type { StoreItem, StoreVersion } from '../types';

type KeyItem = Pick<StoreItem, 'id' | 'slug' | 'kind'>;
type KeyVersion = Pick<StoreVersion, 'n' | 'semver' | 'container'>;
type MediaRole = 'card' | 'banner';

export type { KeyItem, KeyVersion, MediaRole };
