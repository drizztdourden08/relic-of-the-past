/* @layer shared-storage @kind constants */
import type { StoreKind } from '@rotp/hub-contracts';
import { duplicateLanguage } from './duplicate-language';
import { duplicateMsu } from './duplicate-msu';
import { duplicateSprite } from './duplicate-sprite';
import type { DuplicateInstalled } from './duplicate.type';

const DUPLICATES: Record<StoreKind, DuplicateInstalled> = {
  music: duplicateMsu,
  language: duplicateLanguage,
  character: duplicateSprite,
};

export { DUPLICATES };
