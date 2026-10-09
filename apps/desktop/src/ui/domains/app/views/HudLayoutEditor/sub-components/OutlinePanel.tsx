/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { primaryModifierLabel } from '@shared/platform';
import { usePlatform } from '@app/platform';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { DragGhost } from './DragGhost';
import { OutlineRow } from './OutlineRow';
import { OutlineRowMenu } from './OutlineRowMenu';
import { labelOf, slotsOf } from '../behavior/new-node';
import { outlineIntent } from '../behavior/drop-intent';
import { ghostFor } from '../behavior/drop-ghost';
import { outlineRows } from '../behavior/outline-rows';
import { rowUnder } from '../behavior/row-under';
import { useDragGesture } from '../behavior/useDragGesture';
import { useDragAutoScroll } from '../behavior/use-drag-autoscroll';
import { useSpringLoad } from '../behavior/useSpringLoad';
import { useOutlineKeys } from '../behavior/useOutlineKeys';
import { useOutlineScroll } from '../behavior/useOutlineScroll';
import './HudLayoutEditor.drag.css';
import type { DropPreview, OutlinePanelProps } from './OutlinePanel.type';

const samePreview = (a: DropPreview, b: DropPreview): boolean =>
  a.rowId === b.rowId && a.zone === b.zone && a.intent.kind === b.intent.kind;

const OutlinePanel = (props: OutlinePanelProps) => {
  const { doc, selectedId, slotNumbers, onSelect, onRemove, onDrop } = props;
  const rowsRef = useRef<HTMLDivElement>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const modifier = primaryModifierLabel(usePlatform().info.os);
  const keys = useOutlineKeys({ doc, onDrop });
  const settle = useRef<((parentId: string | null) => void) | null>(null);
  const drag = useDragGesture<DropPreview>({
    resolve: (event, sourceId) => {
      const at = rowUnder(doc, event.clientX, event.clientY);
      return at ? { ...at, intent: outlineIntent(doc, at.rowId, at.zone, [sourceId]) } : null;
    },
    commit: (preview, sourceId) => {
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
        <Box className="hud-outline__pan is-up" aria-hidden />
        {outlineRows(doc, collapsedNodeIds).map((row) => (
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
      <Text className="hud-outline__live" role="status" aria-live="polite">{keys.message}</Text>
      <DragGhost model={ghost} />
    </Box>
  );
};

export { OutlinePanel };
export type { OutlinePanelProps } from './OutlinePanel.type';
