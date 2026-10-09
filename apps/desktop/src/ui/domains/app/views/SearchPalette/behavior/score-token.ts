/* @layer renderer-components @kind logic */
import type { SearchEntry } from '../SearchPalette.type';
import {
  BREADCRUMB_WEIGHTS, DESCRIPTION_WEIGHTS, KEYWORD_WEIGHTS, LABEL_WEIGHTS,
} from '../SearchPalette.constants';
import { scoreField } from './score-field';

const scoreToken = (entry: SearchEntry, token: string): number => Math.max(
  scoreField(entry.label, token, LABEL_WEIGHTS),
  scoreField(entry.keywords, token, KEYWORD_WEIGHTS),
  scoreField(entry.description, token, DESCRIPTION_WEIGHTS),
  scoreField(entry.breadcrumb.join(' '), token, BREADCRUMB_WEIGHTS),
);

export { scoreToken };
