/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { StageSelection } from '@app/views/HudLayoutEditor/sub-components/StageSelection';
import type { HudContainer, HudElement, PlacedNode } from '@rotp/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;


const spacer = (id: string): HudElement => ({ id, kind: 'element', element: { type: 'spacer' } });

const SCREEN: HudContainer = {
  id: 'screen',
  kind: 'container',
  direction: 'row',
  children: [spacer('hearts'), spacer('wallet')],
};

type PlacedBox = { id: string; x: number; y: number; w?: number; h?: number };

const placed = ({ id, x, y, w = 20, h = 10 }: PlacedBox): PlacedNode => ({
  id,
  node: id === 'screen' ? SCREEN : spacer(id),
  rect: { x, y, w, h },
  scale: 1,
  opacity: 1,
  dimmed: false,
});

const NODES = [
  placed({ id: 'screen', x: 0, y: 0, w: 200, h: 120 }),
  placed({ id: 'hearts', x: 8, y: 6 }),
  placed({ id: 'wallet', x: 8, y: 40 }),
];

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

const boxes = (): HTMLElement[] => Array.from(document.querySelectorAll('.hud-stage__pick'));

const boxFor = (id: string): HTMLElement => {
  const index = NODES.findIndex((node) => node.id === id);
  const element = boxes()[index];
  if (!element) throw new Error(`no pick box for ${id}`);
  return element;
};

const drag = (element: HTMLElement): void => {
  act(() => { element.dispatchEvent(pointer('pointerdown', 100, 100)); });
  for (let i = 1; i <= 6; i += 1) {
    act(() => { window.dispatchEvent(pointer('pointermove', 100 + i * 6, 100 + i * 6)); });
  }
  act(() => { window.dispatchEvent(pointer('pointerup', 136, 136)); });
};

const render = (onSelect: (id: string) => void, selectedId: string | null): void => {
  mount(h(StageSelection, {
    nodes: NODES, scale: 2, selectedId, onSelect,
  }));
};

describe('a press on a stage node selects it, and a drag changes nothing', { tags: ['standard'] }, () => {
  it('writes NOTHING across a whole press/move/release, and leaves the node selected', () => {
    const onSelect = vi.fn();
    render(onSelect, 'hearts');
    drag(boxFor('hearts'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('hearts');
  });

  it('selects on the way down with no threshold, arming and no "select first" rule', () => {
    const onSelect = vi.fn();
    render(onSelect, 'hearts');
    act(() => { boxFor('wallet').dispatchEvent(pointer('pointerdown', 50, 50)); });
    expect(onSelect).toHaveBeenLastCalledWith('wallet');
    act(() => { boxFor('screen').dispatchEvent(pointer('pointerdown', 10, 10)); });
    expect(onSelect).toHaveBeenLastCalledWith('screen');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
