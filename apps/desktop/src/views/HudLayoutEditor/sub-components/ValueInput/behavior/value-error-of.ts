/* @layer renderer-components @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { NOT_A_NUMBER } from '../ValueInput.constants';
import type { FormulaReading } from './read-formula.type';

const valueErrorOf = (
  reading: FormulaReading, field: { formula: boolean; text: string; canStep: boolean },
): Text | undefined => {
  if (reading.problem) return reading.problem.message;
  const literalProblem = !field.formula && field.text.trim() !== '' && !field.canStep;
  return literalProblem ? NOT_A_NUMBER : undefined;
};

export { valueErrorOf };
