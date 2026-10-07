/* @layer renderer-components @kind component */
/**
 * The document as a tree: screen root → band → container → element, with drag
 * to reparent and reorder.
 *
 * This is the panel that replaced "five handles". A flat model could be edited
 * by dragging five boxes around a stage because there was nothing to be inside
 * of; a tree cannot, because what a player moves is a node's PLACE AMONG ITS
 * SIBLINGS and its parent, and a stage position can express neither.
 *
 * THE DROP IS RESOLVED IN `behavior/drop-intent.ts`, not here and not in the
 * gesture: "before this row" and "inside this row" both have to become a parent
 * id and an index, only the document knows what a row's parent is, and the
 * STAGE has to reach the same answer from a point and a rect. The split this
 * panel used to own ("what was meant" against "what is legal") is still the
 * right split; it just belongs one level down, where both surfaces share it.
 * All this file contributes is which ROW the pointer is over, which is the one
 * question only the DOM can answer.
 *
 * THE SCREEN IS THE FIRST ROW, always, at depth 0, and now it is the ONLY
 * root: §42 folded `regions[]` into its children, so the outline's nesting and
 * the document's nesting are finally the same shape. It is never draggable and
 * never removable, because `node-edits.ts`/`tree-context.ts` answer `null` for its
 * parent. Everything below it drags, including the former regions, which the
 * outline used to refuse because an anchor could not sit inside a flow.
 *
 * EVERY ROW WITH A SUBTREE IS COLLAPSIBLE, independently, default expanded.
 * Collapse state lives in the view store, never the document, because folding a
 * row shut is a fact about how someone is looking at the tree, not about the HUD
 * itself. A collapsed row's descendants are not walked, so `flatten`
 * doubles as the filter.
 *
 * THE ROW LIST IS THE SCROLLER, as of §45. It was the whole rail before, which
 * meant the panel's own label and hint scrolled away with the tree and there was
 * no element the drag's pan band could be drawn on. Now the list scrolls inside
 * the panel, the label and the hint stay put, and the two 24 px bands are sticky
 * children of the list itself. That is the affordance the plan asks for, drawn
 * instead of discovered, because at this width there is no room for a scroll arrow.
 *
 * AND IT IS REACHABLE WITHOUT A POINTER. Four shortcuts on a focused row, the
 * context menu they are learned from, and one `aria-live` region reading the
 * ghost's own words. §38.2 committed this codebase to that and this is the
 * gesture it was written for.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { primaryModifierLabel } from '@shared/platform';
import { usePlatform } from '@app/platform';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { DragGhost } from './DragGhost';
import { OutlineRow } from './OutlineRow';
import { OutlineRowMenu } from './OutlineRowMenu';
import { labelOf, slotsOf } from '../behavior/new-node';
import { siteOf } from '../behavior/node-edits';
import { outlineIntent, zoneIn } from '../behavior/drop-intent';
import { ghostFor } from '../behavior/drop-ghost';
import { useDragGesture } from '../behavior/useDragGesture';
import { useDragAutoScroll } from '../behavior/use-drag-autoscroll';
import { useSpringLoad } from '../behavior/use-spring-load';
import { useOutlineKeys } from '../behavior/use-outline-keys';
import { useOutlineScroll } from '../behavior/use-outline-scroll';
import './HudLayoutEditor.drag.css';
import type { DropIntent, DropZone } from '../behavior/drop-intent';
import type { HudLayout, HudNode } from '@shared/types/hud';

interface OutlineRowModel {
  node: HudNode;
  depth: number;
  /** A direct child of the screen: which cell of the root grid it occupies. */
  cell?: string;
  /** A repeat's own child, or a switch's case/otherwise. Reachable for
   *  selection and editing (phase 7), but not for the outline's drag: neither
   *  sits in a container's own children array, so there is nothing there to
   *  reorder or reparent. */
  locked?: string;
  /** The whole-screen root. It is never dragged, reparented or removed. */
  isScreen?: boolean;
  hasChildren: boolean;
  collapsed: boolean;
}

