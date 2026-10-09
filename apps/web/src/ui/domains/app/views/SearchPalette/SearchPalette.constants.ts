/* @layer renderer-components @kind constants */
import type { FieldWeights, SearchKind } from './SearchPalette.type';

const LABEL_WEIGHTS: FieldWeights = { exact: 100, prefix: 60, wordStart: 40, substring: 20 };
const KEYWORD_WEIGHTS: FieldWeights = { exact: 30, prefix: 20, wordStart: 15, substring: 8 };
const DESCRIPTION_WEIGHTS: FieldWeights = { exact: 10, prefix: 8, wordStart: 6, substring: 3 };
const BREADCRUMB_WEIGHTS: FieldWeights = { exact: 15, prefix: 10, wordStart: 8, substring: 4 };

const KIND_BOOST: Record<SearchKind, number> = { screen: 6, tab: 6, action: 2, setting: 0 };

const FLASH_CLASS = 'is-search-hit';
const FLASH_DURATION_MS = 1200;

const IDLE_SCREEN_LIMIT = 8;

export {
  BREADCRUMB_WEIGHTS,
  DESCRIPTION_WEIGHTS,
  FLASH_CLASS,
  FLASH_DURATION_MS,
  IDLE_SCREEN_LIMIT,
  KEYWORD_WEIGHTS,
  KIND_BOOST,
  LABEL_WEIGHTS,
};
