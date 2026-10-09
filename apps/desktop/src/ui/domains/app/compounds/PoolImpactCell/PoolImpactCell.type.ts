/* @layer renderer-components @kind types */

interface ImpactCell {
  text: string;
  muted: boolean;
}

interface PoolImpactCellProps {
  cell: ImpactCell;
}

export type { ImpactCell, PoolImpactCellProps };
