/* @layer renderer-components @kind types */
import type { Value } from '@shared/types/hud';

interface UseValueInputParams {
  value: Value | undefined;
  onChange: (next: Value) => void;
  onClear?: () => void;
  step: number;
  min?: number;
  max?: number;
}

export type { UseValueInputParams };