interface OutlinePanelProps {
  doc: HudLayout;
  selectedId: string | null;
  /** Slot numbers the scheme currently previewing actually reaches. Used only
   *  for the outline's informational note, never to reject a placed slot. */
  slotNumbers: readonly number[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  /** One resolved intent, once, on release. Never a parent and an index, and
   *  never per move. `behavior/drop-intent.ts` owns what it means. */
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
}

/** Real container children, a repeat's own child, or a switch's cases and
 *  `otherwise`, which is anything `flatten` would otherwise walk into. */
const hasSubtree = (node: HudNode): boolean => {
  if (node.kind === 'container') return node.children.length > 0;
  return node.element.type === 'repeat' || node.element.type === 'switch';
};

/** The badge a band carries: where it sits in the screen's own grid. A child
 *  with no `place` is auto-flowed, and has no one cell to name. */
const cellLabel = (node: HudNode): string | undefined => {
  const { column, row } = node.place ?? {};
  return column !== undefined && row !== undefined ? `${column},${row}` : undefined;
};

const flatten = (doc: HudLayout, collapsedIds: ReadonlySet<string>): OutlineRowModel[] => {
  const rows: OutlineRowModel[] = [];
  const visit = (node: HudNode, depth: number, cell?: string, locked?: string): void => {
    const hasChildren = hasSubtree(node);
    const collapsed = hasChildren && collapsedIds.has(node.id);
    rows.push({
      node, depth, cell, locked, hasChildren, collapsed,
    });
    if (collapsed) return;
    if (node.kind === 'container') { node.children.forEach((child) => visit(child, depth + 1)); return; }
    const { element } = node;
    if (element.type === 'repeat') visit(element.child, depth + 1, undefined, 'repeat child');
    else if (element.type === 'switch') {
      element.cases.forEach((c, i) => visit(c.node, depth + 1, undefined, `case ${i + 1}`));
      if (element.otherwise) visit(element.otherwise, depth + 1, undefined, 'otherwise');
    }
  };
  const screenHasChildren = doc.screen.children.length > 0;
  const screenCollapsed = screenHasChildren && collapsedIds.has(doc.screen.id);
  rows.push({
    node: doc.screen, depth: 0, isScreen: true, hasChildren: screenHasChildren, collapsed: screenCollapsed,
  });
  if (!screenCollapsed) doc.screen.children.forEach((child) => visit(child, 1, cellLabel(child)));
  return rows;
};

/** What the pointer is over, right now. Pointer capture means every move
 *  reports on the SOURCE row, so the row under the pointer has to be looked
 *  up instead of received, which is also what makes the drag survive the
 *  pointer leaving the rail. A `locked` row is not a target: a repeat's child
 *  and a switch's case sit in no container's `children` array. */
const rowUnder = (doc: HudLayout, x: number, y: number): { rowId: string; zone: DropZone } | null => {
  const under = document.elementFromPoint(x, y);
  const row = under instanceof Element ? under.closest('[data-outline-row]') : null;
  if (!(row instanceof HTMLElement) || row.dataset.outlineLocked !== undefined) return null;
  const rowId = row.dataset.outlineRow ?? '';
  const site = siteOf(doc, rowId);
  if (!site) return null;
  const box = row.getBoundingClientRect();
  const zone = zoneIn((y - box.top) / (box.height || 1), {
    isContainer: site.node.kind === 'container',
    hasSiblings: site.parent !== null,
  });
  return { rowId, zone };
};

/** The live preview: which row is promising what, and what that would do. */
interface DropPreview { rowId: string; zone: DropZone; intent: DropIntent }

const samePreview = (a: DropPreview, b: DropPreview): boolean =>
  a.rowId === b.rowId && a.zone === b.zone && a.intent.kind === b.intent.kind;

const OutlinePanel = (props: OutlinePanelProps) => {
  const { doc, selectedId, slotNumbers, onSelect, onRemove, onDrop } = props;
  const rowsRef = useRef<HTMLDivElement>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const modifier = primaryModifierLabel(usePlatform().info.os);
  const keys = useOutlineKeys({ doc, onDrop });
  /** The spring is settled from `commit`, which is declared first. A ref is how
   *  the two are wired without either having to be defined before the other. */
  const settle = useRef<((parentId: string | null) => void) | null>(null);
  const drag = useDragGesture<DropPreview>({
    resolve: (event, sourceId) => {
      const at = rowUnder(doc, event.clientX, event.clientY);
      return at ? { ...at, intent: outlineIntent(doc, at.rowId, at.zone, [sourceId]) } : null;
    },
    commit: (preview, sourceId) => {
      // Told BEFORE the drop, so the rows this drag spring-opened on the way
      // past them can go back, all but the one it actually landed in.
      settle.current?.(preview.intent.kind === 'refused' ? null : preview.intent.parentId);
      onDrop([sourceId], preview.intent);
    },
    same: samePreview,
  });
  const dragging = drag.sourceId !== null;
  const spring = useSpringLoad({ doc, active: dragging, rowId: drag.payload?.rowId ?? null });
  settle.current = spring.landed;
  useDragAutoScroll({ active: dragging, anchor: rowsRef });
  const preview = drag.payload && drag.payload.intent.kind !== 'refused' ? drag.payload : null;
  // THE ROW HIGHLIGHT IS NOT THE ANSWER TO A REFUSAL, AND NEVER WAS. §43 removed
  // it on the understanding that this would close the loop: a refused drop now
  // turns the whole card and names BOTH nodes, which is a sentence instead of
  // an absence.
  const ghost = drag.sourceId && drag.payload ? ghostFor(doc, [drag.sourceId], drag.payload.intent) : null;
  const have = new Set(slotNumbers);
  const collapsedNodeIds = useHudEditorViewStore((s) => s.collapsedNodeIds);
  const toggleNodeCollapsed = useHudEditorViewStore((s) => s.toggleNodeCollapsed);
  const expandNodeIds = useHudEditorViewStore((s) => s.expandNodeIds);
  const rowElements = useRef(new Map<string, HTMLElement>());
  const scroll = useOutlineScroll({ doc, selectedId, rowElements, expandNodeIds });

  const select = (id: string): void => { scroll.markSelf(id); onSelect(id); };

  return (
    <Box className="hud-outline">
      <Text className="hud-editor__label">Outline</Text>
      <Box ref={rowsRef} className={`hud-outline__rows${dragging ? ' is-panning' : ''}`}>
        {/* The pan bands, drawn instead of discovered. Zero-height sticky
            children of the scroller itself, so they cost no layout and stay at
            its own edges. At this width there is no room for a scroll arrow,
            and undrawn auto-scroll is the version everyone has met and nobody
            has understood. */}
        <Box className="hud-outline__pan is-up" aria-hidden />
        {flatten(doc, collapsedNodeIds).map((row) => (
          <OutlineRow
            key={row.node.id}
            id={row.node.id}
            label={row.isScreen ? `Screen · ${row.node.id}` : `${labelOf(row.node)} · ${row.node.id}`}
            depth={row.depth}
            kind={row.node.kind}
            cell={row.cell}
            locked={row.locked}
            isScreen={row.isScreen}
            hasChildren={row.hasChildren}
            collapsed={row.collapsed}
            selected={row.node.id === selectedId}
            dragging={drag.sourceId === row.node.id}
            dropZone={preview?.rowId === row.node.id ? preview.zone : null}
            missingSlots={slotsOf(row.node).filter((slot) => !have.has(slot))}
            rowRef={(el) => {
              if (el) rowElements.current.set(row.node.id, el);
              else rowElements.current.delete(row.node.id);
            }}
            springing={spring.pending === row.node.id}
            shaking={keys.shaking === row.node.id}
            onSelect={() => select(row.node.id)}
            onToggleCollapse={() => toggleNodeCollapsed(row.node.id)}
            onRemove={() => onRemove(row.node.id)}
            onDragPointerDown={row.locked || row.isScreen ? undefined : (event) => drag.start(event, row.node.id)}
            onRowKeyDown={row.locked || row.isScreen ? undefined : (event) => keys.onRowKeyDown(row.node.id, event)}
            onOpenMenu={row.locked || row.isScreen ? undefined : () => setMenuId(row.node.id)}
          />
        ))}
        <Box className="hud-outline__pan is-down" aria-hidden />
      </Box>
      {menuId && (
        <OutlineRowMenu
          doc={doc}
          id={menuId}
          anchorRef={{ current: rowElements.current.get(menuId) ?? null }}
          removable
          onStep={(direction) => keys.step(menuId, direction)}
          onRemove={() => onRemove(menuId)}
          onClose={() => setMenuId(null)}
        />
      )}
      <Text className="hud-editor__hint">
        Drag a row onto the top or bottom edge of another to sit beside it, or onto a
        container&apos;s middle to put it inside. The upper half goes first in that container,
        the lower half last. Or move the focused row with {modifier} and the arrow keys, and
        right-click it for the same four in words. Only the screen itself cannot be moved; it is
        the box everything else sits in.
      </Text>
      {/* WRITTEN HERE AND BY NOTHING ELSE. It holds the ghost's lines 1-2, flattened.
          A move that exists only as a repaint is not accessible even when the
          key works. */}
      <Text className="hud-outline__live" role="status" aria-live="polite">{keys.message}</Text>
      <DragGhost model={ghost} />
    </Box>
  );
};

export { OutlinePanel, flatten, rowUnder };
export type { OutlinePanelProps };
