/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  dismissStackDepth, pushDismissable, topDismissLevel,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/dismiss-stack';

const remove: (() => void)[] = [];

const register = (level: Parameters<typeof pushDismissable>[0], onDismiss: () => void) => {
  const off = pushDismissable(level, onDismiss);
  remove.push(off);
  return off;
};

const pressEscape = (): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  document.body.dispatchEvent(event);
  return event;
};

afterEach(() => {
  while (remove.length) remove.pop()?.();
  expect(dismissStackDepth()).toBe(0);
});

describe('which surface Escape reaches', () => {
  it('closes the popover, not the layer, when the popover registered LAST', () => {
    const layer = vi.fn();
    const popover = vi.fn();
    register('layer', layer);
    register('popover', popover);

    pressEscape();

    expect(popover).toHaveBeenCalledTimes(1);
    expect(layer).not.toHaveBeenCalled();
  });

  it('closes the popover, not the layer, when the popover registered FIRST', () => {
    const layer = vi.fn();
    const popover = vi.fn();
    register('popover', popover);
    register('layer', layer);

    pressEscape();

    expect(popover).toHaveBeenCalledTimes(1);
    expect(layer).not.toHaveBeenCalled();
  });

  it('orders popover over menu over dialog over layer, whatever order they arrived in', () => {
    const seen: string[] = [];
    const offs = [
      register('menu', () => seen.push('menu')),
      register('popover', () => seen.push('popover')),
      register('layer', () => seen.push('layer')),
      register('dialog', () => seen.push('dialog')),
    ];

    expect(topDismissLevel()).toBe('popover');
    pressEscape();
    offs[1]();
    pressEscape();
    offs[0]();
    pressEscape();
    offs[3]();
    pressEscape();

    expect(seen).toEqual(['popover', 'menu', 'dialog', 'layer']);
  });

  it('breaks a tie within one level by registration order, treating the later one as inner', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    register('popover', outer);
    register('popover', inner);

    pressEscape();

    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});

describe('what the rest of the app sees', () => {
  it('stops the press reaching anything outside document, and marks it handled', () => {
    const outer = vi.fn();
    const later = vi.fn();
    window.addEventListener('keydown', outer);
    register('layer', () => undefined);
    document.addEventListener('keydown', later);

    const event = pressEscape();

    expect(event.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(later).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
    document.removeEventListener('keydown', later);
  });

  it('leaves a listener already sitting on document to protect itself with the depth check', () => {
    const closedThePage = vi.fn();
    const appShortcut = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || dismissStackDepth() > 0) return;
      closedThePage();
    };
    document.addEventListener('keydown', appShortcut);

    const off = register('layer', () => undefined);
    pressEscape();
    expect(closedThePage).not.toHaveBeenCalled();

    off();
    pressEscape();
    expect(closedThePage).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', appShortcut);
  });

  it('binds nothing at all while the stack is empty', () => {
    const appShortcut = vi.fn();
    document.addEventListener('keydown', appShortcut);

    const event = pressEscape();

    expect(dismissStackDepth()).toBe(0);
    expect(topDismissLevel()).toBeNull();
    expect(appShortcut).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
    document.removeEventListener('keydown', appShortcut);
  });

  it('stands down when an inner handler already consumed the key', () => {
    const layer = vi.fn();
    register('layer', layer);
    const consumer = (event: KeyboardEvent): void => { event.preventDefault(); };
    document.body.addEventListener('keydown', consumer);

    pressEscape();

    expect(layer).not.toHaveBeenCalled();
    document.body.removeEventListener('keydown', consumer);
  });

  it('leaves every other key alone', () => {
    const appShortcut = vi.fn();
    document.addEventListener('keydown', appShortcut);
    register('popover', vi.fn());

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true, cancelable: true }));

    expect(appShortcut).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', appShortcut);
  });
});
