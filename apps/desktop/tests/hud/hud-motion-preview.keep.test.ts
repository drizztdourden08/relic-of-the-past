/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, Fragment, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ScreenWindow } from '@drizztdourden08/tessera/composites';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';
import type { EscapeStack } from '@drizztdourden08/tessera/primitives';
import { MotionTransport } from '@app/views/HudLayoutEditor/sub-components/MotionTransport';
import {
  MotionPreviewContext, useMotionPreviewState,
} from '@app/hud-layout-editing/motion-preview';
import {
  useReducedMotion,
} from '@app/compounds/HudNodeRenderer/behavior/useReducedMotion';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let reduced = false;

const stubMatchMedia = (): void => {
  window.matchMedia = (query: string) => ({
    matches: query.includes('reduced-motion') ? reduced : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  });
};

let mounted: { root: Root; host: HTMLElement } | null = null;

const escapeStack = (): EscapeStack => {
  const found: EscapeStack[] = [];
  const root = createRoot(document.createElement('div'));
  const Probe = (): null => { found.push(useEscapeStack()); return null; };
  act(() => { root.render(h(Probe)); });
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

const click = (el: Element): void => {
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); });
};

const layerIsUp = (): boolean => document.querySelector('.screen-layer') !== null;
const playButton = (): HTMLButtonElement => {
  const found = [...document.querySelectorAll('button')]
    .find((b) => (b.getAttribute('aria-label') ?? '').includes('the stage'));
  if (!found) throw new Error('no play/pause button rendered');
  return found;
};
const scrub = (): HTMLInputElement => {
  const found = document.querySelector('.hud-transport .slider__input');
  if (!found) throw new Error('no scrub rendered');
  return found as HTMLInputElement;
};

const Harness = (props: { onClose: () => void; spanMs?: number }) => {
  const preview = useMotionPreviewState(useReducedMotion());
  return h(MotionPreviewContext.Provider, { value: preview },
    h(ScreenWindow, {
      onClose: props.onClose,
      title: 'HUD Layout Editor',
      children: h(Fragment, null,
        h('div', { 'data-testid': 'stage', 'data-now': String(preview.nowMs) }),
        h(MotionTransport, { spanMs: props.spanMs ?? 800 })),
    }));
};

beforeEach(() => { reduced = false; stubMatchMedia(); });

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

describe('the motion transport drives the stage', () => {
  it('hands the stage nothing until the author takes hold of it', () => {
    mount(h(Harness, { onClose: () => {} }));
    expect(document.querySelector('[data-testid="stage"]')?.getAttribute('data-now')).toBe('null');
  });

  it('puts the scrub\'s position on the clock the stage reads', () => {
    mount(h(Harness, { onClose: () => {} }));
    const input = scrub();
    expect(input.max).toBe('800');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, '450');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(document.querySelector('[data-testid="stage"]')?.getAttribute('data-now')).toBe('450');
  });

  it('scrubbing while playing pauses first, so two things are not setting one number', () => {
    mount(h(Harness, { onClose: () => {} }));
    click(playButton());
    expect(playButton().getAttribute('aria-label')).toContain('Pause');
    const input = scrub();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, '120');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(playButton().getAttribute('aria-label')).toContain('Play');
    expect(document.querySelector('[data-testid="stage"]')?.getAttribute('data-now')).toBe('120');
  });
});

describe('Escape while the preview is playing', () => {
  it('stops the playback and leaves the editor standing, then closes it on the second press', () => {
    const onClose = vi.fn();
    mount(h(Harness, { onClose }));
    click(playButton());
    const layerAndRunningPreview = 2;
    expect(dismissStackDepth()).toBe(layerAndRunningPreview);

    pressEscape();
    expect(onClose).not.toHaveBeenCalled();
    expect(layerIsUp()).toBe(true);
    expect(playButton().getAttribute('aria-label')).toContain('Play');
    const layerOnly = 1;
    expect(dismissStackDepth()).toBe(layerOnly);

    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('owns no key at all while paused, so Escape reaches the editor as it always did', () => {
    const onClose = vi.fn();
    mount(h(Harness, { onClose }));
    expect(dismissStackDepth()).toBe(1);
    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('reduced motion', () => {
  it('replaces the transport with the reason it is off, not a dead button', () => {
    reduced = true;
    stubMatchMedia();
    mount(h(Harness, { onClose: () => {} }));
    expect(document.querySelector('.hud-transport')).toBeNull();
    expect(document.body.textContent).toContain('Reduced motion is on');
    expect(document.querySelector('[data-testid="stage"]')?.getAttribute('data-now')).toBe('null');
  });
});
