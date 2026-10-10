/* @layer test @kind test */
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { hudDataScope, intrinsicSize, layoutHud, placedById, COUNTDOWN_SIZE, layoutById, validateLayout, advanceCountdown, IDLE_TRACK } from '@rotp/hud';
import { parseGameUIBuffer } from '@rotp/game-core';
import { countdownBox } from '@app/compounds/HudCountdown';
import { HudNodeCountdown } from '@app/compounds/HudNodeRenderer/sub-components/HudNodeCountdown';
import { drawOrigin } from '@app/compounds/HudNodeRenderer/behavior/draw-origin';
import {
  countdownInset, countdownVariantOf,
} from '@app/compounds/HudNodeRenderer/behavior/countdown-art';
import { countdownContentOf } from '@app/views/HudLayoutView/behavior/countdown-content';
import { occupantsOf } from '@app/views/HudLayoutEditor/sub-components/GridLattice';
import type { PlacedNode, HudLayout, HudNode } from '@rotp/hud';

const ACTIVE = { countdown_active: 1, countdown_seconds: 18, countdown_frames: 40 };
const leaf = (id: string): HudNode => ({ kind: 'element', id, element: { type: 'sprite', file: 'x', box: { w: 16, h: 16 } } });
const countdown = (extra: Partial<HudNode> = {}): HudNode =>
  ({ kind: 'element', id: 'cd', element: { type: 'countdown' }, ...extra }) as HudNode;
const docOf = (children: HudNode[], grid = false): HudLayout => ({
  id: 't', name: 't', builtIn: false,
  screen: grid
    ? { kind: 'container', id: 'screen', layout: 'grid', columns: ['auto', 'auto', 'auto'], children }
    : { kind: 'container', id: 'screen', direction: 'row', gap: { x: 4, y: 0 }, children },
});
const errorsOf = (element: unknown): string[] => validateLayout(docOf([{ kind: 'element', id: 'cd', element } as HudNode])).errors;

describe('the countdown kind validates', () => {
  it('accepts a bare countdown and every variant the setting names, plus "setting"', () => {
    expect(errorsOf({ type: 'countdown' })).toEqual([]);
    for (const variant of ['setting', 'pixel', 'smooth']) expect(errorsOf({ type: 'countdown', variant })).toEqual([]);
  });

  it('refuses an unknown variant and an unknown key at their own path', () => {
    expect(errorsOf({ type: 'countdown', variant: 'round' }).join('\n'))
      .toContain('layout.screen.children[0].element.variant: expected one of setting, pixel, smooth');
    expect(errorsOf({ type: 'countdown', style: 'pixel' }).join('\n')).toContain("unknown key 'style'");
  });
});

describe('the countdown measures as the pixel pie', () => {
  it('is 44x44, the pixel grid, and the smooth pie is within a game pixel of it', () => {
    expect(intrinsicSize({ type: 'countdown' })).toEqual({ w: 44, h: 44 });
    expect(countdownBox('pixel', 1).size).toBe(COUNTDOWN_SIZE.w);
    expect(Math.abs(countdownBox('smooth', 1).size - COUNTDOWN_SIZE.w)).toBeLessThan(1);
  });

  it('centres the smooth pie across the box, leaves the pixel pie alone, and follows the setting', () => {
    expect(countdownInset('pixel', 3)).toBe(0);
    expect(countdownInset('smooth', 3)).toBeCloseTo((44 * 3 - countdownBox('smooth', 3).size) / 2, 9);
    expect(countdownVariantOf(undefined, 'smooth')).toBe('smooth');
    expect(countdownVariantOf('setting', 'pixel')).toBe('pixel');
    expect(countdownVariantOf('smooth', 'pixel')).toBe('smooth');
  });
});

