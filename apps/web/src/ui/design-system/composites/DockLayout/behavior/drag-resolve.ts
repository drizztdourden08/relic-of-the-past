/* @layer renderer-components @kind logic */
/**
 * The pure half of a dock drag: what the pointer is over, what the drop would
 * give, and which layout edit a release turns into. The hook feeds it a fresh
 * context on every event; nothing here touches the DOM.
 */
import type { Rect } from '@shared/types/widget-layout';
import type { LayoutEdit } from '../DockLayout.type';
import type { DragContext, DragSource, DragView, Point } from './drag-types';
import { dropZones, hitTarget, inRect } from './hit-target';
import type { DragSubject } from './hit-target';
import { floatingRect, placeFloating } from './place-floating';

/** The box a docked widget floats as when it is let go over the game. */
const FLOAT_BOX = { width: 280, height: 200 } as const;
/** Past this many pixels outside the window, a release pops the widget out. */
const POP_MARGIN = 16;
/** Pointer travel before a press becomes a drag. */
const THRESHOLD = 4;
const GAME_LABEL = 'Play area';

const subjectOf = (source: DragSource): DragSubject =>
  ({ fromKey: source.fromKey, isGame: source.isGame, loneWidget: source.loneWidget });

const isOutside = (client: Point): boolean =>
  client.x < -POP_MARGIN || client.y < -POP_MARGIN
  || client.x > window.innerWidth + POP_MARGIN || client.y > window.innerHeight + POP_MARGIN;

const wantedRect = (source: DragSource, pointer: Point): Rect =>
  ({ x: pointer.x - source.grab.x, y: pointer.y - source.grab.y, width: source.size.width, height: source.size.height });

const otherFloatingRects = (ctx: DragContext, game: Rect, id: string | null): Rect[] =>
  ctx.layout.floating.filter((f) => f.id !== id).map((f) => floatingRect(f, game));

const labelFor = (ctx: DragContext, source: DragSource, swap: boolean, overlay: boolean): string => {
  const base = source.id === null ? GAME_LABEL : ctx.labelOf(source.id);
  if (swap) return `${base} · swap`;
  if (overlay) return `${base} · overlay`;
  return base;
};

/** The pane under the pointer other than the source, for swap mode. */
const paneUnder = (ctx: DragContext, pointer: Point, fromKey: string | null): string | null => {
  const leaf = ctx.laid?.leaves.find((l) => l.node.kind === 'pane' && inRect(pointer, l.rect));
  return leaf && leaf.node.key !== fromKey ? leaf.node.key : null;
};

const viewFor = (ctx: DragContext, source: DragSource, pointer: Point, client: Point, held: { shift: boolean; ctrl: boolean }): DragView => {
  const swap = (ctx.modifiers.swap || held.shift) && !source.isGame && source.fromKey !== null;
  const overlay = ctx.modifiers.overlay || held.ctrl;
  const view: DragView = {
    pointer, label: labelFor(ctx, source, swap, overlay), zones: [], hot: null, preview: null, refused: false,
    swapKey: null, outside: !source.isGame && isOutside(client), swap, overlay,
    floatingRect: source.floating ? wantedRect(source, pointer) : null,
  };
  if (!ctx.laid) return view;
  if (swap) {
    view.swapKey = paneUnder(ctx, pointer, source.fromKey);
    return view;
  }
  const subject = subjectOf(source);
  view.zones = dropZones(ctx.laid, ctx.stage, subject);
  view.hot = hitTarget(pointer, view.zones, ctx.laid, subject);
  if (view.hot && view.hot.kind !== 'float') {
    view.preview = view.hot.preview;
    return view;
  }
  // Over the picture, or over nothing at all with a docked widget: it floats.
  const floats = view.hot?.kind === 'float' || (!source.isGame && source.fromKey !== null);
  if (floats && ctx.gameRect) {
    const wanted = wantedRect(source, pointer);
    const placed = placeFloating(ctx.gameRect, otherFloatingRects(ctx, ctx.gameRect, source.id), wanted);
    view.preview = placed ?? wanted;
    view.refused = placed === null;
  }
  return view;
};

interface DropResult {
  edit?: LayoutEdit;
  popOut?: string;
}

/** The edit a release asks for; an empty result snaps the drag back. */
const resolveDrop = (source: DragSource, view: DragView): DropResult => {
  if (view.outside && source.id !== null) return { popOut: source.id };
  if (view.swap) {
    return view.swapKey && source.fromKey ? { edit: { type: 'swap-panes', keyA: source.fromKey, keyB: view.swapKey } } : {};
  }
  const target = view.hot?.target ?? null;
  if (source.isGame) {
    return target && (target.at === 'outer' || target.at === 'leaf') ? { edit: { type: 'move-game', target } } : {};
  }
  const id = source.id ?? '';
  if (target && target.at !== 'float') return { edit: { type: 'move-widget', id, target, makeRoom: !view.overlay } };
  if (view.preview && !view.refused) return { edit: { type: 'float-widget', id, rect: view.preview } };
  return {};
};

const movedEnough = (start: Point, now: Point): boolean =>
  Math.hypot(now.x - start.x, now.y - start.y) >= THRESHOLD;

export { FLOAT_BOX, movedEnough, resolveDrop, viewFor, wantedRect };
export type { DropResult };
