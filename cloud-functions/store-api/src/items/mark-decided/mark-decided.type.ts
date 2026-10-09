/* @layer store-api @kind types */
import type { Person } from '../../../../../shared/store/types';

type Decided = { by: Person; note: string; at: number };

export type { Decided };
