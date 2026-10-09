/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ScreenWindow } from '@drizztdourden08/tessera/composites';
import { AppearanceSection } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/AppearanceSection';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';
import type { EscapeStack } from '@drizztdourden08/tessera/primitives';
import type { HudNode } from '@rotp/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(window as { CSS?: Pick<typeof CSS, 'supports'> }).CSS ??= { supports: () => false };

const ignore = (): void => {};
class NoopResizeObserver {
  observe = ignore;
  unobserve = ignore;
  disconnect = ignore;
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;

let mounted: { root: Root; host: HTMLElement } | null = null;

const escapeStack = (): EscapeStack => {
  const found: EscapeStack[] = [];
  const root = createRoot(document.createElement('div'));
  const Probe = (): null => { found.push(useEscapeStack()); return null; };
  act(() => { root.render(createElement(Probe)); });
  act(() => { root.unmount(); });
  const stack = found[0];
  if (!stack) throw new Error('the escape stack probe never rendered');
  return stack;
};

const dismissStackDepth = (): number => escapeStack().depth();

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  host.id = 'root';
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(node); });
  mounted = { root, host };
};

const pressEscape = (): void => {
  act(() => {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  });
};

const click = (el: Element | null | undefined): void => {
  if (!el) throw new Error('nothing to click');
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); });
};

const layerIsUp = (): boolean => document.querySelector('.screen-layer') !== null;
const pickerIsUp = (): boolean => document.querySelector('.color-picker-popover') !== null;

const groupTrigger = (title: string): Element | undefined =>
  Array.from(document.querySelectorAll('.hud-subgroup__trigger'))
    .find((el) => (el.textContent ?? '').includes(title));

const swatch = (label: string): Element | null =>
  document.querySelector(`[aria-label="Open the colour picker for ${label}"]`);

const NODE: HudNode = {
  kind: 'container', id: 'panel', direction: 'row', children: [],
  style: { border: { width: 2, color: '#c8a84e', style: 'solid' } },
};

const editor = (onClose: () => void): ReactNode => createElement(
  ScreenWindow,
  { onClose, title: 'HUD layout' },
  createElement(AppearanceSection, { node: NODE, onPatch: () => {}, scope: {} }),
);

afterEach(() => {
  if (mounted) {
    const { root, host } = mounted;
    act(() => root.unmount());
    host.remove();
    mounted = null;
  }
  document.querySelector('#portal-root')?.remove();
  expect(dismissStackDepth()).toBe(0);
});

describe("Escape inside Appearance's summary-plus-popover shape", () => {
  it('closes the colour picker and leaves the editor up', () => {
    const onClose = vi.fn();
    mount(editor(onClose));

    click(groupTrigger('Border'));
    click(swatch('colour'));

    expect(pickerIsUp()).toBe(true);
    expect(layerIsUp()).toBe(true);

    pressEscape();

    expect(pickerIsUp()).toBe(false);
    expect(layerIsUp()).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes the editor on the SECOND press, so Escape is not swallowed', () => {
    const onClose = vi.fn();
    mount(editor(onClose));
    click(groupTrigger('Border'));
    click(swatch('colour'));

    pressEscape();
    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('registers the picker ABOVE the layer, not merely after it', () => {
    mount(editor(() => {}));
    expect(dismissStackDepth()).toBe(1);

    click(groupTrigger('Border'));
    click(swatch('colour'));
    expect(dismissStackDepth()).toBe(2);

    pressEscape();
    expect(dismissStackDepth()).toBe(1);
  });

  it('leaves a group with no popover open answering Escape itself', () => {
    const onClose = vi.fn();
    mount(editor(onClose));
    click(groupTrigger('Border'));

    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
