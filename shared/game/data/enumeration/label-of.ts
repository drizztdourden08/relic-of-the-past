/* @layer shared-game @kind logic */
import type { EnumerationCategory } from '../types/enumeration';
import { enumerationIndex } from './enumeration-index';

const labelOf = (category: EnumerationCategory, value: string): string | undefined =>
  enumerationIndex.byCategoryAndValue.get(`${category}:${value}`)?.label;

export { labelOf };
