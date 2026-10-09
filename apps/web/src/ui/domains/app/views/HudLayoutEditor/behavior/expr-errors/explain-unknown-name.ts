/* @layer renderer-components @kind logic */
import type { ExprProblem } from './expr-errors.type';

const explainUnknownName = (source: string, name: string, suggestion?: string): ExprProblem => ({
  message: `${name} is not a name this HUD knows.`,
  suggestion: suggestion && `Did you mean ${suggestion}?`,
  fix: suggestion
    ? { label: `use ${suggestion}`, expr: source.replace(new RegExp(`\\b${name}\\b`, 'g'), suggestion) }
    : undefined,
});

export { explainUnknownName };
