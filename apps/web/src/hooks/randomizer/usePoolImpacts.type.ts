/* @layer renderer-lib @kind types */
import type { PoolAccounting } from '@shared/randomizer/world/pool/pool-accounting';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';

interface PoolImpacts {
  accounting: PoolAccounting | null;
  error?: string;
  cellOf: (key: string) => ImpactCell;
}

export type { PoolImpacts };
