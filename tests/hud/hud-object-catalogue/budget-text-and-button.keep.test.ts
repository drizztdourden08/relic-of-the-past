/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { faceFor, stateFor } from '@app/compounds/HudButton/behavior/hud-button-state';
import { resolveTextContent, snapGameFontSize, textIntrinsicSize, tryLoadLayout } from '@rotp/hud';
import type { HudNode } from '@rotp/hud';
import { leaf } from './leaf';
import { row } from './row';

describe('validate-expand-budget - the validator refuses a document that could expand too far', () => {
  const deepRepeat = (count: number): HudNode => ({
    kind: 'element',
    id: 'outer',
    element: {
      type: 'repeat',
      count,
      child: {
        kind: 'element', id: 'inner', element: { type: 'repeat', count, child: leaf('leaf') },
      },
    },
  } as HudNode);

  it('a plausible single repeat (well under budget) loads fine', () => {
    const doc = { id: 'ok', name: 'OK', builtIn: false, regions: [{ anchor: 'top-left', root: row([deepRepeat(1)]) }] };
    const result = tryLoadLayout(doc);
    expect(result.ok).toBe(true);
  });

  it('two nested repeats at 200 each (40,000 worst-case nodes) are refused, loudly, naming the budget', () => {
    const doc = { id: 'bad', name: 'Bad', builtIn: false, regions: [{ anchor: 'top-left', root: row([deepRepeat(200)]) }] };
    const result = tryLoadLayout(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes('worst-case expansion'))).toBe(true);
  });
});

describe('text - content resolution and the pixel-face size snap', () => {
  it('a literal string value draws exactly as given, ignoring format', () => {
    expect(resolveTextContent(
      { type: 'text', value: 'HELLO', face: { from: 'font', family: 'sans', size: 16 } },
      {},
    )).toBe('HELLO');
  });

  it('a bound numeric value is formatted: zero-padded, space-padded, or not at all', () => {
    const base = { type: 'text' as const, value: { from: 'data' as const, expr: 'arrow_current' }, face: { from: 'sprite' as const, set: 'hud-digits' as const } };
    expect(resolveTextContent({ ...base, format: { digits: 2, pad: 'zero' } }, { arrow_current: 5 })).toBe('05');
    expect(resolveTextContent({ ...base, format: { digits: 3, pad: 'space' } }, { arrow_current: 7 })).toBe('  7');
    expect(resolveTextContent({ ...base, format: { digits: 3, pad: 'none' } }, { arrow_current: 7 })).toBe('7');
  });

  it('ALttP Dialogue snaps to a whole multiple of its 16px design size', () => {
    expect(snapGameFontSize(20)).toBe(16);
    expect(snapGameFontSize(24)).toBe(32);
    expect(snapGameFontSize(8)).toBe(16);
    expect(snapGameFontSize(32)).toBe(32);
  });

  it('a sprite face measures a fixed 8px-tall row, a font face scales with its (snapped) size', () => {
    expect(textIntrinsicSize('05', { from: 'sprite', set: 'hud-digits' }).h).toBe(8);
    expect(textIntrinsicSize('X', { from: 'font', family: 'game', size: 20 }).h).toBeGreaterThan(
      textIntrinsicSize('X', { from: 'font', family: 'sans', size: 8 }).h,
    );
  });
});

describe('button - bind validation, derived unassigned flag, and the states fallback', () => {
  const buttonDoc = (bind: unknown) => ({
    id: 'btn', name: 'Btn', builtIn: false,
    regions: [{
      anchor: 'top-left',
      root: {
        kind: 'container', id: 'root', direction: 'row',
        children: [{
          kind: 'element', id: 'b', element: { type: 'button', bind, states: { idle: { from: 'image', file: 'a.png' } } },
        }],
      },
    }],
  });

  it('a verb bind is accepted', () => {
    expect(tryLoadLayout(buttonDoc({ kind: 'verb', verb: 'pause' })).ok).toBe(true);
  });

  it('a slot bind derives dimWhenEmpty from its own index - no separate flag to author', () => {
    const result = tryLoadLayout(buttonDoc({ kind: 'slot', index: 5 }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const root = result.doc.screen.children[0] as { children: { dimWhenEmpty?: number[] }[] };
      const button = root.children[0];
      expect(button.dimWhenEmpty).toEqual([5]);
    }
  });

  it('a slot index under 1 is refused', () => {
    expect(tryLoadLayout(buttonDoc({ kind: 'slot', index: 0 })).ok).toBe(false);
  });

  it('faceFor falls back to idle when a state has no face of its own', () => {
    const spec = { type: 'button' as const, bind: { kind: 'verb' as const, verb: 'pause' as const }, states: { idle: { from: 'image' as const, file: 'idle.png' } } };
    expect(faceFor(spec, 'pressed')).toEqual({ from: 'image', file: 'idle.png' });
  });

  it('stateFor prioritises pressed, then held, then unassigned, then idle', () => {
    expect(stateFor({ pressed: true, held: true, unassigned: true })).toBe('pressed');
    expect(stateFor({ held: true, unassigned: true })).toBe('held');
    expect(stateFor({ unassigned: true })).toBe('unassigned');
    expect(stateFor({})).toBe('idle');
  });
});
