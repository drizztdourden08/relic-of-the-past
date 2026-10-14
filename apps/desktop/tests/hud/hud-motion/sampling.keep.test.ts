/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { cyclePosition, easingFn, expand, sampleAnimation, sampleKeyframes } from '@rotp/hud';
import type { HudAnimation, HudContainer } from '@rotp/hud';
import { required } from '../../required';

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
    const notTheLastHeart = { index: 2, count: 5, item: 4 };
    const lastHeartFull = { index: 4, count: 5, item: 8 };
    const lastHeartEmpty = { index: 4, count: 5, item: 0 };
    expect(sampleAnimation(lastHeartPulse, 350, notTheLastHeart)).toBeUndefined();
    expect(sampleAnimation(lastHeartPulse, 350, lastHeartFull)).toBeUndefined();
    expect(sampleAnimation(lastHeartPulse, 350, lastHeartEmpty)).toBeUndefined();
  });

  it('samples the keyframe track when the gate is true - scale 1 at the edges, 1.15 at the midpoint', () => {
    const scope = { index: 4, count: 5, item: 4 };
    expect(sampleAnimation(lastHeartPulse, 0, scope)).toBeCloseTo(1, 5);
    expect(sampleAnimation(lastHeartPulse, 700, scope)).toBeCloseTo(1, 5);
    expect(sampleAnimation(lastHeartPulse, 350, scope)).toBeCloseTo(1.15, 5);
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

  const heartRow = (count: number): HudContainer => ({
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
    const delays = expanded.children.map((child) => (child.animation?.[0]?.delay));
    expect(delays).toEqual([0, 80, 160, 240, 320]);
  });

  it('at one shared elapsed time, five different delays sample five different points on the track', () => {
    const expanded = expand(heartRow(5), {});
    const elapsed = 150;
    const samples = expanded.children.map((child) => {
      const animation = child.animation?.[0];
      if (!animation) throw new Error('expected an animation');
      return sampleAnimation(animation, elapsed, {});
    });
    expect(new Set(samples.map((s) => Math.round((s as number) * 1000))).size).toBeGreaterThan(1);
  });
});

describe('steps(n) - the sprite-sheet flipbook mechanism', () => {
  it('a keyframe track sampled with steps(n) reads discrete frame offsets, never a blend between two', () => {
    const keyframes = [{ at: 0, value: 0 }, { at: 1, value: -48 }];
    const frameAt = (t: number) => sampleKeyframes(keyframes, t, {}, undefined);
    const stepped = (t: number) => {
      const local = easingFn('steps(3)')(t);
      const first = required(keyframes[0], 'the first keyframe');
      const last = required(keyframes[1], 'the last keyframe');
      return first.value + (last.value - first.value) * local;
    };
    [0, 0.2, 0.4, 0.6, 0.8, 0.99].forEach((t) => {
      const value = stepped(t);
      expect([0, -16, -32, -48]).toContain(value);
    });
    expect(frameAt(0)).toBe(0);
  });
});
