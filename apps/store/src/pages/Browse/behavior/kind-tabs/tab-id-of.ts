/* @layer store-site @kind logic */
import type { StoreKind } from '@shared/store/types';
import { ALL_TAB } from './kind-tabs.constants';

const tabIdOf = (kind: StoreKind | null): string => kind ?? ALL_TAB;

export { tabIdOf };
