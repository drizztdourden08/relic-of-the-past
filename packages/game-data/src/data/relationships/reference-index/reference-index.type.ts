/* @layer shared-game @kind types */
import type { REVERSE_INDEX } from './reference-index.constants';

type ReferenceTarget = keyof typeof REVERSE_INDEX;

export type { ReferenceTarget };
