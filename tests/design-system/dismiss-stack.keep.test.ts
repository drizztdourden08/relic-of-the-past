// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * The registry underneath `Escape`, tested without React in the way.
 *
 * The bug these cover is an ORDERING bug: eight components each bound their own
 * `document` listener, so which one answered a press came down to which had
 * mounted first. The two tests that matter here register the same pair in both
 * orders and demand the same answer. Anything that passes one order and fails
 * the other has reproduced the bug instead of fixing it.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  dismissStackDepth, pushDismissable, topDismissLevel,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/dismiss-stack';

const remove: (() => void)[] = [];

/** Registers, and guarantees the module-level stack is drained afterwards. */
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
    // React runs a child's effects before its parent's, so a popover mounted in
    // the same commit as the layer around it registers first. Insertion order
    // therefore cannot be the tie-break between levels.
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

    // Each press dismisses exactly one thing; the owner then unregisters, which
    // is what the effect cleanups do in the real components.
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
    // Registered on document AFTER the stack's own listener: stopImmediate-
    // Propagation is what keeps it from acting on the same press.
    document.addEventListener('keydown', later);

    const event = pressEscape();

    expect(event.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(later).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
    document.removeEventListener('keydown', later);
  });

  it('leaves a listener already sitting on document to protect itself with the depth check', () => {
    // The app shell binds its Escape shortcut at start-up, ahead of any surface,
    // so no amount of event-stopping can reach back and silence it. It stands
    // down because it ASKS. This is the exact shape of that guard, registered in
    // the worst order on purpose.
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
    // What an inline rename editor does: it handles Escape on its own input and
    // marks it consumed. React's handlers run on the root container, below
    // document, so this always happens first.
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
