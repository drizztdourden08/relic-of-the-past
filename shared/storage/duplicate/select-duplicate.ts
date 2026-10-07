/* @layer shared-storage @kind logic */
/** The duplicate for a kind of installed item. Callers never branch on the kind themselves. */
import type { StoreKind } from '@shared/store/types';
import { duplicateLanguage } from './duplicate-language';
import { duplicateMsu } from './duplicate-msu';
import { duplicateSprite } from './duplicate-sprite';
import type { DuplicateInstalled } from './duplicate.type';

const DUPLICATES: Record<StoreKind, DuplicateInstalled> = {
  music: duplicateMsu,
  language: duplicateLanguage,
  character: duplicateSprite,
};

const selectDuplicate = (kind: StoreKind): DuplicateInstalled => DUPLICATES[kind];

export { selectDuplicate };
