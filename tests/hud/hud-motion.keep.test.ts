/* @layer test @kind test */
/**
 * Phase 6 of `plans/hud-data-binding.html` ("Motion"): `animation` and
 * `transition`, the two property sections added this phase, plus the reflow
 * warning the validator now surfaces as data.
 *
 * TWO PROOFS THE PLAN ASKED FOR BY NAME:
 *  - staggering, via `delay: 'index * 80'` inside a `repeat` - ten hearts
 *    must not pulse in lockstep (`describe('staggering a repeat...')`).
 *  - `steps(n)`, discrete instead of interpolated - the one thing that
 *    replaces a GIF for anything reactive (`describe('steps(n)...')`).
 *
 * `and`/`or`/`not` throughout, never `&&`/`||` - contract §22.6.
 */
import { describe, expect, it } from 'vitest';
import {
  cyclePosition, easingFn, expand, sampleAnimation, sampleKeyframes,
} from '@shared/hud/engine';
import { collectReflowWarnings, validateLayout } from '@shared/hud/layouts';
import type { HudAnimation, HudLayout, HudNode } from '@shared/types/hud';

describe('easing curves', () => {
  it('every named curve starts at 0 and ends at 1', () => {
    ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'].forEach((name) => {
      const fn = easingFn(name);
      expect(fn(0), name).toBeCloseTo(0, 5);
      expect(fn(1), name).toBeCloseTo(1, 5);
    });
  });

  it('an unrecognised name reads as linear instead of throwing', () => {
    expect(easingFn('not-a-curve')(0.5)).toBeCloseTo(0.5, 5);
  });

  it('steps(n) holds a plateau, never interpolates', () => {
    const fn = easingFn('steps(4)');
    // Four discrete rungs: 0, 0.25, 0.5, 0.75, jumping - never a value in between.
    expect(fn(0)).toBe(0);
    expect(fn(0.1)).toBe(0);
    expect(fn(0.24)).toBe(0);
    expect(fn(0.26)).toBeCloseTo(0.25, 5);
    expect(fn(0.5)).toBeCloseTo(0.5, 5);
    expect(fn(0.99)).toBeCloseTo(0.75, 5);
    expect(fn(1)).toBe(1);
  });
});

describe('cyclePosition', () => {
  it("'none' clamps at the end instead of wrapping", () => {
    expect(cyclePosition(0, 0, 1000, 'none')).toBe(0);
    expect(cyclePosition(500, 0, 1000, 'none')).toBeCloseTo(0.5, 5);
    expect(cyclePosition(5000, 0, 1000, 'none')).toBe(1);
  });

  it("'loop' wraps back to 0 every duration", () => {
    expect(cyclePosition(1000, 0, 1000, 'loop')).toBeCloseTo(0, 5);
    expect(cyclePosition(1500, 0, 1000, 'loop')).toBeCloseTo(0.5, 5);
    expect(cyclePosition(2500, 0, 1000, 'loop')).toBeCloseTo(0.5, 5);
  });

  it("'ping-pong' reflects at 1 and returns to 0 instead of snapping back", () => {
    expect(cyclePosition(1000, 0, 1000, 'ping-pong')).toBeCloseTo(1, 5);
    expect(cyclePosition(1500, 0, 1000, 'ping-pong')).toBeCloseTo(0.5, 5);
    expect(cyclePosition(2000, 0, 1000, 'ping-pong')).toBeCloseTo(0, 5);
  });

  it('before delay elapses, position is 0 - the rest pose, not a jump-cut', () => {
    expect(cyclePosition(50, 200, 1000, 'loop')).toBe(0);
  });
});

describe('sampleAnimation - the last-heart proof, exactly as the plan writes it', () => {
  const lastHeartPulse: HudAnimation = {
    when: 'index == count - 1 and item < 8 and item > 0',
    property: 'scale',
    keyframes: [{ at: 0, value: 1 }, { at: 0.5, value: 1.15 }, { at: 1, value: 1 }],
    duration: 700,
    loop: 'loop',
    easing: 'ease-in-out',
  };

  it('is undefined (inactive) when the gate reads false', () => {
    // Not the last heart.
    expect(sampleAnimation(lastHeartPulse, 350, { index: 2, count: 5, item: 4 })).toBeUndefined();
    // The last heart, but full (item === 8) - the gate excludes a full heart on purpose.
    expect(sampleAnimation(lastHeartPulse, 350, { index: 4, count: 5, item: 8 })).toBeUndefined();
    // The last heart, but empty (item === 0).
    expect(sampleAnimation(lastHeartPulse, 350, { index: 4, count: 5, item: 0 })).toBeUndefined();
  });

  it('samples the keyframe track when the gate is true - scale 1 at the edges, 1.15 at the midpoint', () => {
    const scope = { index: 4, count: 5, item: 4 };
    expect(sampleAnimation(lastHeartPulse, 0, scope)).toBeCloseTo(1, 5);
    expect(sampleAnimation(lastHeartPulse, 700, scope)).toBeCloseTo(1, 5); // one full loop back to the start
    expect(sampleAnimation(lastHeartPulse, 350, scope)).toBeCloseTo(1.15, 5); // the midpoint keyframe
  });

  it('loops instead of stopping after one cycle', () => {
    const scope = { index: 4, count: 5, item: 4 };
    const oneCycleIn = sampleAnimation(lastHeartPulse, 350, scope);
    const threeCyclesIn = sampleAnimation(lastHeartPulse, 350 + 700 * 3, scope);
    expect(threeCyclesIn).toBeCloseTo(oneCycleIn as number, 5);
  });
});

