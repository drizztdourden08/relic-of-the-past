/* @layer renderer-lib @kind types */
import type { PoolAccounting } from '@rotp/randomizer';
import type { ImpactCell } from '@app/compounds/PoolImpactCell';

interface PoolImpacts {
  accounting: PoolAccounting | null;
  error?: string;
  cellOf: (key: string) => ImpactCell;
}

export type { PoolImpacts };
