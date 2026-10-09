/* @layer renderer-components @kind logic */
import { STORE_SECTIONS } from '../Store.constants';
import type { StoreSection } from '../Store.type';

const isStoreSection = (value: unknown): value is StoreSection =>
  typeof value === 'string' && (STORE_SECTIONS as readonly string[]).includes(value);

export { isStoreSection };
