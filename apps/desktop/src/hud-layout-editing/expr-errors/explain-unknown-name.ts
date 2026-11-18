/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ExprProblem } from './expr-errors.type';

const explainUnknownName = (source: string, name: string, suggestion?: string): ExprProblem => ({
  message: msg('hud-editing:expr.unknown-name', { name }),
  suggestion: suggestion ? msg('hud-editing:expr.suggest', { suggestion }) : undefined,
  fix: suggestion
    ? {
      label: msg('hud-editing:expr.fix.use', { suggestion }),
      expr: source.replace(new RegExp(`\\b${name}\\b`, 'g'), suggestion),
    }
    : undefined,
});

export { explainUnknownName };
