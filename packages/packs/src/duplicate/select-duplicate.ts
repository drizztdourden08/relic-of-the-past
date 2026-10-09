/* @layer shared-storage @kind logic */
import type { StoreKind } from '@rotp/hub-contracts';
import type { DuplicateInstalled } from './duplicate.type';
import { DUPLICATES } from './select-duplicate.constants';

const selectDuplicate = (kind: StoreKind): DuplicateInstalled => DUPLICATES[kind];

export { selectDuplicate };
