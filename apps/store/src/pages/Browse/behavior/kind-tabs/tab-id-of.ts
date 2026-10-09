/* @layer store-site @kind logic */
import type { StoreKind } from '@rotp/hub-contracts';
import { ALL_TAB } from './kind-tabs.constants';

const tabIdOf = (kind: StoreKind | null): string => kind ?? ALL_TAB;

export { tabIdOf };
