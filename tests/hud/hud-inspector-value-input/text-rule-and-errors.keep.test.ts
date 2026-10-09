/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { compileExpr } from '@shared/hud/data';
import { validateValue } from '@shared/hud/layouts';
import { explainExprError, explainUnknownName } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/expr-errors';
import { readExpr } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/check-expr';
import { isFormulaText, stepsAsNumber, textOf, valueOf } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/value-text';

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
