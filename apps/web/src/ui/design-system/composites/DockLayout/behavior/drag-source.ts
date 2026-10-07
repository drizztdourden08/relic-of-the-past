/* @layer renderer-components @kind logic */
/**
 * Reads what a pointer went down on: a widget's title bar (data-drag-widget,
 * with its pane in data-pane-key), one tab chip inside it (data-drag-tab), or
 * the game's grip (data-drag-game). Buttons in the title bar never start a
 * drag, except a tab chip, which is one.
 */
import type { PaneNode, Rect } from '@shared/types/widget-layout';
import { FLOAT_BOX } from './drag-resolve';
import type { DragContext, DragSource, Point } from './drag-types';
import { floatingRect } from './place-floating';

const HANDLE_SELECTOR = '[data-drag-tab],[data-drag-widget],[data-drag-game]';

/** The drag handle under the target, or null when the press is not a drag. */
const handleOf = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof Element)) return null;
  const button = target.closest('button');
  if (button && !button.hasAttribute('data-drag-tab')) return null;
  return target.closest<HTMLElement>(HANDLE_SELECTOR);
};

const paneKeyOf = (handle: HTMLElement): string | null => {
  const key = handle.closest<HTMLElement>('[data-pane-key]')?.dataset.paneKey ?? '';
  return key === '' ? null : key;
};

/** Where the pointer sits on the handle, so the floated box keeps that spot under it. */
const grabOn = (handle: HTMLElement, stageOrigin: Point, point: Point, size: { width: number; height: number }): Point => {
  const box = handle.getBoundingClientRect();
  const dx = point.x - (box.left - stageOrigin.x);
  const dy = point.y - (box.top - stageOrigin.y);
  return { x: Math.max(0, Math.min(dx, size.width)), y: Math.max(0, Math.min(dy, size.height)) };
};

const grabIn = (rect: Rect, point: Point): Point => ({ x: point.x - rect.x, y: point.y - rect.y });

const sourceFrom = (handle: HTMLElement, ctx: DragContext, stageOrigin: Point, point: Point): DragSource | null => {
  if (handle.dataset.dragGame !== undefined) {
    return {
      id: null, isGame: true, fromKey: 'game', fromTab: false, floating: null, loneWidget: false,
      start: point, grab: { x: 0, y: 0 }, size: FLOAT_BOX,
    };
  }
  const fromTab = handle.dataset.dragTab !== undefined;
  const id = fromTab ? handle.dataset.dragTab : handle.dataset.dragWidget;
  if (!id) return null;
  const fromKey = paneKeyOf(handle);
  const floating = fromKey === null ? ctx.layout.floating.find((f) => f.id === id) ?? null : null;
  const pane = fromKey ? ctx.laid?.leaves.find((l) => l.node.key === fromKey)?.node as PaneNode | undefined : undefined;
  const size = floating ? { width: floating.width, height: floating.height } : FLOAT_BOX;
  const grab = floating && ctx.gameRect
    ? grabIn(floatingRect(floating, ctx.gameRect), point)
    : grabOn(handle, stageOrigin, point, size);
  return {
    id, isGame: false, fromKey, fromTab, floating, loneWidget: pane?.widgets.length === 1,
    start: point, grab, size,
  };
};

export { handleOf, sourceFrom };
