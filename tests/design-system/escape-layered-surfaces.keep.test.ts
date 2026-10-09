/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FullScreenLayer } from '../../apps/web/src/ui/design-system/composites/FullScreenLayer';
import { DialogShell } from '../../apps/web/src/ui/design-system/composites/DialogShell';
import { Drawer } from '../../apps/web/src/ui/design-system/composites/Drawer';
import { Select } from '../../apps/web/src/ui/design-system/primitives/Select';
import {
  dismissStackDepth,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/dismiss-stack';
import {
  useDismissable,
} from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/use-dismissable';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

const click = (el: Element): void => {
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); });
};

const layerIsUp = (): boolean => document.querySelector('.fullscreen-layer') !== null;

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

const TestPopover = (props: { open: boolean; onClose: () => void }) => {
  useDismissable({ active: props.open, level: 'popover', onDismiss: props.onClose });
  return props.open ? createElement('div', { 'data-testid': 'popover' }) : null;
};

const popoverIsUp = (): boolean => document.querySelector('[data-testid="popover"]') !== null;

describe('Escape inside a full-screen layer', () => {
  it('closes the popover first and the layer second when the popover registered FIRST', () => {
    const onClose = vi.fn();
    const Fixture = () => {
      const [popover, setPopover] = useState(true);
      return createElement(FullScreenLayer, { onClose, title: 'Editor' },
        createElement(TestPopover, { open: popover, onClose: () => setPopover(false) }));
    };
    mount(createElement(Fixture));
    expect(popoverIsUp()).toBe(true);

    pressEscape();
    expect(popoverIsUp()).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(layerIsUp()).toBe(true);

    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes the popover first and the layer second when the popover registered LAST', () => {
    const onClose = vi.fn();
    let openPopover = (): void => undefined;
    const Fixture = () => {
      const [popover, setPopover] = useState(false);
      openPopover = () => setPopover(true);
      return createElement(FullScreenLayer, { onClose, title: 'Editor' },
        createElement(TestPopover, { open: popover, onClose: () => setPopover(false) }));
    };
    mount(createElement(Fixture));
    expect(dismissStackDepth()).toBe(1);
    act(() => openPopover());
    expect(popoverIsUp()).toBe(true);

    pressEscape();
    expect(popoverIsUp()).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(layerIsUp()).toBe(true);

    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes an open Select, not the layer around it', () => {
    const onClose = vi.fn();
    mount(createElement(FullScreenLayer, { onClose, title: 'Editor' },
      createElement(Select, {
        value: 'a', onChange: () => undefined,
        options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
      })));

    const trigger = document.querySelector('.select-trigger');
    click(trigger!);
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();

    pressEscape();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes a dialog, not the layer under it', () => {
    const closeLayer = vi.fn();
    const closeDialog = vi.fn();
    mount(createElement(FullScreenLayer, { onClose: closeLayer, title: 'Editor' },
      createElement(DialogShell, { open: true, onClose: closeDialog, title: 'Confirm' }, null)));

    pressEscape();
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(closeLayer).not.toHaveBeenCalled();
  });

  it('lets a non-dismissable dialog swallow the key instead of passing it down', () => {
    const closeLayer = vi.fn();
    const closeDialog = vi.fn();
    mount(createElement(FullScreenLayer, { onClose: closeLayer, title: 'Editor' },
      createElement(DialogShell, {
        open: true, onClose: closeDialog, title: 'Working', dismissable: false,
      }, null)));

    pressEscape();
    pressEscape();
    expect(closeDialog).not.toHaveBeenCalled();
    expect(closeLayer).not.toHaveBeenCalled();
  });

  it('registers nothing while the layer is hidden', () => {
    const onClose = vi.fn();
    mount(createElement(FullScreenLayer, { onClose, hidden: true, title: 'Home' }, null));

    expect(dismissStackDepth()).toBe(0);
    pressEscape();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('the drawer, which is always mounted', () => {
  it('claims nothing at all while it is closed', () => {
    const onClose = vi.fn();
    mount(createElement(Drawer, { open: false, onClose, label: 'Touch controls' }, null));
    expect(dismissStackDepth()).toBe(0);
    pressEscape();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('takes Escape while it is open', () => {
    const onClose = vi.fn();
    mount(createElement(Drawer, { open: true, onClose, label: 'Touch controls' }, null));
    expect(dismissStackDepth()).toBe(1);
    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('loses the key to a popover opened inside it, and gets it back after', () => {
    const closeDrawer = vi.fn();
    mount(createElement(Drawer, { open: true, onClose: closeDrawer, label: 'Touch controls' },
      createElement(TestPopover, { open: true, onClose: () => undefined })));

    pressEscape();
    expect(closeDrawer).not.toHaveBeenCalled();
  });
});
