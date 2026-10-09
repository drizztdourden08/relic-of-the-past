/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { compileExpr } from '@rotp/hud';
import { readExpr } from '@app/views/HudLayoutEditor/behavior/check-expr';
import { formulaGroups } from '@app/views/HudLayoutEditor/behavior/formula-catalog';
import { formulaStarters } from '@app/views/HudLayoutEditor/behavior/formula-starters';
import { instanceScopes } from '@app/views/HudLayoutEditor/behavior/formula-scope';

const scope = { life_current: 112, life_max: 160 };

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
