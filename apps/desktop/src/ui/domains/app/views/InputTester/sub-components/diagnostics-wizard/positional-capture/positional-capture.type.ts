/* @layer renderer-components @kind types */
import type { ResolvedDevice } from '@shared/input/family';

interface PositionalTarget {
  id: string;
  kind: 'button' | 'axis';
  label: string;
  category: string;
  expectedIndex: number | null;
}

interface PositionalCaptureRecord {
  id: string;
  kind: 'button' | 'axis';
  askedLabel: string;
  status: 'captured' | 'skipped';
  firedIndex: number | null;
  firedPositionalName: string | null;
  expectedIndex: number | null;
  mismatch: boolean;
}

type AxisRanges = { min: number; max: number }[];

interface UsePositionalOneByOneProps {
  deviceKey: string | null;
  active: boolean;
  resolvedDevice: ResolvedDevice | null;
}

export type { AxisRanges, PositionalCaptureRecord, PositionalTarget, UsePositionalOneByOneProps };
