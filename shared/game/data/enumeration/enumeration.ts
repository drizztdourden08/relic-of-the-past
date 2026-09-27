/* @layer shared-game @kind data */
import { recordsIn } from '../registry';
import type { EnumerationEntry } from '../types/enumeration';

const files = import.meta.glob('../records/enumeration/enumeration.ts', { eager: true });

const ALL_ENUMERATION: EnumerationEntry[] = recordsIn<EnumerationEntry>(files);

export { ALL_ENUMERATION };
