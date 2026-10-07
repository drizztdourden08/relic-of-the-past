/* @layer tests @kind test */
/**
 * Phase 4 of `plans/hud-inspector-ux-review.html` is "the one field, and the
 * aids that make it writable". This file is everything about it but its width. The
 * widths are next door in `hud-inspector-value-input-width.keep.test.ts`,
 * split off because together they cross the 300-line test cap and because this
 * half needs no browser and runs in milliseconds.
 *
 * THE `=` RULE is pure data and is asserted as such: what a person types, what
 * the document keeps, and the round trip between them.
 *
 * THE ERROR TABLE feeds the SHIPPED PARSER's own message into the translator
 * and asserts the English. Every raw string below was probed, not written from
 * memory. Instantiate the parser exactly as `compile-expr.ts` does and it
 * emits these, character for character. The suite is worthless if the left
 * column drifts, so the raw string is asserted beside every translation.
 *
 * THE MENU is a source-and-data check, because "the menu must make `&&`/`||`
 * impossible to reach for" is a claim about a list, not about pixels.
 */
import { describe, it, expect } from 'vitest';
import { compileExpr } from '@shared/hud/data';
import { validateValue } from '@shared/hud/layouts';
import { explainExprError, explainUnknownName } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/expr-errors';
import { readExpr } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/check-expr';
import { formulaGroups } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/formula-catalog';
import { formulaStarters } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/formula-starters';
import { instanceScopes } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/formula-scope';
import { isFormulaText, stepsAsNumber, textOf, valueOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/value-text';

const scope = { life_current: 112, life_max: 160 };

/** The raw message the shipped parser produces for `source`. */
const raw = (source: string): string => {
  const compiled = compileExpr(source);
  if (compiled.ok) throw new Error(`"${source}" compiled, but it was expected to fail`);
  return compiled.message;
};

const said = (source: string): string => explainExprError(source, raw(source)).message;

describe('the leading = discriminates, and is never stored', () => {
  it('keeps a bare numeral a number and a marked one an expression', () => {
    expect(valueOf('24')).toBe(24);
    expect(valueOf('= 24')).toEqual({ from: 'data', expr: '24' });
    expect(valueOf('=24')).toEqual({ from: 'data', expr: '24' });
  });

  it('round-trips both forms through the field and back', () => {
    expect(valueOf(textOf(24))).toBe(24);
    expect(valueOf(textOf({ from: 'data', expr: 'ceil(life_max / 8)' })))
      .toEqual({ from: 'data', expr: 'ceil(life_max / 8)' });
    // The document never sees the marker: every shipped layout loads unchanged.
    expect(textOf({ from: 'data', expr: '24' })).toBe('= 24');
    expect(JSON.stringify(valueOf('= 24'))).not.toContain('=');
  });

  it('refuses a literal that is neither, and escapes one with ==', () => {
    expect(valueOf('twelve')).toBeNull();
    expect(valueOf('')).toBeNull();
    expect(isFormulaText('== life')).toBe(false);
  });

  it('makes the stepper a predicate over the text, not a remembered mode', () => {
    expect(stepsAsNumber('2')).toBe(true);
    expect(stepsAsNumber('-0.5')).toBe(true);
    // The spinner and the arrow keys vanish the instant a `=` is typed and come
    // back the instant it is deleted, so there is no state to reconcile.
    expect(stepsAsNumber('= gap_base')).toBe(false);
    expect(stepsAsNumber('= 24')).toBe(false);
    expect(stepsAsNumber('')).toBe(false);
  });
});

describe('the seven translated errors, fed the parser\'s own words', () => {
  it('1 · a formula that stops after an operator', () => {
    expect(raw('silvr_arrows +')).toBe('unexpected TEOF: EOF');
    expect(said('silvr_arrows +')).toBe('The formula stops after +. Add the value it should add to.');
  });

  it('2 · a call that is never closed, with its column', () => {
    expect(raw('ceil(life_max / 8')).toBe('parse error [1:18]: Expected )');
    const problem = explainExprError('ceil(life_max / 8', raw('ceil(life_max / 8'));
    expect(problem.message).toBe('This opens ceil( and never closes it. Add a ).');
    expect(problem.column).toBe(18);
  });

  it('3 · a name this HUD does not know, with the did-you-mean intact', () => {
    // The one message `validate-value.ts` already words well. Only its
    // `${path}.expr:` prefix and its `[1:n]` go.
    const reading = readExpr('lifecurrent', { insideRepeat: false });
    expect(reading.problem?.message).toBe('lifecurrent is not a name this HUD knows.');
    expect(reading.problem?.suggestion).toBe('Did you mean life_current?');
    expect(explainUnknownName('lifecurrent + 1', 'lifecurrent', 'life_current').fix?.expr)
      .toBe('life_current + 1');
  });

  it('4 · && , which every author arriving from JavaScript writes once', () => {
    expect(raw('life_current && 1')).toBe('parse error [1:14]: Unknown character "&"');
    const problem = explainExprError('life_current && 1', raw('life_current && 1'));
    expect(problem.message).toBe('This language writes "and" as and, not &&.');
    expect(problem.column).toBe(14);
    expect(problem.fix).toEqual({ label: 'use and', expr: 'life_current and 1' });
  });

  it('5 · || , which was a SILENT wrong number until concatenate: false', () => {
    // Before that one word, this parsed clean and answered 1120 for 112 and 0,
    // with no error at any layer, because the parse was valid and both names known.
    expect(raw('life_current || 0')).toBe('parse error [1:14]: Unknown character "|"');
    const problem = explainExprError('life_current || 0', raw('life_current || 0'));
    expect(problem.message).toContain('it is not "or"');
    expect(problem.fix).toEqual({ label: 'use or', expr: 'life_current or 0' });
  });

  it('6 · two values with no operator between them', () => {
    expect(raw('life_current 8')).toBe('parse error [1:15]: Expected EOF');
    const problem = explainExprError('life_current 8', raw('life_current 8'));
    expect(problem.message).toBe('Two values with nothing between them.');
    expect(problem.suggestion).toBe('Did you mean life_current * 8?');
  });

  it('7 · the three features compile-expr.ts disables on purpose', () => {
    // Reported by the lexer as `Unknown character "["` / `"="`, and for `in`
    // as `Expected EOF`, which is the SAME string as row 6. They are told apart
    // by reading the source, because a deliberate decision should not hide
    // behind a lexer message.
    expect(said('[1, 2]')).toContain('A list is not part of HUD formulas');
    expect(said('life_max = 8')).toContain('Assignment is not part of HUD formulas');
    expect(raw('x in y')).toBe('parse error [1:5]: Expected EOF');
    expect(said('x in y')).toContain('The in operator is not part of HUD formulas');
  });

  it('8 · anything else is handed through honestly, with its column', () => {
    expect(raw('life_current +* 2')).toBe('unexpected TOP: *');
    expect(said('life_current +* 2')).toBe('The formula parser said: unexpected TOP: *');
    expect(explainExprError('a #', 'parse error [1:3]: Unknown character "#"').column).toBe(3);
  });

  it('agrees with validate-value.ts about WHETHER a formula is broken', () => {
    // `check-expr.ts` re-states that file's name rule instead of calling it,
    // because `validateValue` formats for a file report. This is the guard on
    // that duplication: the day one side's rule changes, this goes red.
    const table = [
      'life_current', 'lifecurrent', 'ceil(life_max / 8)', 'index', 'item',
      'life_current && 1', 'life_current || 0', 'random()', '[1, 2]', 'delta',
    ];
    for (const insideRepeat of [false, true]) {
      for (const expr of table) {
        const issues: string[] = [];
        validateValue({ from: 'data', expr }, 'expr', issues, { insideRepeat });
        const mine = readExpr(expr, { insideRepeat }).problem !== null;
        expect(`${expr}/${insideRepeat}: ${mine}`).toBe(`${expr}/${insideRepeat}: ${issues.length > 0}`);
      }
    }
  });
});

describe('random() is refused at parse time, not left to surprise someone', () => {
  it('refuses it with a sentence instead of a lexer message', () => {
    const compiled = compileExpr('ceil(random() * 3)');
    expect(compiled.ok).toBe(false);
    expect(compiled.ok === false && compiled.message).toContain('re-rolls on every frame');
    expect(said('random()')).toContain('previewed, diffed or reproduced');
  });

  it('leaves every other function alone', () => {
    for (const expr of ['ceil(life_max / 8)', 'min(max(life_current, 0), 8)', 'roundTo(1.234, 2)']) {
      expect(`${expr}: ${compileExpr(expr).ok}`).toBe(`${expr}: true`);
    }
  });
});

describe('the menu knows what is in scope, and says so where it is not', () => {
  const names = (insideRepeat: boolean, extraNames?: readonly string[]) =>
    formulaGroups({ insideRepeat, extraNames }).flatMap((g) => g.items);

  it('offers index / count / item only inside a repeat and never hides them', () => {
    const outside = names(false).filter((n) => ['index', 'count', 'item'].includes(n.name));
    expect(outside).toHaveLength(3);
    for (const entry of outside) expect(entry.unavailable).toBe('Exists inside a repeat. This node is not in one.');
    for (const entry of names(true).filter((n) => ['index', 'count', 'item'].includes(n.name))) {
      expect(entry.unavailable).toBeUndefined();
    }
  });

  it('offers delta only where validate-motion.ts actually passes it', () => {
    expect(names(false).some((n) => n.name === 'delta')).toBe(false);
    const onTransition = names(false, ['delta']).find((n) => n.name === 'delta');
    expect(onTransition?.unavailable).toBeUndefined();
  });

  it('makes && and || unreachable, because neither is an insertable entry at any scope', () => {
    // They appear in the NOTES on `and` and `or`, which is the point: the menu
    // warns about both spellings while offering neither, so the mistake cannot
    // be made by clicking. `||` was a live silent-wrong-number bug.
    for (const insideRepeat of [false, true]) {
      for (const offered of names(insideRepeat, ['delta']).map((n) => n.name)) {
        expect(`${offered}: ${offered.includes('&&') || offered.includes('||')}`).toBe(`${offered}: false`);
      }
    }
    expect(names(false).map((n) => n.name)).toEqual(expect.arrayContaining(['and', 'or', 'not']));
    const warnings = names(false).filter((n) => ['and', 'or'].includes(n.name)).map((n) => n.note).join(' ');
    expect(warnings).toContain('&&');
    expect(warnings).toContain('||');
  });

  it('offers no dead end: every function listed actually evaluates', () => {
    // `length`, `join`, `map`, `filter`, `fold`, `indexOf`, `fac` and `gamma`
    // are all ENABLED in the parser and all useless here, because each needs a string,
    // an array or a function value, and the scope is a flat object of numbers.
    const listed = names(false).map((n) => n.name).join(' ');
    for (const dead of ['length', 'join', 'map', 'filter', 'fold', 'indexOf', 'gamma']) {
      expect(`${dead}: ${listed.includes(dead)}`).toBe(`${dead}: false`);
    }
    expect(listed).not.toContain('random');
  });
});

describe('the worked starting points are the corpus, and they compile', () => {
  it('offers a gate a comparison and a count a fraction, never the reverse', () => {
    const gate = formulaStarters({ role: 'gate', insideRepeat: false }).map((s) => s.expr).join(' ');
    const number = formulaStarters({ role: 'number', insideRepeat: false }).map((s) => s.expr).join(' ');
    expect(gate).toContain('>');
    expect(number).not.toContain('>');
    expect(number).toContain('ceil(life_max / 8)');
  });

  it('generates the _current/_max fractions off the table instead of listing them', () => {
    const exprs = formulaStarters({ role: 'number', insideRepeat: false }).map((s) => s.expr);
    expect(exprs).toContain('magic_current / magic_max');
    expect(exprs).toContain('arrow_current / arrow_max');
    expect(exprs).toContain('rupee_current / rupee_max');
    expect(exprs).not.toContain('half_magic_current / half_magic_max');
  });

  it('adds the repeat-only shapes only inside a repeat, and each one parses', () => {
    const inside = formulaStarters({ role: 'number', insideRepeat: true }).map((s) => s.expr);
    expect(inside).toContain('min(max(life_current - index * 8, 0), 8) / 8');
    expect(inside).toContain('index * 80');
    expect(formulaStarters({ role: 'number', insideRepeat: false }).map((s) => s.expr))
      .not.toContain('index * 80');

    for (const role of ['number', 'gate'] as const) {
      for (const starter of formulaStarters({ role, insideRepeat: true })) {
        expect(`${starter.expr}: ${readExpr(starter.expr, { insideRepeat: true }).problem}`)
          .toBe(`${starter.expr}: null`);
      }
    }
  });
});

describe('a formula in a repeat produces N values, and the strip has them', () => {
  it('builds one scope per instance, the same shape engine/expand.ts bakes', () => {
    const scopes = instanceScopes({ count: 20, item: 'index' }, scope);
    expect(scopes).toHaveLength(20);
    expect(scopes[0]).toMatchObject({ index: 0, count: 20, item: 0 });
    expect(scopes[19]).toMatchObject({ index: 19, count: 20, item: 19 });
  });

  it('is empty when there is no repeat above the node', () => {
    expect(instanceScopes(null, scope)).toEqual([]);
  });

  it('shows the heart formula as fourteen full and six empty, not as one sample', () => {
    // The whole argument for the strip: `→ 1` is a sample of size one presented
    // as an answer for something that is 1 fourteen times and 0 six times.
    const scopes = instanceScopes({ count: 20 }, scope);
    const slice = 'min(max(life_current - index * 8, 0), 8) / 8';
    const values = scopes.map((s) => {
      const compiled = compileExpr(slice);
      return compiled.ok ? compiled.expr.evaluate(s) : { ok: false as const, message: '' };
    }).map((r) => (r.ok ? r.value : NaN));
    expect(values.filter((v) => v === 1)).toHaveLength(14);
    expect(values.filter((v) => v === 0)).toHaveLength(6);
  });
});
