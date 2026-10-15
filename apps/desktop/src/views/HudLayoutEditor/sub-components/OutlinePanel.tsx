/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { primaryModifierLabel } from '@rotp/input-mapping';
import { usePlatform } from '@drizztdourden08/brock-react';
import { DragGhost } from './DragGhost';
import { OutlineHint } from './OutlineHint';
import { OutlineRow } from './OutlineRow';
import { OutlineMenuHost } from './OutlineMenuHost';
import { labelOf, slotsOf } from '@app/hud-layout-editing/new-node';
import { outlineRows } from '@app/hud-layout-editing/outline-rows';
import { rowRefFor } from '@app/hud-layout-editing/row-ref-for';
import { useOutlineCollapse } from '@app/hud-layout-editing/useOutlineCollapse';
import { useOutlineDrag } from '@app/hud-layout-editing/useOutlineDrag';
import { useOutlineKeys } from '@app/hud-layout-editing/useOutlineKeys';
import { useOutlineScroll } from '@app/hud-layout-editing/useOutlineScroll';
import type { OutlinePanelProps } from './OutlinePanel.type';

const OutlinePanel = (props: OutlinePanelProps) => {
  const { doc, selectedId, slotNumbers, onSelect, onRemove, onDrop } = props;
  const rowsRef = useRef<HTMLDivElement>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const modifier = primaryModifierLabel(usePlatform().info.os);
  const keys = useOutlineKeys({ doc, onDrop });
  const { drag, spring, dragging, preview, ghost } = useOutlineDrag({ doc, onDrop, rowsRef });
  const { collapsedNodeIds, toggleNodeCollapsed, expandNodeIds } = useOutlineCollapse();
  const rowElements = useRef(new Map<string, HTMLElement>());
  const scroll = useOutlineScroll({ doc, selectedId, rowElements, expandNodeIds });

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
            missingSlots={slotsOf(row.node).filter((slot) => !slotNumbers.includes(slot))}
            rowRef={rowRefFor(rowElements.current, row.node.id)}
            springing={spring.pending === row.node.id}
            shaking={keys.shaking === row.node.id}
            onSelect={() => { scroll.markSelf(row.node.id); onSelect(row.node.id); }}
            onToggleCollapse={() => toggleNodeCollapsed(row.node.id)}
            onRemove={() => onRemove(row.node.id)}
            onDragPointerDown={row.locked || row.isScreen ? undefined : (event) => drag.start(event, row.node.id)}
            onRowKeyDown={row.locked || row.isScreen ? undefined : (event) => keys.onRowKeyDown(row.node.id, event)}
            onOpenMenu={row.locked || row.isScreen ? undefined : () => setMenuId(row.node.id)}
          />
        ))}
        <Box className="hud-outline__pan is-down" aria-hidden />
      </Box>
      <OutlineMenuHost
        doc={doc}
        menuId={menuId}
        anchor={menuId ? rowElements.current.get(menuId) ?? null : null}
        onStep={keys.step}
        onRemove={onRemove}
        onClose={() => setMenuId(null)}
      />
      <OutlineHint modifier={modifier} />
      <Text className="hud-outline__live" role="status" aria-live="polite">{keys.message}</Text>
      <DragGhost model={ghost} />
    </Box>
  );
};

export { OutlinePanel };
