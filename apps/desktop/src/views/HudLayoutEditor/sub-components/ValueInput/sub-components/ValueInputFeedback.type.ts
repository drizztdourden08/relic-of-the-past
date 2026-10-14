/* @layer renderer-components @kind types */
import type { Scope } from '@app/hud-layout-editing/formula-scope';
import type { Value } from '@rotp/hud';
import type { FormulaReading } from '../behavior/read-formula.type';

interface ValueInputFeedbackProps {
  formula: boolean;
  expr: string | null;
  reading: FormulaReading;
  scope: Scope;
  insideRepeat: boolean;
  min?: number;
  max?: number;
  onChange: (next: Value) => void;
}

export type { ValueInputFeedbackProps };
