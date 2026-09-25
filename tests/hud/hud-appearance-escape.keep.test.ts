// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * THE PREREQUISITE ON THIS PHASE, CHECKED AGAINST THE THING THAT WAS BUILT.
 *
 * `plans/hud-inspector-ux-review.html` moved `SubsectionGroup` from "open
 * question" to blocked: "Appearance-as-a-list works because each group's full
 * editor lives in a popover." The blocker was that `Escape` closed the whole
 * `FullScreenLayer` instead of the popover in front of it. A
 * summary-plus-popover section is unusable if every dismissal throws away the
 * editor, because you would lose the document to close a colour picker.
 *
 * §33 fixed the mechanism and proved it on a STAND-IN popover
 * (`escape-layered-surfaces.keep.test.ts`'s `TestPopover`, which calls
 * `useDismissable` directly). This file proves it on the REAL CHAIN this phase
 * ships: a real `FullScreenLayer`, the real `AppearanceSection` inside it, a
 * real `SubsectionGroup` opened by clicking its header, the real `ColorField`
 * behind that, and the real `ColorPickerPopover` its swatch opens. Five
 * components deep, nothing stubbed, and every surface reached by a click instead
 * of mounted open. That is the reason to test it again instead of trusting
 * §33's stand-in.
 *
 * ONE PRESS CLOSES THE PICKER AND LEAVES THE LAYER UP. The second closes the
 * layer, which is the other half of the contract: the innermost surface answers
 * the press, then the next one out does, and nothing swallows it.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FullScreenLayer } from '../../apps/web/src/ui/design-system/composites/FullScreenLayer';
import { AppearanceSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/AppearanceSection';
import {
  dismissStackDepth,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/dismiss-stack';
import type { HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * jsdom has no `ResizeObserver`, and the `radius` row's `SegmentedControl`
 * builds one on mount to position its indicator. A no-op is the whole stub:
 * this file asserts what `Escape` does, and jsdom performs no layout for an
 * indicator to be positioned against in the first place. Widths are measured in
 * `hud-appearance-controls.keep.test.ts`, in real Chromium, where the real
 * observer exists.
 */
const ignore = (): void => {};
class NoopResizeObserver {
  observe = ignore;
  unobserve = ignore;
  disconnect = ignore;
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoopResizeObserver;

let mounted: { root: Root; host: HTMLElement } | null = null;

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

const layerIsUp = (): boolean => document.querySelector('.fullscreen-layer') !== null;
const pickerIsUp = (): boolean => document.querySelector('.color-picker-popover') !== null;

/** The group header whose name matches, which is what an author actually clicks. */
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
  FullScreenLayer,
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

    // Open Border, which is what puts a `ColorField` on screen at all: a
    // collapsed group renders its summary and nothing else.
    click(groupTrigger('Border'));
    click(swatch('colour'));

    expect(pickerIsUp()).toBe(true);
    expect(layerIsUp()).toBe(true);

    pressEscape();

    // The defect this phase was blocked on: one press used to take the whole
    // editor, because the app shell's shortcut was bound to `document` at
    // start-up, ahead of every popover that would ever exist.
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
    // The ordering trap §33.2 names: the picker is mounted long AFTER the layer
    // here, so passing this ordering alone would prove nothing. What it does
    // show is that the layer and the picker are two stack entries, not one
    // surface bidding twice, and that closing the inner one pops exactly
    // one of them.
    mount(editor(() => {}));
    expect(dismissStackDepth()).toBe(1);

    click(groupTrigger('Border'));
    click(swatch('colour'));
    expect(dismissStackDepth()).toBe(2);

    pressEscape();
    expect(dismissStackDepth()).toBe(1);
  });

  it('leaves a group with no popover open answering Escape itself', () => {
    // A `SubsectionGroup` is NOT a dismissable surface. It is a row that
    // expands, like the nine sections above it, so with no picker open the
    // press goes to the layer. Stated because the alternative design (a group
    // that eats Escape to collapse itself) would put the editor back where §33
    // found it, one level further in.
    const onClose = vi.fn();
    mount(editor(onClose));
    click(groupTrigger('Border'));

    pressEscape();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