describe('an idle countdown is not placed and takes no space', () => {
  it('leaves a flex line, so the sibling after it does not carry its gap', () => {
    const doc = docOf([leaf('a'), countdown(), leaf('b')]);
    const idle = layoutHud(doc, { w: 398, h: 224 }, { scope: {} });
    expect(placedById(idle, 'cd')).toBeUndefined();
    expect(placedById(idle, 'b')?.rect.x).toBe(20);
    const running = layoutHud(doc, { w: 398, h: 224 }, { scope: ACTIVE });
    expect(placedById(running, 'cd')?.rect).toEqual({ x: 20, y: 0, w: 44, h: 44 });
    expect(placedById(running, 'b')?.rect.x).toBe(68);
  });

  it('leaves a grid too: auto-flow fills its cell with the next child', () => {
    const doc = docOf([countdown(), leaf('b')], true);
    expect(placedById(layoutHud(doc, { w: 398, h: 224 }, {}), 'b')?.rect.x).toBe(0);
    expect(placedById(layoutHud(doc, { w: 398, h: 224 }, { scope: ACTIVE }), 'b')?.rect.x).toBe(44);
  });

  it('stays hidden while idle even when visible is forced on', () => {
    expect(placedById(layoutHud(docOf([countdown({ visible: true })]), { w: 398, h: 224 }, {}), 'cd')).toBeUndefined();
  });

  it('is read by a switch through expand: the three variables reach a formula', () => {
    const doc = docOf([{
      kind: 'element', id: 'sw',
      element: { type: 'switch', cases: [{ when: 'countdown_seconds < 10 and countdown_frames > 0', node: countdown() }] },
    }]);
    expect(validateLayout(doc).errors).toEqual([]);
    expect(placedById(layoutHud(doc, { w: 398, h: 224 }, { scope: ACTIVE }), 'cd')).toBeUndefined();
    const late = { ...ACTIVE, countdown_seconds: 3 };
    expect(placedById(layoutHud(doc, { w: 398, h: 224 }, { scope: late }), 'cd')?.rect.w).toBe(44);
  });
});

describe('the drawn origin snaps to whole game pixels for the countdown only', () => {
  const placed = (node: HudNode): PlacedNode =>
    ({ id: node.id, node, rect: { x: 177.25, y: 168.5, w: 44, h: 44 }, scale: 1, opacity: 1, dimmed: false });

  it('rounds the countdown and leaves every other kind exact', () => {
    expect(drawOrigin(placed(countdown()))).toEqual({ x: 177, y: 169 });
    expect(drawOrigin(placed(leaf('a')))).toEqual({ x: 177.25, y: 168.5 });
  });
});

describe('the live path: a parsed reading to a pie on the shipped layout', () => {
  const VITALS = {
    healthCurrent: 24, healthCapacity: 24, magic: 0, halfMagic: false, armor: 0, arrows: 0, maxArrows: 30,
    bombs: 0, maxBombs: 10, keys: 0, rupees: 0, maxRupees: 999, hasSilverArrows: false,
  };

  it('places the countdown bottom-centre at whole pixels and renders the pie with its seconds', () => {
    const buffer = new Uint8Array(133);
    buffer[129] = 18;
    buffer[130] = 40;
    const state = parseGameUIBuffer(buffer, 0);
    const track = advanceCountdown(IDLE_TRACK, { ...state.countdown, isIndoors: state.map.isIndoors });
    const { countdown: art, source } = countdownContentOf(track, state.countdown.frames, 'pixel');
    const scope = hudDataScope(VITALS, 8, source);
    expect(scope).toMatchObject(ACTIVE);

    const placed = layoutHud(layoutById('default') as HudLayout, { w: 399, h: 224 }, { scope, hearts: 3 });
    const node = placedById(placed, 'countdown');
    expect(node?.rect).toEqual({ x: 177.5, y: 168, w: 44, h: 44 });

    expect(drawOrigin(node as PlacedNode)).toEqual({ x: 178, y: 168 });
    const markup = renderToStaticMarkup(h(HudNodeCountdown, {
      spec: { type: 'countdown' }, countdown: art, scale: 2, spritesBase: 'sprites/',
    }));
    expect(markup).toContain('hud-pixel-pie');
    expect(markup).toContain('width:88px;height:88px');
    expect(markup).toContain('font-digit-1');
    expect(markup).toContain('font-digit-8');
  });

  it('draws nothing at all while the reading says idle', () => {
    const state = parseGameUIBuffer(Object.assign(new Uint8Array(133), { 129: 0xff }), 0);
    const track = advanceCountdown(IDLE_TRACK, { ...state.countdown, isIndoors: false });
    const scope = hudDataScope(VITALS, 8, countdownContentOf(track, 0, 'pixel').source);
    expect(scope.countdown_active).toBe(0);
    expect(placedById(layoutHud(layoutById('default') as HudLayout, { w: 398, h: 224 }, { scope }), 'countdown'))
      .toBeUndefined();
  });

  it('is no grid occupant, except in its own cell picker', () => {
    const screen = (layoutById('default') as HudLayout).screen;
    const ids = (keep?: string) => occupantsOf(screen, keep).map((o) => o.id);
    expect(ids()).not.toContain('countdown');
    expect(ids()).toEqual(screen.children.filter((c) => c.id !== 'countdown').map((c) => c.id));
    expect(ids('countdown')).toContain('countdown');
  });
});
