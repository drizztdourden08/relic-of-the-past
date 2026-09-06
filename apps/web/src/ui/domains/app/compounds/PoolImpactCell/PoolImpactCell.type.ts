/* @layer renderer-components @kind types */

/** One In Pool cell, already worded: a count line or a short qualifier. */
interface ImpactCell {
  text: string;
  /** A qualifier ("fixed", "not used") rather than a count. */
  muted: boolean;
}

interface PoolImpactCellProps {
  cell: ImpactCell;
}

export type { ImpactCell, PoolImpactCellProps };
