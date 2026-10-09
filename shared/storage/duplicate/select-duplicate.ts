/* @layer shared-storage @kind logic */
import type { StoreKind } from '@shared/store/types';
import type { DuplicateInstalled } from './duplicate.type';
import { DUPLICATES } from './select-duplicate.constants';

const selectDuplicate = (kind: StoreKind): DuplicateInstalled => DUPLICATES[kind];

export { selectDuplicate };
