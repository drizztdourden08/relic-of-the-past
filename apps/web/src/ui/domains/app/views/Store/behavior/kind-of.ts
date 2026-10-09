/* @layer renderer-components @kind logic */
import type { StoreKind } from '@shared/store/types';
import type { StoreSection } from '../Store.type';

const kindOf = (section: StoreSection): StoreKind | null =>
  section === 'music' || section === 'character' || section === 'language' ? section : null;

export { kindOf };
