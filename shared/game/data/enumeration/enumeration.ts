/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { EnumerationEntry } from '../types/enumeration';

const files = import.meta.glob('../records/enumeration/enumeration.ts', { eager: true });

const ALL_ENUMERATION: EnumerationEntry[] = collectRecords<EnumerationEntry>(files);

export { ALL_ENUMERATION };
