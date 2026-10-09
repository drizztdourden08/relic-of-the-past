/* @layer store-api @kind types */
import type { Person } from '@rotp/hub-contracts';

type Decided = { by: Person; note: string; at: number };

export type { Decided };
