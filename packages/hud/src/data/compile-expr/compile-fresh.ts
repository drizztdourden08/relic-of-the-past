/* @layer shared-hud @kind logic */
import { Parser } from 'expr-eval';
import { MAX_EXPR_LENGTH, REFUSED_FUNCTIONS, REFUSED_MESSAGE } from './compile-expr.constants';
import type { CompileResult, HardenedOperators } from './compile-expr.type';

const parser = new Parser({
  operators: {
    assignment: false,
    fndef: false,
    in: false,
    array: false,
    concatenate: false,
  } as HardenedOperators,
});

const parseErrorColumn = (message: string): number | undefined => {
  const match = /\[\d+:(\d+)]/.exec(message);
  return match ? Number(match[1]) : undefined;
};

const messageOf = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const compileFresh = (source: string): CompileResult => {
  if (source.length > MAX_EXPR_LENGTH) {
    return { ok: false, message: `expression is ${source.length} characters, over the ${MAX_EXPR_LENGTH}-character cap` };
  }
  if (!source.trim()) {
    return { ok: false, message: 'expression is empty' };
  }
  let parsed;
  try {
    parsed = parser.parse(source);
  } catch (err) {
    const message = messageOf(err);
    return { ok: false, message, column: parseErrorColumn(message) };
  }
  const named = new Set(parsed.symbols());
  const refused = REFUSED_FUNCTIONS.find((fn) => named.has(fn));
  if (refused) return { ok: false, message: REFUSED_MESSAGE[refused] };

  const variables = parsed.variables();
  return {
    ok: true,
    expr: {
      variables,
      evaluate: (scope) => {
        try {
          const value = parsed.evaluate(scope);
          return { ok: true, value: typeof value === 'number' ? value : Number(value) };
        } catch (err) {
          return { ok: false, message: messageOf(err) };
        }
      },
    },
  };
};

export { compileFresh };
