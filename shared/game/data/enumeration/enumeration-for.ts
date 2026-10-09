/* @layer shared-game @kind logic */
import type { EnumerationCategory, EnumerationEntry } from '../types/enumeration';
import { enumerationIndex } from './enumeration-index';

const enumerationFor = (category: EnumerationCategory): readonly EnumerationEntry[] =>
  enumerationIndex.byCategory.get(category) ?? [];

export { enumerationFor };