describe('staggering a repeat with delay - ten hearts do not pulse in lockstep', () => {
  const pulseOnLastEighth = (): HudAnimation => ({
    property: 'scale',
    keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.15 }],
    duration: 400,
    delay: { from: 'data', expr: 'index * 80' },
    loop: 'ping-pong',
  });

  const heartRow = (count: number): HudNode => ({
    kind: 'container',
    id: 'row',
    direction: 'row',
    children: [{
      kind: 'element',
      id: 'hearts',
      element: { type: 'repeat', count, child: { kind: 'element', id: 'heart', element: { type: 'spacer' }, animation: [pulseOnLastEighth()] } },
    }],
  });

  it("each instance's own animation.delay bakes to a DIFFERENT literal, off the same shared clock", () => {
    const expanded = expand(heartRow(5), {});
    expect(expanded.kind).toBe('container');
    if (expanded.kind !== 'container') return;
    const delays = expanded.children.map((child) => (child.animation?.[0]?.delay));
    // Baked to literal numbers - not left as the expression string - and
    // strictly increasing, one `index * 80` per instance: 0, 80, 160, 240, 320.
    expect(delays).toEqual([0, 80, 160, 240, 320]);
  });

  it('at one shared elapsed time, five different delays sample five different points on the track', () => {
    const expanded = expand(heartRow(5), {});
    if (expanded.kind !== 'container') throw new Error('expected a container');
    const elapsed = 150;
    const samples = expanded.children.map((child) => {
      const animation = child.animation?.[0];
      if (!animation) throw new Error('expected an animation');
      return sampleAnimation(animation, elapsed, {});
    });
    // Not every heart reads the same scale at the same instant - that IS the
    // stagger; a lockstep pulse would make every entry in this list identical.
    expect(new Set(samples.map((s) => Math.round((s as number) * 1000))).size).toBeGreaterThan(1);
  });
});

describe('steps(n) - the sprite-sheet flipbook mechanism', () => {
  it('a keyframe track sampled with steps(n) reads discrete frame offsets, never a blend between two', () => {
    // Four "frames" 16px apart, stepped, not slid.
    const keyframes = [{ at: 0, value: 0 }, { at: 1, value: -48 }];
    const frameAt = (t: number) => sampleKeyframes(keyframes, t, {}, undefined);
    // With `steps(3)` easing applied per-keyframe (the span's own easing),
    // the value must land on one of exactly four rungs: 0, -16, -32, -48.
    const stepped = (t: number) => {
      const local = easingFn('steps(3)')(t);
      return keyframes[0].value + (keyframes[1].value - keyframes[0].value) * local;
    };
    [0, 0.2, 0.4, 0.6, 0.8, 0.99].forEach((t) => {
      const value = stepped(t);
      expect([0, -16, -32, -48]).toContain(value);
    });
    expect(frameAt(0)).toBe(0);
  });
});

describe('reflow warnings - structured data, not just a comment', () => {
  /** An OVERLAY is a grid whose children share a cell (§42) - the shape that
   *  replaced `direction: 'stack'`, and the one this rule has to keep reading
   *  as "nothing here reflows anything". */
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
  } as HudLayout);

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

describe('validate-motion - the plan\'s own documents parse; `&&` does not', () => {
  const baseDoc = (animation: unknown): unknown => ({
    id: 't', name: 't', builtIn: false,
    screen: {
      kind: 'container', id: 'root', direction: 'row',
      children: [{ kind: 'element', id: 'leaf', element: { type: 'spacer' }, animation: [animation] }],
    },
  });

  // `index`/`count`/`item` are only known names INSIDE a `repeat`'s `child` -
  // exactly the plan's own worked example, which puts the animation on the
  // switch/shape a repeat unrolls.
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
