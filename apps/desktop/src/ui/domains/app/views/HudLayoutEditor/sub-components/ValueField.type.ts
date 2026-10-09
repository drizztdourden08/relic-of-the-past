/* @layer renderer-components @kind types */
import type { Value } from '@shared/types/hud';

interface ValueFieldProps {
  label?: string;
  value: Value;
  onChange: (next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  extraNames?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
  'aria-label'?: string;
}

export type { ValueFieldProps };
