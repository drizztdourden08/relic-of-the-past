/* @layer electron-main @kind logic */
import { KIND_CONTAINER } from '@shared/store/containers';
import type { StoreKind } from '@shared/store/types';

const isStoreKind = (value: unknown): value is StoreKind =>
  typeof value === 'string' && Object.keys(KIND_CONTAINER).includes(value);

export { isStoreKind };
