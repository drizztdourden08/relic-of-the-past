/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { collectReflowWarnings, validateLayout } from '@rotp/hud';
import type { HudAnimation, HudLayout } from '@rotp/hud';

describe('reflow warnings - structured data, not just a comment', () => {
  const engineOf = (engine: 'row' | 'overlay') => (engine === 'row'
    ? { direction: 'row' as const }
    : { layout: 'grid' as const, columns: ['auto' as const], rows: ['auto' as const] });

  const docWithAnimation = (property: string, engine: 'row' | 'overlay'): HudLayout => ({
    id: 't',
    name: 't',
    builtIn: false,
    screen: {
      kind: 'container',
      id: 'parent',
      ...engineOf(engine),
      children: [{
        kind: 'element',
        id: 'child',
        element: { type: 'spacer' },
        ...(engine === 'overlay' ? { place: { column: 1, row: 1 } } : {}),
        animation: [{
          property: property as HudAnimation['property'], keyframes: [{ at: 0, value: 0 }, { at: 1, value: 10 }],
          duration: 100, loop: 'none',
        }],
      }],
    },
  });

  it('warns when width/height animates inside a flow (row) container', () => {
    const { warnings, errors } = validateLayout(docWithAnimation('width', 'row'));
    expect(errors).toEqual([]);
    expect(warnings.some((w) => w.includes('child') && w.includes("'width'") && w.includes('parent'))).toBe(true);
  });

  it('does not warn for scale/opacity/x/y/rotate/tint - the six safe properties', () => {
    (['scale', 'opacity', 'x', 'y', 'rotate', 'tint'] as const).forEach((property) => {
      const { warnings, errors } = validateLayout(docWithAnimation(property, 'row'));
      expect(errors, property).toEqual([]);
      expect(warnings, property).toEqual([]);
    });
  });

  it('does not warn inside an overlay - children share a cell and never reflow', () => {
    const { warnings, errors } = validateLayout(docWithAnimation('width', 'overlay'));
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('collectReflowWarnings is the same function validateLayout calls, exposed for a caller with an already-loaded doc', () => {
    const { doc } = validateLayout(docWithAnimation('height', 'row'));
    expect(doc).not.toBeNull();
    if (!doc) return;
    expect(collectReflowWarnings(doc.screen).length).toBe(1);
  });
});

const baseDoc = (animation: unknown): unknown => ({
  id: 't', name: 't', builtIn: false,
  screen: {
    kind: 'container', id: 'root', direction: 'row',
    children: [{ kind: 'element', id: 'leaf', element: { type: 'spacer' }, animation: [animation] }],
  },
});

const baseDocInsideRepeat = (animation: unknown): unknown => ({
  id: 't', name: 't', builtIn: false,
  screen: {
    kind: 'container', id: 'root', direction: 'row',
    children: [{
      kind: 'element', id: 'hearts',
      element: {
        type: 'repeat', count: 5, item: 'min(max(4 - index, 0), 8)',
        child: { kind: 'element', id: 'heart', element: { type: 'spacer' }, animation: [animation] },
      },
    }],
  },
});

describe('validate-motion - the plan\'s own documents parse; `&&` does not', () => {
  it("accepts the plan's own worked example, corrected to 'and' (contract §22.6)", () => {
    const { doc, errors } = validateLayout(baseDocInsideRepeat({
      when: 'index == count - 1 and item < 8 and item > 0',
      property: 'scale',
      keyframes: [{ at: 0, value: 1 }, { at: 0.5, value: 1.15 }, { at: 1, value: 1 }],
      duration: 700, loop: 'loop', easing: 'ease-in-out',
    }));
    expect(errors).toEqual([]);
    expect(doc).not.toBeNull();
  });

  it("refuses the plan's literal `&&` spelling - it is not expr-eval's grammar", () => {
    const { doc, errors } = validateLayout(baseDocInsideRepeat({
      when: 'index == count - 1 && item < 8',
      property: 'scale',
      keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.15 }],
      duration: 700, loop: 'loop',
    }));
    expect(doc).toBeNull();
    expect(errors.some((e) => e.includes('when'))).toBe(true);
  });

  it('refuses index/count/item OUTSIDE a repeat - they are scoped, not global', () => {
    const { doc, errors } = validateLayout(baseDoc({
      when: 'index == 0', property: 'scale', keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.15 }],
      duration: 700, loop: 'none',
    }));
    expect(doc).toBeNull();
    expect(errors.some((e) => e.includes('unknown variable "index"'))).toBe(true);
  });

});

describe('validate-motion - the plan\'s own documents parse; `&&` does not', () => {
  it('refuses steps(0) and an unknown easing keyword', () => {
    const bad = (easing: string) => validateLayout(baseDoc({
      property: 'scale', keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.15 }], duration: 700, loop: 'none', easing,
    }));
    expect(bad('steps(0)').doc).toBeNull();
    expect(bad('bounce').doc).toBeNull();
    expect(bad('steps(4)').doc).not.toBeNull();
  });

  it('refuses fewer than two keyframes', () => {
    const { doc } = validateLayout(baseDoc({
      property: 'scale', keyframes: [{ at: 0, value: 1 }], duration: 700, loop: 'none',
    }));
    expect(doc).toBeNull();
  });

  it('accepts a transition with enter/exit, and refuses an unknown enter/exit property', () => {
    const withTransition = (enterProps: unknown): unknown => ({
      id: 't', name: 't', builtIn: false,
      screen: {
        kind: 'container', id: 'root', direction: 'row',
        children: [{
          kind: 'element', id: 'leaf', element: { type: 'spacer' },
          transition: {
            properties: ['size', 'opacity'], duration: 180, easing: 'ease-out', when: 'delta > 0',
            enter: { properties: enterProps, duration: 150 },
          },
        }],
      },
    });
    expect(validateLayout(withTransition(['opacity', 'scale'])).doc).not.toBeNull();
    expect(validateLayout(withTransition(['color'])).doc).toBeNull();
  });
});
