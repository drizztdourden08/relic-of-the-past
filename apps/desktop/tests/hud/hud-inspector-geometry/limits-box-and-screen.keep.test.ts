/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { BoxModelField } from '@app/views/HudLayoutEditor/sub-components/BoxModelField';
import { MinMaxField } from '@app/views/HudLayoutEditor/sub-components/MinMaxField';
import { SizeBoxSection } from '@app/views/HudLayoutEditor/sub-components/SizeBoxSection';
import { installPlatformHarness } from './install-platform-harness';
import { spacerNode as node } from './spacer-node';

const { mount, field, type } = installPlatformHarness();

describe('a limit is cleared by emptying the field', () => {
  it('DELETES the key instead of zeroing it', () => {
    const onMin = vi.fn();
    mount(h(MinMaxField, { min: { w: 8, h: 4 }, max: undefined, onMin, onMax: () => {}, scope: {} }));
    type('min w', '');
    expect(onMin).toHaveBeenCalledTimes(1);
    const next = onMin.mock.calls[0][0] as Record<string, unknown>;
    expect(next).toEqual({ h: 4 });
    expect('w' in next).toBe(false);
  });

  it('drops the whole group when its last axis is emptied', () => {
    const onMax = vi.fn();
    mount(h(MinMaxField, { min: undefined, max: { h: 40 }, onMin: () => {}, onMax, scope: {} }));
    type('max h', '');
    expect(onMax).toHaveBeenCalledWith(undefined);
  });

  it('brings a limit into existence by typing into an empty field', () => {
    const onMin = vi.fn();
    mount(h(MinMaxField, { min: undefined, max: undefined, onMin, onMax: () => {}, scope: {} }));
    expect(field('min h').value).toBe('');
    expect(field('min h').getAttribute('placeholder')).toBe('min');
    type('min h', '12');
    expect(onMin).toHaveBeenCalledWith({ h: 12 });
  });
});

describe('the box model', () => {
  it('shows margin left and top, and refuses to edit them', () => {
    mount(h(BoxModelField, {
      margin: { left: -12, top: 2, right: 3 }, padding: undefined,
      centre: '80 × 24', onMargin: () => {}, onPadding: () => {},
    }));
    expect(field('margin left').value).toBe('-12');
    expect(field('margin left').readOnly).toBe(true);
    expect(field('margin top').readOnly).toBe(true);
    expect(field('margin right').readOnly).toBe(false);
    expect(field('margin bottom').readOnly).toBe(false);
    expect(field('margin left').title).toContain('Position');
  });

  it('clears an edge by emptying it, like every other optional number here', () => {
    const onPadding = vi.fn();
    mount(h(BoxModelField, {
      margin: undefined, padding: { top: 2, right: 2 },
      centre: 'auto × auto', onMargin: () => {}, onPadding,
    }));
    type('padding top', '');
    expect(onPadding).toHaveBeenCalledWith({ right: 2 });
  });

  it('accepts a negative margin one keystroke at a time', () => {
    const onMargin = vi.fn();
    mount(h(BoxModelField, {
      margin: undefined, padding: undefined,
      centre: 'auto × auto', onMargin, onPadding: () => {},
    }));
    type('margin right', '-');
    expect(onMargin).not.toHaveBeenCalled();
    type('margin right', '-8');
    expect(onMargin).toHaveBeenCalledWith({ right: -8 });
  });
});

describe('the screen root cannot be given a size through any path', () => {
  const mountScreen = (): void => {
    mount(h(SizeBoxSection, {
      node: node({ id: 'screen', kind: 'container', direction: 'row', children: [] }),
      onPatch: () => {}, scope: {}, isScreen: true,
    }));
  };

  it('covers size and limits with one scrim that states the cause', () => {
    mountScreen();
    const scrim = document.querySelector('.disabled-overlay__scrim');
    expect(scrim?.textContent).toContain('always exactly the view');
    const covered = document.querySelector('.disabled-overlay__content');
    expect(covered?.hasAttribute('inert')).toBe(true);
    expect(covered?.querySelector('[aria-label="w value"], [aria-label="w unit is auto"]')).not.toBeNull();
    expect(covered?.querySelector('[aria-label="min w"]')).not.toBeNull();
  });

  it('locks all four margin edges and the scale, and leaves padding alone', () => {
    mountScreen();
    for (const side of ['top', 'right', 'bottom', 'left']) {
      expect(`margin ${side} ${field(`margin ${side}`).readOnly}`).toBe(`margin ${side} true`);
      expect(`padding ${side} ${field(`padding ${side}`).readOnly}`).toBe(`padding ${side} false`);
    }
    expect(field('scale').readOnly).toBe(true);
  });

  it('leaves an ordinary node every one of those fields live', () => {
    mount(h(SizeBoxSection, { node: node(), onPatch: () => {}, scope: {} }));
    expect(document.querySelector('.disabled-overlay__scrim')).toBeNull();
    expect(field('margin right').readOnly).toBe(false);
    expect(field('scale').readOnly).toBe(false);
  });
});
