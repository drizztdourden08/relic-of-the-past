/* @layer store-site @kind types */
import type { useItem } from './useItem';

type ItemState = ReturnType<typeof useItem>;

export type { ItemState };
