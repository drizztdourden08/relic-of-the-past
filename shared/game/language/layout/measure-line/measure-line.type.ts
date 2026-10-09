/* @layer shared-game @kind types */
import type { RowFit } from '../types';

type RowMeasurement = {
  rows: RowFit[];
  unmatched: string[];
};

export type { RowMeasurement };
