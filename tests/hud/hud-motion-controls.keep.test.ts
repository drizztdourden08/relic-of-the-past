/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  addKeyAt, atFromPointer, canRemoveKey, clampAt, MIN_GAP, moveKey, removeKey,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/keyframe-track';
import {
  curvePath, DEFAULT_STEPS, NAMED_EASINGS, stepsCountOf, stepsName,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/easing-curves';
import {
  drivenProperties, mergeTransition, TRANSITION_PROPERTIES,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/transition-edits';
import { validateTransition, validateAnimations } from '../../shared/hud/layouts/validate-motion';
import { collectReflowWarnings } from '../../shared/hud/layouts/validate-motion-warnings';
import { easingFn, sampleKeyframes } from '../../shared/hud/engine';
import type { HudAnimationKeyframe, HudNode } from '../../shared/types/hud';

const SCOPE = { life_current: 8 };
const TWO: HudAnimationKeyframe[] = [{ at: 0, value: 1 }, { at: 1, value: 1.1 }];
const THREE: HudAnimationKeyframe[] = [{ at: 0, value: 1 }, { at: 0.5, value: 2 }, { at: 1, value: 1 }];

describe('KeyframeTrack: dragging a diamond', () => {
  it('turns a pointer x into the fraction of the rail it landed on', () => {
    const rail = { left: 100, width: 200 };
    expect(atFromPointer(100, rail)).toBe(0);
    expect(atFromPointer(300, rail)).toBe(1);
    expect(atFromPointer(150, rail)).toBe(0.25);
    expect(atFromPointer(177, rail)).toBe(0.39);
  });

  it('clamps a pointer that ran off either end, and an unmeasured rail', () => {
    const rail = { left: 100, width: 200 };
    expect(atFromPointer(-500, rail)).toBe(0);
    expect(atFromPointer(9999, rail)).toBe(1);
    expect(atFromPointer(150, { left: 0, width: 0 })).toBe(0);
  });

  it('never lets a key cross the one before it', () => {
    expect(clampAt(THREE, 1, 1.4)).toBe(1 - MIN_GAP);
    expect(clampAt(THREE, 1, -0.4)).toBe(MIN_GAP);
    expect(clampAt(THREE, 1, 0.9)).toBe(0.9);
    expect(clampAt(THREE, 0, -2)).toBe(0);
    expect(clampAt(THREE, 2, 5)).toBe(1);
  });

  it('keeps the track in the order the diamonds are drawn in, after a drag', () => {
    const moved = moveKey(THREE, 1, 1.4);
    expect(moved.map((k) => k.at)).toEqual([0, 0.99, 1]);
    expect([...moved].sort((a, b) => a.at - b.at).map((k) => k.at)).toEqual([0, 0.99, 1]);
  });

  it('leaves every other key untouched, so the selected index still names the same key', () => {
    const moved = moveKey(THREE, 1, 0.3);
    expect(moved[0]).toEqual(THREE[0]);
    expect(moved[2]).toEqual(THREE[2]);
    expect(moved[1].at).toBe(0.3);
  });

  it('adds a key holding whatever the curve already read there, so the shape does not jump', () => {
    const added = addKeyAt(TWO, 0.4, SCOPE, 'ease-in-out');
    expect(added).toBeDefined();
    const before = sampleKeyframes(TWO, 0.4, SCOPE, 'ease-in-out');
    const after = sampleKeyframes(added?.keyframes ?? [], 0.4, SCOPE, 'ease-in-out');
    expect(after).toBeCloseTo(before, 2);
    expect(added?.index).toBe(2);
  });

  it('refuses to stack a second key on top of one that is already there', () => {
    expect(addKeyAt(TWO, 0, SCOPE, undefined)).toBeUndefined();
    expect(addKeyAt(TWO, 1, SCOPE, undefined)).toBeUndefined();
    expect(addKeyAt(TWO, 0.5, SCOPE, undefined)).toBeDefined();
  });

  it('will not delete past the validator\'s own minimum of two', () => {
    expect(canRemoveKey(TWO)).toBe(false);
    expect(removeKey(TWO, 0)).toHaveLength(2);
    expect(canRemoveKey(THREE)).toBe(true);
    expect(removeKey(THREE, 1).map((k) => k.at)).toEqual([0, 1]);
  });
});

describe('EasingPicker: exactly the strings the engine accepts', () => {
  const issuesFor = (easing: string): string[] => {
    const issues: string[] = [];
    validateAnimations(
      [{ property: 'scale', keyframes: TWO, duration: 300, loop: 'none', easing }], 'a', issues,
    );
    return issues;
  };

  it('offers the five the validator names, and nothing else', () => {
    expect([...NAMED_EASINGS]).toEqual(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']);
    NAMED_EASINGS.forEach((name) => expect(issuesFor(name)).toEqual([]));
  });

  it('cannot produce steps(0), which is the one steps value the validator refuses', () => {
    expect(issuesFor('steps(0)').length).toBeGreaterThan(0);
    [0, -1, -99, 0.4, NaN, Infinity].forEach((n) => {
      const produced = stepsName(n);
      expect(produced).not.toBe('steps(0)');
      expect(issuesFor(produced)).toEqual([]);
    });
  });

  it('round-trips a steps count, and reads a non-steps name as null', () => {
    expect(stepsCountOf(stepsName(4))).toBe(4);
    expect(stepsCountOf('ease-out')).toBeNull();
    expect(stepsCountOf(undefined)).toBeNull();
    expect(stepsCountOf('steps(0)')).toBeNull();
    expect(stepsName(DEFAULT_STEPS)).toBe('steps(3)');
  });

  it('draws each thumbnail from the ENGINE\'s own curve, not a hand-drawn one', () => {
    const midY = (name: string): number => {
      const points = curvePath(name).split(/[ML]/).filter(Boolean).map((p) => p.trim().split(' ').map(Number));
      return points[Math.floor(points.length / 2)][1];
    };
    expect(midY('ease-in')).toBeGreaterThan(midY('linear'));
    expect(midY('ease-out')).toBeLessThan(midY('linear'));
    expect(midY('linear')).toBeCloseTo(16 - easingFn('linear')(0.5) * 16, 1);
  });
});

describe('Transitions and enter/exit', () => {
  const leaf = (extra: Partial<HudNode>): HudNode => ({
    id: 'heart', kind: 'element', element: { type: 'shape', shape: 'rect' }, ...extra,
  } as HudNode);

  it('offers all six properties and annotates the undriven ones instead of hiding them', () => {
    expect([...TRANSITION_PROPERTIES]).toEqual(['size', 'position', 'opacity', 'scale', 'tint', 'color']);
    const bound = leaf({ opacity: { from: 'data', expr: 'life_current / 8' } });
    expect([...drivenProperties(bound, false)]).toEqual(['opacity']);
    expect(drivenProperties(leaf({}), false).size).toBe(0);
    expect(drivenProperties(leaf({}), true).has('position')).toBe(true);
  });

  it('keeps enter and the property list from discarding each other', () => {
    const withEnter = mergeTransition(undefined, { enter: { properties: ['opacity'], duration: 150 } });
    expect(withEnter?.enter).toBeDefined();
    const withBoth = mergeTransition(withEnter, { properties: ['opacity'] });
    expect(withBoth?.enter).toBeDefined();
    expect(withBoth?.properties).toEqual(['opacity']);
    const propsCleared = mergeTransition(withBoth, { properties: [] });
    expect(propsCleared?.enter).toBeDefined();
    expect(mergeTransition(propsCleared, { enter: undefined })).toBeUndefined();
  });

  it('writes an ENTER-ONLY transition that the validator accepts', () => {
    const issues: string[] = [];
    const value = mergeTransition(undefined, { exit: { properties: ['scale'], duration: 120 } });
    expect(validateTransition(value, 't', issues)).toBeDefined();
    expect(issues).toEqual([]);
  });

  it('still refuses a transition holding nothing at all', () => {
    const issues: string[] = [];
    expect(validateTransition({ properties: [], duration: 200 }, 't', issues)).toBeUndefined();
    expect(issues.join(' ')).toContain('at least one property');
  });
});

describe('the reflow warning lands on the property that caused it', () => {
  it('names the animated property, so a card can claim its own warning', () => {
    const row: HudNode = {
      id: 'vitals',
      kind: 'container',
      layout: 'flex',
      direction: 'row',
      children: [{
        id: 'heart',
        kind: 'element',
        element: { type: 'shape', shape: 'rect' },
        animation: [
          { property: 'width', keyframes: TWO, duration: 300, loop: 'loop' },
          { property: 'scale', keyframes: TWO, duration: 300, loop: 'loop' },
        ],
      }],
    } as HudNode;
    const warnings = collectReflowWarnings(row as never);
    const mine = warnings.filter((w) => w.startsWith('heart:'));
    expect(mine).toHaveLength(1);
    expect(mine.find((w) => w.includes("animating 'width'"))).toBeDefined();
    expect(mine.find((w) => w.includes("animating 'scale'"))).toBeUndefined();
  });
});
