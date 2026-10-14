/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import defaultJson from '../../../../packages/hud/data/layouts/default.json';
import { tryLoadLayout } from '@rotp/hud';
import { required } from '../required';
import { OUTLINE_MAX_WIDTH } from '@app/compounds/HudNodeRenderer/behavior/hud-node-style.constants';
import { resolveNodeStyle } from '@app/compounds/HudNodeRenderer/behavior/resolve-node-style';

const edited = (change: (doc: Record<string, unknown>) => void): unknown => {
  const copy = JSON.parse(JSON.stringify(defaultJson)) as Record<string, unknown>;
  change(copy);
  return copy;
};

const rootOf = (doc: Record<string, unknown>): Record<string, unknown> =>
  required(((doc.screen as Record<string, unknown>).children as Record<string, unknown>[])[0], 'the first band');

const errorsOf = (value: unknown): string[] => {
  const result = tryLoadLayout(value);
  expect(result.ok, 'this document should have been refused').toBe(false);
  return result.ok ? [] : result.errors;
};

describe('validating a node\'s style', () => {
  it('accepts background, border, radius, shadow, outline, tint and clip together', () => {
    const doc = edited((d) => {
      rootOf(d).style = {
        background: '#123456',
        border: { width: 1, color: '#fff', style: 'dashed', sides: { top: true, bottom: false } },
        radius: [1, 2, 3, 4],
        shadow: [{ x: 1, y: 1, blur: 2, color: '#000', inset: true }],
        outline: { width: 1, color: '#f00' },
        tint: { color: '#0f0', mode: 'replace', amount: 0.5 },
        clip: true,
      };
    });
    const result = tryLoadLayout(doc);
    expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
  });

  it('accepts a background bound to an expression, and a gradient', () => {
    const doc = edited((d) => {
      rootOf(d).style = {
        background: { gradient: 'linear', angle: { from: 'data', expr: 'armor * 10' }, stops: [{ at: 0, color: '#000' }, { at: 1, color: '#fff' }] },
      };
    });
    const result = tryLoadLayout(doc);
    expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
  });

  it('refuses an outline with no color, naming the path', () => {
    const errors = errorsOf(edited((d) => { rootOf(d).style = { outline: { width: 1 } }; }));
    expect(errors.some((e) => e.includes('.style.outline'))).toBe(true);
  });

  it('refuses a radius array of the wrong length', () => {
    const errors = errorsOf(edited((d) => { rootOf(d).style = { radius: [1, 2, 3] }; }));
    expect(errors.some((e) => e.includes('.style.radius'))).toBe(true);
  });

  it('refuses an unknown style key', () => {
    const errors = errorsOf(edited((d) => { rootOf(d).style = { glow: true }; }));
    expect(errors.some((e) => e.includes("unknown key 'glow'"))).toBe(true);
  });

  it('refuses a tint with an unparseable amount, naming the expression', () => {
    const errors = errorsOf(edited((d) => {
      rootOf(d).style = { tint: { color: '#fff', amount: { from: 'data', expr: '((' } } };
    }));
    expect(errors.some((e) => e.includes('.style.tint.amount'))).toBe(true);
  });
});

describe('validating a grid container', () => {
  it('accepts columns, rows, gap, justifyItems, alignItems and guide', () => {
    const doc = edited((d) => {
      const root = rootOf(d);
      delete root.direction;
      delete root.justify;
      delete root.align;
      delete root.wrap;
      root.layout = 'grid';
      root.columns = [{ px: 20 }, 'fill'];
      root.rows = ['auto'];
      root.gap = { x: 2, y: 2 };
      root.justifyItems = 'center';
      root.alignItems = 'stretch';
      root.guide = { show: true, color: '#c064c0' };
    });
    const result = tryLoadLayout(doc);
    expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
  });

  it('refuses a grid with no columns', () => {
    const errors = errorsOf(edited((d) => { rootOf(d).layout = 'grid'; }));
    expect(errors.some((e) => e.includes('columns'))).toBe(true);
  });

  it('refuses a flex-only key on a grid container', () => {
    const errors = errorsOf(edited((d) => {
      const root = rootOf(d);
      root.layout = 'grid';
      root.columns = [{ px: 20 }];
      root.direction = 'row';
    }));
    expect(errors.some((e) => e.includes("unknown key 'direction'"))).toBe(true);
  });
});

describe('resolveNodeStyle - the CSS half', () => {
  it('a flat colour becomes a plain background', () => {
    expect(resolveNodeStyle({ background: '#123456' }, {})).toEqual({ background: '#123456' });
  });

  it('an absent style resolves to nothing - the render path a document with no style already takes', () => {
    expect(resolveNodeStyle(undefined, {})).toEqual({});
  });

  it('radius, border and shadow become real CSS, resolved against the scope', () => {
    const css = resolveNodeStyle({
      radius: { from: 'data', expr: 'armor' },
      border: { width: 2, color: '#fff' },
      shadow: [{ x: 1, y: 2, blur: 3, color: '#000' }],
    }, { armor: 4 });
    expect(css.borderRadius).toBe('4px');
    expect(css.borderTopWidth).toBe('2px');
    expect(css.boxShadow).toBe('1px 2px 3px 0px #000');
  });

  it('outline width is CAPPED, even when the bound expression asks for more', () => {
    const capped = resolveNodeStyle({ outline: { width: 999, color: '#f00' } }, {});
    const small = resolveNodeStyle({ outline: { width: OUTLINE_MAX_WIDTH, color: '#f00' } }, {});
    expect(capped.filter).toBe(small.filter);
  });

  it('outline and tint combine into ONE filter - CSS allows exactly one', () => {
    const css = resolveNodeStyle({ outline: { width: 1, color: '#f00' }, tint: { color: '#0f0' } }, {});
    expect(typeof css.filter).toBe('string');
    expect((css.filter as string).includes('drop-shadow')).toBe(true);
    expect((css.filter as string).includes('data:image/svg+xml')).toBe(true);
  });

  it('clip becomes overflow: hidden', () => {
    expect(resolveNodeStyle({ clip: true }, {})).toEqual({ overflow: 'hidden' });
  });
});
