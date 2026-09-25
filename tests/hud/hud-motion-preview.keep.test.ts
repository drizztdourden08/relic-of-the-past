// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * Phase 10's stage integration, really mounted: the scrub reaching the clock,
 * and the one `Escape` interaction §33 made worth pinning.
 *
 * WHY THIS ONE IS AN INTERACTION TEST AND THE REST ARE NOT. Everything else in
 * Motion is "what does this write to the document", which
 * `hud-motion-controls.keep.test.ts` answers as pure functions. The transport
 * is not: it is a `requestAnimationFrame` loop, a shared clock the renderer
 * already owns, and a key that eight different surfaces used to fight over. A
 * PLAYING preview registers on §33's dismiss stack at `dialog`, so `Escape`
 * stops the playback and the editor stays up. Pressing it again closes the
 * editor, which is the level-first rule that section's whole fix rests on. Get
 * that wrong and one press tears down the editor mid-preview, which is exactly
 * the defect §33 was written to kill.
 *
 * `matchMedia` is stubbed because jsdom has none, and `useReducedMotion` reads
 * it at mount. The default answer is "not reduced", which is the transport's enabled
 * path, and one test flips it to prove the disabled path says so instead.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FullScreenLayer } from '../../apps/web/src/ui/design-system/composites/FullScreenLayer';
import { dismissStackDepth } from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/dismiss-stack';
import { MotionTransport } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/MotionTransport';
import {
  MotionPreviewContext, useMotionPreviewState,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/motion-preview';
// Straight from the hook's own file, not the `HudNodeRenderer` barrel: that
// barrel pulls in the whole art layer, which reaches the input libraries and
// `window.api`, none of which exists in jsdom and none of which this is about.
import {
  useReducedMotion,
} from '../../apps/web/src/ui/domains/hud/compounds/HudNodeRenderer/sub-components/HudNodeMotion/useReducedMotion';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let reduced = false;

const stubMatchMedia = (): void => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduced-motion') ? reduced : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
};

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
const playButton = (): HTMLButtonElement => {
  const found = [...document.querySelectorAll('button')]
    .find((b) => (b.getAttribute('aria-label') ?? '').includes('the stage'));
  if (!found) throw new Error('no play/pause button rendered');
  return found as HTMLButtonElement;
};
const scrub = (): HTMLInputElement => {
  const found = document.querySelector('.hud-transport .slider__input');
  if (!found) throw new Error('no scrub rendered');
  return found as HTMLInputElement;
};

/** The editor, reduced to the two parts this is about: a `FullScreenLayer`
 *  holding the transport, and something standing in for the stage that reports
 *  the clock value it was handed. */
const Harness = (props: { onClose: () => void; spanMs?: number }) => {
  const preview = useMotionPreviewState(useReducedMotion());
  return h(MotionPreviewContext.Provider, { value: preview },
    h(FullScreenLayer, { onClose: props.onClose, title: 'HUD Layout Editor' },
      h('div', { 'data-testid': 'stage', 'data-now': String(preview.nowMs) }),
      h(MotionTransport, { spanMs: props.spanMs ?? 800 })));
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
    // `null`, not 0: the stage must run its own free clock exactly as before
    // for every author who never touches the transport, or every existing
    // animation would freeze at t=0 the moment Motion was opened.
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
    expect(dismissStackDepth()).toBe(2); // the layer, and the running preview

    pressEscape();
    expect(onClose).not.toHaveBeenCalled();
    expect(layerIsUp()).toBe(true);
    expect(playButton().getAttribute('aria-label')).toContain('Play');
    expect(dismissStackDepth()).toBe(1); // the preview stood down; the layer did not

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
    // And the stage is never handed an override, so §27.6's "hold the rest
    // pose" is what it draws.
    expect(document.querySelector('[data-testid="stage"]')?.getAttribute('data-now')).toBe('null');
  });
});
