/* @layer shared-store @kind logic */
import { KIND_CONTAINER } from '../containers';
import type { StoreKind } from '../types';

const isStoreKind = (value: unknown): value is StoreKind =>
  typeof value === 'string' && Object.keys(KIND_CONTAINER).includes(value);

export { isStoreKind };
