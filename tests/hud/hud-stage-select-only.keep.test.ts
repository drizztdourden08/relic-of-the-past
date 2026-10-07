// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * THE STAGE SELECTS AND NOTHING ELSE (§47).
 *
 * The maintainer, after §46: *"I can still drag stuff on the full layout
 * preview. I should be able to select them but not drag them."* §37's margin
 * nudge and the corner scale handle are both gone. A resize is a drag, so the
 * sentence covered both. `scale`/`offset` are edited in Size & Box and
 * Placement, where they have typed, keyboard-reachable homes.
 *
 * WHY THIS FILE COUNTS TO ZERO INSTEAD OF BEING DELETED ALONG WITH THE GESTURE.
 * "The stage no longer drags" is not provable by the absence of a test: the
 * capability would come back the moment a `pointermove` handler reappeared on a
 * pick box, and nothing would notice. So the gesture is still DRIVEN here with a
 * real press, six real frames and a release on a selected node, and what is
 * asserted is that the document was never written and the node is still
 * selected. This is the opposite claim to
 * `hud-drag-gesture.keep.test.ts`'s write count, which is why it is its own
 * file instead of a case in that one.
 *
 * `StageSelection` is mounted with NO write prop at all, which is the structural
 * half of the same claim: there is no `onOffset` and no `onScale` to pass, so a
 * drag has nowhere to write even if one were added. A drag would have to grow a
 * prop, and that is a review, not an accident.
 *
 * jsdom has no `PointerEvent` and no pointer capture; a `MouseEvent` under the
 * pointer event names carries the only two fields any of this reads
 * (`clientX`/`clientY`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { StageSelection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/StageSelection';
import type { PlacedNode } from '../../shared/hud/engine';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EDITOR = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');

const SCREEN = {
  id: 'screen',
  kind: 'container',
  direction: 'row',
  children: [{ id: 'hearts' }, { id: 'wallet' }],
};

const placed = (id: string, x: number, y: number, w = 20, h = 10): PlacedNode => ({
  id,
  node: id === 'screen' ? SCREEN : { id, kind: 'element', element: { type: 'spacer' } },
  rect: { x, y, w, h },
  scale: 1,
  opacity: 1,
  dimmed: false,
} as unknown as PlacedNode);

const NODES = [placed('screen', 0, 0, 200, 120), placed('hearts', 8, 6), placed('wallet', 8, 40)];

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(node); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  const { root, host } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
  document.querySelector('#portal-root')?.remove();
});

const pointer = (type: string, x: number, y: number): MouseEvent =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });

const boxes = (): HTMLElement[] => Array.from(document.querySelectorAll('.hud-stage__pick')) as HTMLElement[];

const boxFor = (id: string): HTMLElement => {
  const index = NODES.findIndex((node) => node.id === id);
  const element = boxes()[index];
  if (!element) throw new Error(`no pick box for ${id}`);
  return element;
};

/** A live-in-a-browser drag: press, six frames of 6 display px, release. */
const drag = (element: HTMLElement): void => {
  act(() => { element.dispatchEvent(pointer('pointerdown', 100, 100)); });
  for (let i = 1; i <= 6; i += 1) {
    act(() => { window.dispatchEvent(pointer('pointermove', 100 + i * 6, 100 + i * 6)); });
  }
  act(() => { window.dispatchEvent(pointer('pointerup', 136, 136)); });
};

/** Mounted the way the editor mounts it, minus the two write props it no longer
 *  has: `selectedId` comes from above (the real one is `useNodeEdits`), so
 *  "still selected" is read off the DOM instead of off the spy. */
const render = (onSelect: (id: string) => void, selectedId: string | null): void => {
  mount(h(StageSelection, {
    nodes: NODES, scale: 2, selectedId, onSelect,
  }));
};

describe('a press on a stage node selects it, and a drag changes nothing', () => {
  it('writes NOTHING across a whole press/move/release, and leaves the node selected', () => {
    const onSelect = vi.fn();
    render(onSelect, 'hearts');
    drag(boxFor('hearts'));
    // The only handler this surface has is selection, and it fired once for
    // the node that was already selected, so not even the selection moved.
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('hearts');
    expect(boxFor('hearts').classList.contains('is-selected')).toBe(true);
    // And nothing was drawn that a drag would have drawn: no snap guide, no
    // scale handle, no drop surface, no ghost.
    expect(document.querySelector('.hud-stage__snap-guide')).toBeNull();
    expect(document.querySelector('.hud-stage__handle')).toBeNull();
    expect(document.querySelector('[aria-label="Scale"]')).toBeNull();
    expect(document.querySelector('.hud-drop')).toBeNull();
    expect(document.querySelector('.hud-ghost')).toBeNull();
  });

  it('selects on the way down with no threshold, arming and no "select first" rule', () => {
    // §37 armed the nudge only on the already-selected box, so a press on
    // anything else deliberately did less. There is no second meaning left for a
    // press to be told apart from, so a click is a click: an unselected box, a
    // container and the screen root all select on `pointerdown`, first time.
    const onSelect = vi.fn();
    render(onSelect, 'hearts');
    act(() => { boxFor('wallet').dispatchEvent(pointer('pointerdown', 50, 50)); });
    expect(onSelect).toHaveBeenLastCalledWith('wallet');
    act(() => { boxFor('screen').dispatchEvent(pointer('pointerdown', 10, 10)); });
    expect(onSelect).toHaveBeenLastCalledWith('screen');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('keeps the selection ring and the measured badge, which are not gestures', () => {
    render(() => {}, 'wallet');
    expect(boxFor('wallet').classList.contains('is-selected')).toBe(true);
    expect(boxFor('wallet').querySelector('.hud-stage__measured')?.textContent).toBe('20×10');
    // Unselected boxes stay pickable and stay quiet.
    expect(boxFor('hearts').querySelector('.hud-stage__measured')).toBeNull();
    expect(boxFor('screen').classList.contains('is-container')).toBe(true);
  });
});

describe('the drag cannot come back unnoticed', () => {
  it('leaves no pointer-drag machinery in the stage layer at all', () => {
    const src = readFileSync(resolve(EDITOR, 'sub-components/StageSelection.tsx'), 'utf8');
    // `onPointerDown` (selection) is the only pointer handler that may appear
    // here, and the two hooks a drag needs may not appear at all.
    expect(src).not.toMatch(/onPointer(Move|Up|Cancel)/);
    expect(src).not.toContain('setPointerCapture');
    expect(src).not.toContain('useDragGesture');
    // The header still NAMES `behavior/offset.ts` to say where a position is
    // edited now, so what may not be here is the import, not the word.
    expect(src).not.toMatch(/from '\.\.\/behavior\/offset'/);
  });

  it('gives the stage no write prop to aim a drag at', () => {
    const src = readFileSync(resolve(EDITOR, 'sub-components/EditorStage.tsx'), 'utf8');
    expect(src).not.toContain('onOffset');
    expect(src).not.toContain('onScale');
  });
});
