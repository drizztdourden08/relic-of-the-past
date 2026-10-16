/* @layer renderer-components @kind types */
interface NumberFieldRange {
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

interface NumberFieldEditingParams extends NumberFieldRange {
  value: number;
}

interface NumberFieldScrubParams extends NumberFieldRange {
  value: number;
  step: number;
  editing: boolean;
}

export type { NumberFieldEditingParams, NumberFieldScrubParams };
