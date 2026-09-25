/* @layer renderer-components @kind logic */
/**
 * expr-eval's own parse errors, turned into sentences an author can act on.
 *
 * Every string this matches on was PROBED against the shipped parser
 * (`new Parser({ operators: { assignment: false, fndef: false, in: false,
 * array: false, concatenate: false } })`), not read from documentation - the
 * library's README describes array literals, `in` and `||`-as-or, none of
 * which this grammar has. Seven shapes are worth translating and the eighth
 * branch hands the parser's own words through instead of inventing a
 * sentence for a failure nobody has seen.
 *
 * TWO SHAPES SHARE ONE MESSAGE and are told apart by reading the SOURCE, not
 * the error: `x in y` and `life_current 8` both report "Expected EOF", because
 * `in` is disabled and so the lexer stops at a name it will not join.
 * Telling an author that a deliberately-removed feature is a missing operator
 * would hide a decision behind a lexer message.
 *
 * A `fix` is a whole replacement expression, never a patch: the caller commits
 * it as-is, so a one-click correction cannot half-apply.
 */
import { MAX_EXPR_LENGTH } from '@shared/hud/data';

interface ExprFix {
  label: string;
  expr: string;
}

interface ExprProblem {
  /** One sentence, lower-case start of clause, no field path and no `[1:n]`. */
  message: string;
  /** 1-based, from expr-eval's own `parse error [1:n]` - the panel used to
   *  capture this and throw it away. */
  column?: number;
  suggestion?: string;
  fix?: ExprFix;
}

const TRAILING_VERB: Readonly<Record<string, string>> = {
  '+': 'Add the value it should add to.',
  '-': 'Add the value it should subtract.',
  '*': 'Add the value it should multiply by.',
  '/': 'Add the value it should divide by.',
  '%': 'Add the value it should divide by.',
  '^': 'Add the power it should raise to.',
};

/** The index of the innermost `(` still waiting for its `)`, or -1. */
const unclosedAt = (source: string): number => {
  const open: number[] = [];
  [...source].forEach((ch, i) => {
    if (ch === '(') open.push(i);
    else if (ch === ')') open.pop();
  });
  return open.length ? open[open.length - 1] : -1;
};

/** `ceil(` instead of `(`: naming the call is what makes the sentence useful
 *  in a formula with several parens. */
const openParenCall = (source: string): string => {
  const at = unclosedAt(source);
  if (at < 0) return '(';
  const name = /([A-Za-z_]\w*)$/.exec(source.slice(0, at));
  return `${name?.[1] ?? ''}(`;
};

/** `a b` -> `a * b`. The mistake is a missing operator and it is nearly always
 *  multiplication; offering the whole corrected string beats naming the rule. */
const withProduct = (source: string): string | undefined => {
  const joined = source.replace(/([\w)!])(\s+)([\w(.])/, '$1 * $3');
  return joined === source ? undefined : joined;
};

const unfinished = (source: string): ExprProblem => {
  const trimmed = source.trimEnd();
  if (unclosedAt(trimmed) >= 0) {
    return { message: `This opens ${openParenCall(trimmed)} and never closes it. Add a ).` };
  }
  const last = trimmed.slice(-1);
  const verb = TRAILING_VERB[last] ?? 'Add the value that comes next.';
  return { message: `The formula stops after ${last}. ${verb}` };
};

const DISABLED = 'A formula reads values and produces a number; it never sets anything, and it has no lists.';

const disabledFeature = (what: string): ExprProblem => ({
  message: `${what} is not part of HUD formulas. ${DISABLED}`,
});

const columnOf = (raw: string): number | undefined => {
  const match = /\[\d+:(\d+)]/.exec(raw);
  return match ? Number(match[1]) : undefined;
};

/**
 * `raw` is expr-eval's message exactly as `compileExpr` returns it - never
 * `validate-value.ts`'s `${path}.expr: ... - in "${expr}"` wrapper, which is a
 * file-report format and not something to show someone standing in the field.
 */
const explainExprError = (source: string, raw: string): ExprProblem => {
  const column = columnOf(raw);

  if (raw.startsWith('random()')) return { message: raw };
  if (raw.startsWith('expression is empty')) {
    return { message: 'Nothing to read yet. Type a name, or pick one from the ƒ menu.' };
  }
  if (raw.includes('over the')) {
    return { message: `A HUD formula is capped at ${MAX_EXPR_LENGTH} characters. This one is longer.` };
  }
  if (raw.includes('unexpected TEOF')) return unfinished(source);
  if (raw.includes('Expected )')) {
    return { message: `This opens ${openParenCall(source)} and never closes it. Add a ).`, column };
  }
  if (raw.includes('Unknown character "&"')) {
    return {
      message: 'This language writes "and" as and, not &&.',
      column,
      fix: { label: 'use and', expr: source.replace(/&&?/g, 'and') },
    };
  }
  if (raw.includes('Unknown character "|"')) {
    return {
      message: '|| joins text here; it is not "or". It reads as two numbers written next to each other.',
      column,
      fix: { label: 'use or', expr: source.replace(/\|\|?/g, 'or') },
    };
  }
  if (raw.includes('Unknown character "="')) return { ...disabledFeature('Assignment'), column };
  if (raw.includes('Unknown character "["')) return { ...disabledFeature('A list'), column };
  if (raw.includes('Expected EOF')) {
    if (/\bin\b/.test(source)) return { ...disabledFeature('The in operator'), column };
    const product = withProduct(source);
    return {
      message: 'Two values with nothing between them.',
      column,
      suggestion: product && `Did you mean ${product}?`,
      fix: product ? { label: 'multiply', expr: product } : undefined,
    };
  }
  return { message: `The formula parser said: ${raw}`, column };
};

/** The one error that is not the parser's: a name that parsed fine and is not
 *  in the table. `validate-value.ts` already words this well; only its path
 *  prefix has to go. */
const explainUnknownName = (source: string, name: string, suggestion?: string): ExprProblem => ({
  message: `${name} is not a name this HUD knows.`,
  suggestion: suggestion && `Did you mean ${suggestion}?`,
  fix: suggestion
    ? { label: `use ${suggestion}`, expr: source.replace(new RegExp(`\\b${name}\\b`, 'g'), suggestion) }
    : undefined,
});

export { explainExprError, explainUnknownName };
export type { ExprFix, ExprProblem };
