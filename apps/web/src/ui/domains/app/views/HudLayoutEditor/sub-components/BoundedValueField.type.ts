/* @layer renderer-components @kind types */
import type { Value } from '@shared/types/hud';

interface BoundedValueFieldProps {
  label: string;
  value: Value;
  onChange: (next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  min: number;
  max: number;
  step?: number;
  className?: string;
}

export type { BoundedValueFieldProps };
